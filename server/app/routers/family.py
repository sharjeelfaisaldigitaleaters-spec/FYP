from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user
from app.models.user import FamilyMemberCreate, FamilyMemberResponse
from app.database import get_supabase
import uuid

router = APIRouter(prefix="/family", tags=["Family Vault"])

@router.get("/members", response_model=list[FamilyMemberResponse])
def get_family_members(user: dict = Depends(get_current_user)):
    """Lists all family vault members associated with the active user."""
    client = get_supabase()
    try:
        response = client.table("family_members").select("*").eq("user_id", user["id"]).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query failed: {e}")

@router.post("/invite", response_model=FamilyMemberResponse)
def invite_family_member(request: FamilyMemberCreate, user: dict = Depends(get_current_user)):
    """Sends / registers a pending vault invitation."""
    client = get_supabase()
    member_id = str(uuid.uuid4())
    data = {
        "id": member_id,
        "user_id": user["id"],
        "name": request.name,
        "email": request.email,
        "role": request.role,
        "avatar": request.avatar,
        "status": "pending"
    }
    try:
        response = client.table("family_members").insert(data).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to save invitation.")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database transaction failed: {e}")

@router.delete("/members/{member_id}")
def remove_family_member(member_id: str, user: dict = Depends(get_current_user)):
    """Removes a member from access permissions list."""
    client = get_supabase()
    try:
        # Check permissions
        check = client.table("family_members").select("user_id").eq("id", member_id).execute()
        if not check.data or check.data[0]["user_id"] != user["id"]:
            raise HTTPException(status_code=403, detail="Not authorized to modify this family vault.")

        client.table("family_members").delete().eq("id", member_id).execute()
        return {"status": "success", "message": "Family member access revoked."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database operation failed: {e}")
