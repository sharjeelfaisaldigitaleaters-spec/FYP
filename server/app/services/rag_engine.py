import logging
from app.config import settings
from app.database import get_supabase, search_persona_memories
from groq import Groq
from typing import AsyncGenerator
import json

logger = logging.getLogger("app.services.rag")

# Initialize SentenceTransformer globally
embedder = None
try:
    from sentence_transformers import SentenceTransformer
    logger.info("Loading sentence-transformers model 'all-MiniLM-L6-v2'...")
    embedder = SentenceTransformer("all-MiniLM-L6-v2")
except Exception as e:
    logger.warning(f"Could not load sentence-transformers: {e}. Semantic search will use mock embeddings.")

def get_text_embedding(text: str) -> list[float]:
    """Generates 384-dimensional vector embedding for the input text."""
    if embedder:
        try:
            vector = embedder.encode(text).tolist()
            return vector
        except Exception as e:
            logger.error(f"Failed to generate embedding: {e}")
    return [0.0] * 384

def build_system_prompt(persona_name: str, persona_relation: str, survey_data: dict, memories_context: str) -> str:
    """
    Builds a system prompt ENTIRELY from survey answers.
    No hardcoded personality traits. Every word comes from what the user described.
    """
    # Map each survey question to its answer for structured access
    s = survey_data

    # Build the core personality briefing from survey answers
    personality_lines = []
    for question, answer in s.items():
        if answer and str(answer).strip():
            personality_lines.append(f"  - {question}\n    Answer: {answer}")

    personality_block = "\n".join(personality_lines) if personality_lines else "  (No survey details provided)"

    prompt = f"""You are roleplaying as a digital replica of a real person named '{persona_name}'.
The person interacting with you is their '{persona_relation}'.

IMPORTANT: You are NOT an AI assistant. You ARE {persona_name}. Speak exactly as they would speak.
Do NOT mention being an AI, do NOT break character, do NOT add any phrases not described below.

=== WHO YOU ARE: {persona_name} ===
Everything below was described by someone who knew {persona_name} deeply.
You must speak, respond, and behave EXACTLY as described. Nothing more, nothing less.

{personality_block}

=== RELEVANT MEMORIES ===
{memories_context if memories_context else '(No specific memories available)'}

=== STRICT LANGUAGE RULE ===
Respond ONLY in casual Roman Urdu/Hindi (Urdu written in English/Latin letters, e.g. 'kya haal hai', 'main theek hoon', 'sun yaar').
Never use Arabic/Urdu script. Never reply in standard English.
Keep responses natural, conversational, and human — short sentences, natural pauses.

=== CRITICAL ===
Use ONLY the personality described in the survey above.
Do NOT add words, phrases, nicknames, or habits not described there.
If the survey says how they addressed people — use that. If it does not say — use their name."""

    return prompt


async def run_conversational_pipeline(
    user_id: str,
    persona_id: str,
    session_id: str,
    query_text: str
) -> AsyncGenerator[tuple[str, str], None]:
    """
    Executes RAG pipeline:
    1. Embeds query text.
    2. Performs pgvector search on user memories.
    3. Fetches target persona survey settings.
    4. Builds system prompt from survey only.
    5. Calls Groq Llama 3.3 for Roman Urdu streaming response.
    6. Saves turn to database.

    Yields ("text", delta) chunks for normal reply content, or a single
    ("error", message) if the Groq call fails — callers must not render
    "error" chunks as if the persona said them.
    """
    client = get_supabase()

    # Step 1: Get query embedding
    query_embedding = get_text_embedding(query_text)

    # Step 2: Semantic lookup of memories
    memories_context = ""
    try:
        similar_memories = search_persona_memories(user_id, persona_id, query_embedding, match_threshold=0.3, match_count=3)
        if similar_memories:
            memories_context = "\n".join([
                f"- Memory Title: {m.get('title')}\n  Details: {m.get('content') or m.get('title')}"
                for m in similar_memories
            ])
    except Exception as e:
        logger.error(f"RAG memories search failed: {e}")

    # Step 3: Fetch Persona Profile Survey
    persona_data = {}
    persona_name = "the person"
    persona_relation = "loved one"
    try:
        response = client.table("personas").select("*").eq("id", persona_id).execute()
        if response.data:
            p = response.data[0]
            persona_name = p.get("name", persona_name)
            persona_relation = p.get("relation", persona_relation)
            if p.get("survey_data"):
                persona_data = json.loads(p["survey_data"]) if isinstance(p["survey_data"], str) else p["survey_data"]
    except Exception as e:
        logger.error(f"RAG persona fetch failed: {e}")

    # Step 4: Build system prompt purely from survey
    system_prompt = build_system_prompt(persona_name, persona_relation, persona_data, memories_context)

    # Step 5: Streaming chat completion via Groq
    full_response_text = ""
    service_error = False
    try:
        groq_client = Groq(api_key=settings.GROQ_API_KEY)
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": query_text}
            ],
            temperature=0.70,
            max_tokens=400,
            stream=True
        )

        for chunk in completion:
            content = chunk.choices[0].delta.content
            if content:
                full_response_text += content
                yield ("text", content)

    except Exception as e:
        # Do NOT yield the error as chat text — it would leak into the
        # conversation as if the persona said it. The router surfaces this
        # via a dedicated `service_error` SSE event instead.
        logger.error(f"Groq API streaming failed: {e}")
        service_error = True
        yield ("error", str(e))

    # Step 6: Save conversation turn to DB (skip the AI turn if Groq errored —
    # there's no real reply to persist, and we don't want a blank/error row
    # showing up as if the persona said something)
    try:
        client.table("messages").insert({
            "session_id": session_id,
            "type": "user",
            "content": query_text
        }).execute()
        if not service_error and full_response_text.strip():
            turn_embedding = get_text_embedding(full_response_text)
            client.table("messages").insert({
                "session_id": session_id,
                "type": "ai",
                "content": full_response_text,
                "embedding": turn_embedding
            }).execute()
    except Exception as e:
        logger.error(f"Failed to save chat message history: {e}")
