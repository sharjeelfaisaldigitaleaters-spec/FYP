import logging
from app.config import settings
from groq import Groq

logger = logging.getLogger("app.services.stt")

# Transcription runs via Groq's hosted Whisper API rather than a local
# faster-whisper model. Running Whisper locally alongside the embedding
# model was pushing memory-constrained hosts (e.g. Render's 512MB tier)
# over the edge mid-request, crashing the process. Groq is already a
# dependency for chat completions, so this trades a bit of network latency
# for removing the single largest remaining local-model memory consumer.
GROQ_WHISPER_MODEL = "whisper-large-v3-turbo"

def transcribe_audio(file_path: str) -> str:
    """
    Transcribes a local audio file via Groq's hosted Whisper API.
    Falls back to a canned response if the API call fails, so a transient
    STT hiccup doesn't break the whole conversation turn.
    """
    try:
        client = Groq(api_key=settings.GROQ_API_KEY)
        with open(file_path, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                file=audio_file,
                model=GROQ_WHISPER_MODEL,
            )
        text = (transcription.text or "").strip()
        logger.info("Speech-to-text transcribed successfully via Groq.")
        return text
    except Exception as e:
        logger.error(f"Groq transcription failed: {e}")
        return "Salam, kya haal hain?"
