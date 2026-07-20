from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body
from fastapi.responses import StreamingResponse
from app.core.security import get_current_user
from app.services.stt_engine import transcribe_audio
from app.services.rag_engine import run_conversational_pipeline
from app.services.transliterate_engine import transliterate_roman_to_urdu
from app.services.voice_engine import stream_tts, add_cloned_voice
from app.database import get_supabase
import json
import base64
import os
import uuid as uuid_lib
from pydantic import BaseModel
from typing import Optional, List
import logging

router = APIRouter(prefix="/conversation", tags=["Conversations"])
logger = logging.getLogger("app.routers.conversation")


# ── Helpers ──────────────────────────────────────────────────────────────────

def is_valid_uuid(value: str) -> bool:
    try:
        uuid_lib.UUID(str(value))
        return True
    except ValueError:
        return False


# ── Schema ───────────────────────────────────────────────────────────────────

class PersonaCreate(BaseModel):
    name: str
    relation: str
    voice_id: Optional[str] = None
    survey_data: dict
    persona_id: Optional[str] = None


# ── Persona Endpoints ─────────────────────────────────────────────────────────

@router.get("/personas")
def get_user_personas(user: dict = Depends(get_current_user)):
    """Get all personas for the logged-in user, each with a real memory count."""
    client = get_supabase()
    try:
        response = client.table("personas").select("*").eq("user_id", user["id"]).execute()
        for p in response.data:
            try:
                count_resp = (
                    client.table("memories")
                    .select("id", count="exact")
                    .eq("persona_id", p["id"])
                    .execute()
                )
                p["memoriesCount"] = count_resp.count or 0
            except Exception:
                p["memoriesCount"] = 0
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch personas: {e}")


@router.get("/personas/{persona_id}")
def get_persona(persona_id: str, user: dict = Depends(get_current_user)):
    """Fetch a single persona owned by the current user (for the edit flow)."""
    client = get_supabase()
    try:
        response = (
            client.table("personas")
            .select("*")
            .eq("id", persona_id)
            .eq("user_id", user["id"])
            .execute()
        )
        if not response.data:
            raise HTTPException(status_code=404, detail="Persona not found.")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch persona: {e}")


@router.post("/personas")
def create_or_update_persona(request: PersonaCreate, user: dict = Depends(get_current_user)):
    """
    Create a new persona, or update an existing one if `persona_id` is given.
    Every account can build multiple personalities — unlike before, saving the
    survey never silently overwrites a different persona.
    """
    client = get_supabase()
    try:
        if request.persona_id:
            existing = (
                client.table("personas")
                .select("id, voice_id")
                .eq("id", request.persona_id)
                .eq("user_id", user["id"])
                .execute()
            )
            if not existing.data:
                raise HTTPException(status_code=404, detail="Persona not found or access denied.")
            response = client.table("personas").update({
                "name": request.name,
                "relation": request.relation,
                "voice_id": request.voice_id or existing.data[0].get("voice_id"),
                "survey_data": request.survey_data
            }).eq("id", request.persona_id).execute()
        else:
            persona_id = str(uuid_lib.uuid4())
            response = client.table("personas").insert({
                "id": persona_id,
                "user_id": user["id"],
                "name": request.name,
                "relation": request.relation,
                "voice_id": request.voice_id,
                "survey_data": request.survey_data
            }).execute()

        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save persona: {e}")


@router.delete("/personas/{persona_id}")
async def delete_persona(persona_id: str, user: dict = Depends(get_current_user)):
    """Delete a persona and everything scoped to it: sessions, messages, memories, cloned voice."""
    client = get_supabase()
    try:
        persona_resp = (
            client.table("personas")
            .select("id, voice_id")
            .eq("id", persona_id)
            .eq("user_id", user["id"])
            .execute()
        )
        if not persona_resp.data:
            raise HTTPException(status_code=404, detail="Persona not found or access denied.")
        voice_id = persona_resp.data[0].get("voice_id")

        sessions_resp = client.table("chat_sessions").select("id").eq("persona_id", persona_id).execute()
        session_ids = [s["id"] for s in (sessions_resp.data or [])]
        for session_id in session_ids:
            client.table("messages").delete().eq("session_id", session_id).execute()
        if session_ids:
            client.table("chat_sessions").delete().eq("persona_id", persona_id).execute()

        client.table("memories").delete().eq("persona_id", persona_id).execute()

        if voice_id:
            try:
                from elevenlabs.client import AsyncElevenLabs
                from app.config import settings
                el_client = AsyncElevenLabs(api_key=settings.ELEVENLABS_API_KEY)
                await el_client.voices.delete(voice_id=voice_id)
            except Exception as e:
                logger.warning(f"Could not delete voice from ElevenLabs: {e}")

        client.table("personas").delete().eq("id", persona_id).execute()

        return {"success": True, "message": "Persona and all associated data deleted."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete persona: {e}")


# ── Session Endpoints ─────────────────────────────────────────────────────────

@router.post("/sessions")
def create_session(persona_id: str = Body(..., embed=True), user: dict = Depends(get_current_user)):
    """Create a new chat session for a persona. Returns the session with a valid UUID."""
    client = get_supabase()
    try:
        session_id = str(uuid_lib.uuid4())
        result = client.table("chat_sessions").insert({
            "id": session_id,
            "persona_id": persona_id
        }).execute()
        return result.data[0] if result.data else {"id": session_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create session: {e}")


@router.get("/sessions")
def get_sessions(persona_id: str, user: dict = Depends(get_current_user)):
    """Get all chat sessions for a persona, most recent first."""
    client = get_supabase()
    try:
        result = (
            client.table("chat_sessions")
            .select("*")
            .eq("persona_id", persona_id)
            .order("created_at", desc=True)
            .limit(20)
            .execute()
        )
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch sessions: {e}")


@router.get("/messages/{session_id}")
def get_session_messages(session_id: str, user: dict = Depends(get_current_user)):
    """Get all messages for a session, oldest first."""
    client = get_supabase()
    try:
        result = (
            client.table("messages")
            .select("id, type, content, created_at")
            .eq("session_id", session_id)
            .order("created_at", desc=False)
            .limit(100)
            .execute()
        )
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch messages: {e}")


# ── Voice Clone Endpoint ──────────────────────────────────────────────────────

@router.post("/clone-voice")
async def clone_voice(
    persona_id: str = Form(...),
    voice_name: str = Form(...),
    audio_files: List[UploadFile] = File(...),
    user: dict = Depends(get_current_user)
):
    """Upload audio samples and clone the persona's voice. Saves voice_id to Supabase."""
    client = get_supabase()
    temp_paths = []

    try:
        persona_resp = (
            client.table("personas")
            .select("id, name")
            .eq("id", persona_id)
            .eq("user_id", user["id"])
            .execute()
        )
        if not persona_resp.data:
            raise HTTPException(status_code=404, detail="Persona not found or access denied.")

        for audio_file in audio_files:
            ext = os.path.splitext(audio_file.filename or "sample")[1] or ".mp3"
            temp_path = f"temp_voice_{uuid_lib.uuid4()}{ext}"
            content = await audio_file.read()
            with open(temp_path, "wb") as f:
                f.write(content)
            temp_paths.append(temp_path)

        if not temp_paths:
            raise HTTPException(status_code=400, detail="No audio files uploaded.")

        voice_id = await add_cloned_voice(
            name=voice_name,
            file_paths=temp_paths,
            description=f"Memory Keeper persona: {voice_name}"
        )

        client.table("personas").update({"voice_id": voice_id}).eq("id", persona_id).execute()

        return {
            "voice_id": voice_id,
            "persona_id": persona_id,
            "message": f"Voice for '{voice_name}' cloned and linked successfully."
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice cloning failed: {str(e)}")
    finally:
        for path in temp_paths:
            try:
                if os.path.exists(path):
                    os.remove(path)
            except Exception:
                pass


# ── Delete Voice Clone (for retry) ───────────────────────────────────────────

@router.delete("/clone-voice/{voice_id}")
async def delete_cloned_voice(
    voice_id: str,
    persona_id: str,
    user: dict = Depends(get_current_user)
):
    """
    Delete a cloned voice from ElevenLabs and unlink from persona.
    Used when user wants to try voice cloning again.
    """
    from elevenlabs.client import AsyncElevenLabs
    from app.config import settings
    client = get_supabase()
    try:
        # Verify persona belongs to user
        persona_resp = (
            client.table("personas")
            .select("id")
            .eq("id", persona_id)
            .eq("user_id", user["id"])
            .execute()
        )
        if not persona_resp.data:
            raise HTTPException(status_code=404, detail="Persona not found.")

        # Delete from ElevenLabs
        try:
            el_client = AsyncElevenLabs(api_key=settings.ELEVENLABS_API_KEY)
            await el_client.voices.delete(voice_id=voice_id)
        except Exception as e:
            logger.warning(f"Could not delete voice from ElevenLabs: {e}")

        # Unlink from persona in DB
        client.table("personas").update({"voice_id": None}).eq("id", persona_id).execute()

        return {"success": True, "message": "Voice deleted. You can now clone a new voice."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete voice: {str(e)}")


# ── Voice Test (post-clone verification) ─────────────────────────────────────

@router.post("/speak-test")
async def speak_test(
    persona_id: str = Body(..., embed=True),
    user: dict = Depends(get_current_user)
):
    """
    Generate a short test audio sample with the cloned voice.
    Used on the post-clone verification screen.
    """
    client = get_supabase()
    try:
        persona = (
            client.table("personas")
            .select("voice_id, name")
            .eq("id", persona_id)
            .eq("user_id", user["id"])
            .execute()
        )
        if not persona.data:
            raise HTTPException(404, "Persona not found.")

        voice_id = persona.data[0].get("voice_id")
        name = persona.data[0].get("name", "there")
        if not voice_id:
            raise HTTPException(400, "No cloned voice found for this persona.")

        test_text = f"Hello, my name is {name}. How are you doing today? I hope everything is going well."

        full_audio = b""
        async for chunk in stream_tts(test_text, voice_id):
            full_audio += chunk

        if not full_audio:
            raise HTTPException(500, "TTS generated no audio for test.")

        return {"audio": base64.b64encode(full_audio).decode("utf-8"), "text": test_text}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice test failed: {str(e)}")


# ── On-Demand TTS (for chat message playback) ─────────────────────────────────

@router.post("/speak")
async def speak_text(
    persona_id: str = Form(...),
    text: str = Form(...),
    user: dict = Depends(get_current_user)
):
    """
    Convert a text message to speech using the persona's cloned voice.
    Used for per-message playback in Chat mode.
    Returns base64 encoded MP3 audio.
    """
    client = get_supabase()
    try:
        persona = (
            client.table("personas")
            .select("voice_id, name")
            .eq("id", persona_id)
            .eq("user_id", user["id"])
            .execute()
        )
        if not persona.data:
            raise HTTPException(404, "Persona not found.")

        voice_id = persona.data[0].get("voice_id")
        if not voice_id:
            raise HTTPException(400, "No voice configured. Please set up Voice Clone first.")

        # Transliterate Roman Urdu → Urdu script for TTS
        try:
            urdu_text = transliterate_roman_to_urdu(text)
        except Exception:
            urdu_text = text  # If transliteration fails, use original

        full_audio = b""
        async for chunk in stream_tts(urdu_text, voice_id):
            full_audio += chunk

        if not full_audio:
            raise HTTPException(500, "TTS generated no audio.")

        return {"audio": base64.b64encode(full_audio).decode("utf-8")}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"TTS failed: {str(e)}")


# ── Main Chat Streaming Endpoint ──────────────────────────────────────────────

@router.post("/chat")
async def chat_stream(
    persona_id: str = Form(...),
    session_id: str = Form(...),
    text_query: str = Form(None),
    audio_file: UploadFile = File(None),
    user: dict = Depends(get_current_user)
):
    """
    Core RAG streaming endpoint.
    - Accepts text or voice input
    - Streams Roman Urdu text tokens via SSE
    - In call mode: also streams Urdu audio chunks
    """
    # 1. Validate session_id is a proper UUID
    if not is_valid_uuid(session_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid session_id. Please use a valid UUID session. Call POST /sessions first."
        )

    # 2. Process voice input via Whisper STT if audio was sent
    query = text_query or ""
    temp_audio_path = None
    if audio_file:
        try:
            file_extension = os.path.splitext(audio_file.filename or "rec")[1] or ".wav"
            temp_audio_path = f"temp_input_{uuid_lib.uuid4()}{file_extension}"
            with open(temp_audio_path, "wb") as f:
                f.write(await audio_file.read())
            query = transcribe_audio(temp_audio_path)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to transcribe audio: {e}")
        finally:
            if temp_audio_path and os.path.exists(temp_audio_path):
                os.remove(temp_audio_path)

    if not query.strip():
        raise HTTPException(status_code=400, detail="No text or audio query provided.")

    # 3. Fetch voice_id and resolve real persona_id
    supabase = get_supabase()
    voice_id = None
    actual_persona_id = persona_id

    try:
        if persona_id.startswith("p"):  # Demo persona fallback
            p_resp = (
                supabase.table("personas")
                .select("id, voice_id")
                .eq("user_id", user["id"])
                .execute()
            )
            if p_resp.data:
                actual_persona_id = p_resp.data[0]["id"]
                voice_id = p_resp.data[0].get("voice_id")
        else:
            p_resp = (
                supabase.table("personas")
                .select("voice_id")
                .eq("id", persona_id)
                .execute()
            )
            if p_resp.data:
                voice_id = p_resp.data[0].get("voice_id")
    except Exception:
        pass

    # 4. Ensure session exists in chat_sessions table
    try:
        session_check = (
            supabase.table("chat_sessions")
            .select("id")
            .eq("id", session_id)
            .execute()
        )
        if not session_check.data:
            supabase.table("chat_sessions").insert({
                "id": session_id,
                "persona_id": actual_persona_id
            }).execute()
    except Exception as e:
        pass  # Don't block chat if session management fails

    # 5. Stream SSE response
    async def event_generator():
        yield f"data: {json.dumps({'type': 'input', 'text': query})}\n\n"

        full_reply = ""
        had_service_error = False
        async for kind, chunk_text in run_conversational_pipeline(
            user_id=user["id"],
            persona_id=actual_persona_id,
            session_id=session_id,
            query_text=query
        ):
            if kind == "error":
                had_service_error = True
                yield f"data: {json.dumps({'type': 'service_error', 'message': 'AI service error. Please check your Groq API key in server/.env'})}\n\n"
                break
            full_reply += chunk_text
            yield f"data: {json.dumps({'type': 'text', 'delta': chunk_text})}\n\n"

        if had_service_error:
            yield "data: [DONE]\n\n"
            return

        # Generate audio only if voice is configured (for call mode)
        if voice_id:
            try:
                urdu_script = transliterate_roman_to_urdu(full_reply)
                full_audio = b""
                async for audio_chunk in stream_tts(urdu_script, voice_id):
                    full_audio += audio_chunk

                if full_audio:
                    b64_audio = base64.b64encode(full_audio).decode("utf-8")
                    yield f"data: {json.dumps({'type': 'audio', 'chunk': b64_audio})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'type': 'audio_error', 'message': str(e)})}\n\n"
        else:
            yield f"data: {json.dumps({'type': 'no_voice'})}\n\n"

        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
