from app.database import get_supabase
from app.config import settings
import logging

logger = logging.getLogger("app.services.storage")

def upload_file_to_storage(file_bytes: bytes, file_name: str, folder_path: str, content_type: str = "audio/mpeg") -> str:
    """
    Uploads file bytes to the configured Supabase Storage Bucket.
    Returns the public URL of the uploaded file.
    """
    client = get_supabase()
    bucket = settings.SUPABASE_BUCKET_NAME
    # Full path inside bucket: "folder_path/file_name"
    full_path = f"{folder_path}/{file_name}".strip("/")

    try:
        # Check if bucket exists, if not attempt to create (optional)
        # Uploading file bytes
        client.storage.from_(bucket).upload(
            path=full_path,
            file=file_bytes,
            file_options={"content-type": content_type, "x-upsert": "true"}
        )
        # Retrieve public URL
        url_response = client.storage.from_(bucket).get_public_url(full_path)
        return url_response
    except Exception as e:
        logger.error(f"Failed to upload file to Supabase storage: {e}")
        # Return a fallback mock upload local url
        return f"/uploads/{full_path}"

def delete_file_from_storage(file_path: str):
    """Deletes a file from the configured Supabase storage bucket."""
    client = get_supabase()
    bucket = settings.SUPABASE_BUCKET_NAME
    try:
        client.storage.from_(bucket).remove([file_path])
        return True
    except Exception as e:
        logger.error(f"Failed to remove file from Supabase storage: {e}")
        return False
