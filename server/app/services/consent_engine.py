from app.database import get_supabase
import logging

logger = logging.getLogger("app.services.consent")

def verify_and_store_consent(user_id: str, email: str, signature_name: str, relation_to_deceased: str, relationship_proof_url: str = None) -> bool:
    """
    Registers the signed consent agreement before allowing voice cloning operations.
    """
    client = get_supabase()
    try:
        data = {
            "user_id": user_id,
            "email": email,
            "signature_name": signature_name,
            "relation_to_deceased": relation_to_deceased,
            "relationship_proof_url": relationship_proof_url,
            "signed_at": "now()",
            "is_verified": True
        }
        client.table("consents").insert(data).execute()
        return True
    except Exception as e:
        logger.error(f"Error saving consent: {e}")
        return False

def check_consent_status(user_id: str) -> bool:
    """
    Checks if a user has signed verification consent.
    """
    client = get_supabase()
    try:
        response = client.table("consents").select("is_verified").eq("user_id", user_id).eq("is_verified", True).execute()
        return len(response.data) > 0
    except Exception as e:
        logger.error(f"Error checking consent: {e}")
        return False
