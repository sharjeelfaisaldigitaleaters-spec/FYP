from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from app.core.security import get_current_user
from app.services.consent_engine import verify_and_store_consent, check_consent_status

router = APIRouter(prefix="/consent", tags=["Consent"])

class ConsentSignRequest(BaseModel):
    email: EmailStr
    signature_name: str
    relation_to_deceased: str
    relationship_proof_url: str = None

@router.post("")
def sign_consent(request: ConsentSignRequest, user: dict = Depends(get_current_user)):
    """
    Submits user signature certifying legal consent for voice replication.
    """
    success = verify_and_store_consent(
        user_id=user["id"],
        email=request.email,
        signature_name=request.signature_name,
        relation_to_deceased=request.relation_to_deceased,
        relationship_proof_url=request.relationship_proof_url
    )
    if not success:
        raise HTTPException(status_code=500, detail="Failed to save consent logs.")
    return {"status": "success", "message": "Consent successfully signed and verified."}

@router.get("/status")
def get_consent_status(user: dict = Depends(get_current_user)):
    """Gets current verification status for active user."""
    is_verified = check_consent_status(user["id"])
    return {"is_verified": is_verified}
