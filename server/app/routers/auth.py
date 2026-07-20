from fastapi import APIRouter, HTTPException, Depends
from app.models.user import UserCreate, UserResponse
from app.database import get_supabase
from app.config import settings
from jose import jwt
import datetime
import logging

logger = logging.getLogger("app.routers.auth")

router = APIRouter(prefix="/auth", tags=["Authentication"])

from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/register", response_model=UserResponse)
def register_user(request: UserCreate):
    """Registers user via Supabase Auth signup."""
    client = get_supabase()
    try:
        # Standard Supabase Sign Up
        response = client.auth.sign_up({
            "email": request.email,
            "password": request.password,
            "options": {"data": {"name": request.name}}
        })

        if not response.user:
            raise HTTPException(status_code=400, detail="Registration failed.")

        # Create corresponding profile record in public database
        profile_data = {
            "id": response.user.id,
            "email": request.email,
            "name": request.name
        }
        client.table("profiles").insert(profile_data).execute()

        return {
            "id": response.user.id,
            "email": request.email,
            "name": request.name,
            "joined_at": datetime.datetime.now()
        }
    except Exception as e:
        logger.error(f"Registration failure: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
def login_user(request: LoginRequest):
    """Logs user in using Supabase Auth, returning Access Token."""
    client = get_supabase()
    try:
        response = client.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })

        if not response.session:
            raise HTTPException(status_code=401, detail="Authentication failed.")

        return {
            "access_token": response.session.access_token,
            "token_type": "bearer",
            "expires_in": response.session.expires_in,
            "user": {
                "id": response.user.id,
                "email": response.user.email,
                "name": response.user.user_metadata.get("name", "")
            }
        }
    except Exception as e:
        logger.error(f"Login failure: {e}")
        raise HTTPException(status_code=401, detail="Invalid email or password.")
