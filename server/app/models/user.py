from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    joined_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class FamilyMemberBase(BaseModel):
    name: str
    email: EmailStr
    role: str # "owner" | "editor" | "viewer"
    avatar: Optional[str] = None
    status: Optional[str] = "pending" # "active" | "pending"

class FamilyMemberCreate(FamilyMemberBase):
    pass

class FamilyMemberResponse(FamilyMemberBase):
    id: str
    user_id: str
    joined_at: Optional[datetime] = None

    class Config:
        from_attributes = True
