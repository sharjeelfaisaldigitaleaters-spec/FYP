from pydantic import BaseModel
from typing import Optional

class VoiceCloneRequest(BaseModel):
    persona_id: str
    sample_file_paths: list[str]

class VoiceCloneResponse(BaseModel):
    persona_id: str
    voice_id: str
    status: str # "trained" | "failed"
    message: Optional[str] = None
