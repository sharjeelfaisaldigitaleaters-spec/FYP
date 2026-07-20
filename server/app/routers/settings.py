from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user
from pydantic import BaseModel, EmailStr
from app.database import get_supabase
from typing import Optional

router = APIRouter(prefix="/settings", tags=["Settings"])

class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None

class NotificationSettingsRequest(BaseModel):
    new_story: bool
    family_activity: bool
    ai_processing: bool
    weekly_digest: bool

@router.get("")
def get_user_settings(user: dict = Depends(get_current_user)):
    """Retrieves user settings configuration."""
    client = get_supabase()
    try:
        profile_res = client.table("profiles").select("*").eq("id", user["id"]).execute()
        settings_res = client.table("user_settings").select("*").eq("user_id", user["id"]).execute()
        return {
            "profile": profile_res.data[0] if profile_res.data else {},
            "preferences": settings_res.data[0] if settings_res.data else {}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database retrieval failed: {e}")

@router.put("/profile")
def update_user_profile(request: ProfileUpdateRequest, user: dict = Depends(get_current_user)):
    """Updates active user profile fields."""
    client = get_supabase()
    update_data = {k: v for k, v in request.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No values provided for update.")
    try:
        response = client.table("profiles").update(update_data).eq("id", user["id"]).execute()
        return {"status": "success", "profile": response.data[0] if response.data else {}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {e}")

@router.put("/notifications")
def update_notification_preferences(request: NotificationSettingsRequest, user: dict = Depends(get_current_user)):
    """Updates user notification toggles."""
    client = get_supabase()
    try:
        response = client.table("user_settings").upsert({
            "user_id": user["id"],
            "new_story": request.new_story,
            "family_activity": request.family_activity,
            "ai_processing": request.ai_processing,
            "weekly_digest": request.weekly_digest
        }).execute()
        return {"status": "success", "preferences": response.data[0] if response.data else {}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save preferences: {e}")
