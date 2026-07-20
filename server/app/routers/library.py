from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user
from app.models.memory import MemoryCreate, MemoryResponse, StoryResponse
from app.database import get_supabase
import uuid

router = APIRouter(prefix="/library", tags=["Library"])

@router.get("/stats")
def get_user_stats(user: dict = Depends(get_current_user)):
    """Retrieves high level counts of user content for the overview."""
    client = get_supabase()
    try:
        memories = client.table("memories").select("id", count="exact").eq("user_id", user["id"]).execute()
        stories = client.table("stories").select("id", count="exact").eq("user_id", user["id"]).execute()
        family = client.table("family_members").select("id", count="exact").eq("user_id", user["id"]).execute()
        
        return {
            "memoriesUploaded": memories.count if memories.count is not None else len(memories.data or []),
            "storiesSaved": stories.count if stories.count is not None else len(stories.data or []),
            "conversations": 0, # Placeholder for now
            "familyMembers": family.count if family.count is not None else len(family.data or [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {e}")

@router.get("/memories", response_model=list[MemoryResponse])
def get_user_memories(user: dict = Depends(get_current_user)):
    """Retrieves all memories uploaded by the current user."""
    client = get_supabase()
    try:
        response = client.table("memories").select("*").eq("user_id", user["id"]).order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query failed: {e}")

@router.delete("/memories/{memory_id}")
def delete_user_memory(memory_id: str, user: dict = Depends(get_current_user)):
    """Deletes specific user memory."""
    client = get_supabase()
    try:
        # Verify ownership
        check = client.table("memories").select("user_id").eq("id", memory_id).execute()
        if not check.data or check.data[0]["user_id"] != user["id"]:
            raise HTTPException(status_code=403, detail="Not authorized to delete this memory.")

        client.table("memories").delete().eq("id", memory_id).execute()
        return {"status": "success", "message": "Memory deleted."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database transaction failed: {e}")

@router.get("/stories", response_model=list[StoryResponse])
def get_user_stories(user: dict = Depends(get_current_user)):
    """Retrieves all stories generated for the current user."""
    client = get_supabase()
    try:
        response = client.table("stories").select("*").eq("user_id", user["id"]).order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query failed: {e}")

@router.post("/stories/favorite/{story_id}")
def toggle_favorite_story(story_id: str, user: dict = Depends(get_current_user)):
    """Toggles favorite flag for a story."""
    client = get_supabase()
    try:
        # Check current favorite status
        check = client.table("stories").select("user_id", "is_favorite").eq("id", story_id).execute()
        if not check.data or check.data[0]["user_id"] != user["id"]:
            raise HTTPException(status_code=403, detail="Not authorized to modify this story.")

        new_status = not check.data[0]["is_favorite"]
        client.table("stories").update({"is_favorite": new_status}).eq("id", story_id).execute()
        return {"status": "success", "is_favorite": new_status}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database update failed: {e}")
