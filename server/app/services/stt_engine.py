import os
import logging

logger = logging.getLogger("app.services.stt")

# Initialize Whisper model globally if package is present
model = None
try:
    from faster_whisper import WhisperModel
    # Use 'tiny' or 'base' for low-latency CPU inference by default
    model_size = os.getenv("WHISPER_MODEL_SIZE", "tiny")
    logger.info(f"Loading faster-whisper model '{model_size}'...")
    model = WhisperModel(model_size, device="cpu", compute_type="int8")
except Exception as e:
    logger.warning(f"Could not load faster-whisper locally: {e}. STT will run in fallback mock mode.")

def transcribe_audio(file_path: str) -> str:
    """
    Transcribes local audio file using Whisper model.
    Falls back gracefully if the local model is not loaded.
    """
    if not model:
        logger.warning("Whisper model not loaded. Returning fallback transcription text.")
        return "Salam, kaise hain aap? Mujhe aapki bahut yaad aa rahi hai."

    try:
        segments, info = model.transcribe(file_path, beam_size=5)
        text = " ".join([segment.text for segment in segments])
        logger.info(f"Speech-to-text transcribed successfully. Language detected: {info.language}")
        return text.strip()
    except Exception as e:
        logger.error(f"Whisper transcription failed: {e}")
        return "Salam, kya haal hain?"
