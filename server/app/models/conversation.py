from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ChatMessageBase(BaseModel):
    content: str
    type: str # "user" | "ai"

class ChatMessageCreate(ChatMessageBase):
    session_id: str
    audio_path: Optional[str] = None

class ChatMessageResponse(ChatMessageBase):
    id: str
    session_id: str
    audio_path: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ChatSessionResponse(BaseModel):
    id: str
    persona_id: str
    created_at: datetime
    messages: Optional[List[ChatMessageResponse]] = []

    class Config:
        from_attributes = True

class PersonaSurvey(BaseModel):
    name: str
    relation: str
    description: str
    survey_data: dict # Questions and answers representing personality traits
