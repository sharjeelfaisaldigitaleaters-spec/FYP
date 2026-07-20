from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MemoryBase(BaseModel):
    title: str
    type: str # "audio" | "image" | "video" | "text"
    size: str
    content: Optional[str] = None
    status: Optional[str] = "uploaded" # "uploaded" | "processing" | "processed" | "failed"

class MemoryCreate(MemoryBase):
    file_path: Optional[str] = None

class MemoryResponse(MemoryBase):
    id: str
    user_id: str
    file_path: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class StoryResponse(BaseModel):
    id: str
    user_id: str
    title: str
    excerpt: str
    category: str
    date: str
    duration: str
    has_audio: bool
    is_favorite: bool
    created_at: datetime

    class Config:
        from_attributes = True
