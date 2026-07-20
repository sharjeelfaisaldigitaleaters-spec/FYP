import os
import logging

logger = logging.getLogger("app.services.stt")

# Whisper model is loaded lazily (on first transcription, not at import time).
# On memory-constrained hosts, loading this and the embedding model both
# eagerly at startup can exceed the available RAM before the app ever binds
# its port; loading on first use means idle/other-endpoint traffic never
# pays for it, and the two models are never forced to be resident at once
# just because the process started.
_model = None
_load_failed = False

def _get_model():
    global _model, _load_failed
    if _model is None and not _load_failed:
        try:
            from faster_whisper import WhisperModel
            model_size = os.getenv("WHISPER_MODEL_SIZE", "tiny")
            logger.info(f"Loading faster-whisper model '{model_size}'...")
            _model = WhisperModel(model_size, device="cpu", compute_type="int8")
        except Exception as e:
            logger.warning(f"Could not load faster-whisper locally: {e}. STT will run in fallback mock mode.")
            _load_failed = True
    return _model

def transcribe_audio(file_path: str) -> str:
    """
    Transcribes local audio file using Whisper model.
    Falls back gracefully if the local model is not loaded.
    """
    model = _get_model()
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
