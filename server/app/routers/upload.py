from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from app.core.security import get_current_user
from app.core.exceptions import ConsentRequiredException
from app.services.consent_engine import check_consent_status
from app.services.s3_service import upload_file_to_storage
from app.services.voice_engine import add_cloned_voice
from app.services.rag_engine import get_text_embedding
from app.database import get_supabase
import uuid
import os
from pydantic import BaseModel
from typing import Optional
import logging

router = APIRouter(prefix="/upload", tags=["Uploads"])
logger = logging.getLogger("app.routers.upload")


def _assert_persona_ownership(client, persona_id: str, user_id: str):
    resp = client.table("personas").select("id").eq("id", persona_id).eq("user_id", user_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Personality not found or access denied. Create one first.")


@router.post("/audio")
async def upload_audio_memory(
    title: str = Form(...),
    persona_id: str = Form(...),
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user)
):
    """Uploads a voice sample as a memory, scoped to a specific persona."""
    client = get_supabase()
    _assert_persona_ownership(client, persona_id, user["id"])

    # 1. Verify consent first (MOCKED FOR TESTING)
    # if not check_consent_status(user["id"]):
    #     raise ConsentRequiredException("Legal consent must be signed before voice cloning can occur.")

    # 2. Upload file to Supabase storage
    file_bytes = await file.read()
    file_extension = os.path.splitext(file.filename)[1] or ".mp3"
    generated_filename = f"{uuid.uuid4()}{file_extension}"
    folder_path = f"{user['id']}/audios"

    public_url = upload_file_to_storage(
        file_bytes=file_bytes,
        file_name=generated_filename,
        folder_path=folder_path,
        content_type=file.content_type or "audio/mpeg"
    )

    # 3. Create entry in memories table
    memory_id = str(uuid.uuid4())
    memory_data = {
        "id": memory_id,
        "user_id": user["id"],
        "persona_id": persona_id,
        "title": title,
        "type": "audio",
        "file_path": public_url,
        "size": f"{len(file_bytes) / (1024 * 1024):.2f} MB",
        "status": "processed"
    }

    try:
        client.table("memories").insert(memory_data).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database logging failed: {e}")

    return {
        "status": "success",
        "memory_id": memory_id,
        "url": public_url
    }


class TextMemory(BaseModel):
    title: str
    content: str
    persona_id: str
    date: Optional[str] = None
    category: Optional[str] = None

@router.post("/text")
async def upload_text_memory(
    memory: TextMemory,
    user: dict = Depends(get_current_user)
):
    client = get_supabase()
    _assert_persona_ownership(client, memory.persona_id, user["id"])

    memory_id = str(uuid.uuid4())
    embedding = get_text_embedding(memory.content)
    memory_data = {
        "id": memory_id,
        "user_id": user["id"],
        "persona_id": memory.persona_id,
        "title": memory.title,
        "type": "text",
        "content": memory.content,
        "category": memory.category,
        "embedding": embedding,
        "status": "processed"
    }

    try:
        client.table("memories").insert(memory_data).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database logging failed: {e}")

    return {
        "status": "success",
        "memory_id": memory_id
    }


@router.post("/document")
async def upload_document_memory(
    title: str = Form(...),
    persona_id: str = Form(...),
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user)
):
    """Uploads a PDF, extracts its text, and stores it as a persona-scoped memory
    the persona can actually be asked about (embedded for semantic search)."""
    client = get_supabase()
    _assert_persona_ownership(client, persona_id, user["id"])

    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported for document uploads.")

    file_bytes = await file.read()

    try:
        from pypdf import PdfReader
        import io
        reader = PdfReader(io.BytesIO(file_bytes))
        extracted_text = "\n".join(page.extract_text() or "" for page in reader.pages).strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read PDF: {e}")

    if not extracted_text:
        raise HTTPException(status_code=400, detail="No readable text found in this PDF.")

    generated_filename = f"{uuid.uuid4()}.pdf"
    folder_path = f"{user['id']}/documents"
    public_url = upload_file_to_storage(
        file_bytes=file_bytes,
        file_name=generated_filename,
        folder_path=folder_path,
        content_type="application/pdf"
    )

    memory_id = str(uuid.uuid4())
    embedding = get_text_embedding(extracted_text)
    memory_data = {
        "id": memory_id,
        "user_id": user["id"],
        "persona_id": persona_id,
        "title": title,
        "type": "document",
        "content": extracted_text,
        "file_path": public_url,
        "size": f"{len(file_bytes) / (1024 * 1024):.2f} MB",
        "embedding": embedding,
        "status": "processed"
    }

    try:
        client.table("memories").insert(memory_data).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database logging failed: {e}")

    return {
        "status": "success",
        "memory_id": memory_id,
        "url": public_url,
        "characters_extracted": len(extracted_text)
    }


@router.post("/media")
async def upload_media_memory(
    title: str = Form(...),
    persona_id: str = Form(...),
    category: str = Form(None),
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user)
):
    client = get_supabase()
    _assert_persona_ownership(client, persona_id, user["id"])

    # Upload file to Supabase storage
    file_bytes = await file.read()
    file_extension = os.path.splitext(file.filename)[1] or ".jpg"
    generated_filename = f"{uuid.uuid4()}{file_extension}"
    folder_path = f"{user['id']}/media"

    public_url = upload_file_to_storage(
        file_bytes=file_bytes,
        file_name=generated_filename,
        folder_path=folder_path,
        content_type=file.content_type
    )

    memory_id = str(uuid.uuid4())
    memory_data = {
        "id": memory_id,
        "user_id": user["id"],
        "persona_id": persona_id,
        "title": title,
        "type": "media",
        "file_path": public_url,
        "category": category,
        "size": f"{len(file_bytes) / (1024 * 1024):.2f} MB",
        "status": "processed"
    }

    try:
        client.table("memories").insert(memory_data).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database logging failed: {e}")

    return {
        "status": "success",
        "memory_id": memory_id,
        "url": public_url
    }
