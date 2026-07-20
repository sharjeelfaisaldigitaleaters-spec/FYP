from supabase import create_client, Client
from app.config import settings
import logging

logger = logging.getLogger("app.database")

# Initialize Supabase client
try:
    supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
except Exception as e:
    logger.error(f"Failed to initialize Supabase client: {e}")
    supabase = None

def get_supabase() -> Client:
    """Returns the supabase client instance."""
    if not supabase:
        raise RuntimeError("Supabase client is not initialized. Check your environment variables.")
    return supabase

def search_persona_memories(user_id: str, persona_id: str, query_embedding: list, match_threshold: float = 0.5, match_count: int = 5):
    """
    Invokes Supabase RPC pgvector matching function, scoped to a single persona.
    Requires SQL function match_memories_v2 to be registered in Supabase — each
    persona only ever draws on memories tagged to it, never another persona's.
    """
    client = get_supabase()
    try:
        response = client.rpc(
            "match_memories_v2",
            {
                "query_embedding": query_embedding,
                "match_threshold": match_threshold,
                "match_count": match_count,
                "filter_user_id": user_id,
                "filter_persona_id": persona_id
            }
        ).execute()
        return response.data
    except Exception as e:
        logger.error(f"Error during pgvector search: {e}")
        # Fallback to general lookup without semantic score if RPC fails
        try:
            fallback = (
                client.table("memories")
                .select("*")
                .eq("user_id", user_id)
                .eq("persona_id", persona_id)
                .limit(match_count)
                .execute()
            )
            return fallback.data
        except Exception as err:
            logger.error(f"Fallback database search failed: {err}")
            return []
