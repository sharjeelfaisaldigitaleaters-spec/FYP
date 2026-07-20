import logging
from typing import AsyncGenerator
from app.config import settings
from elevenlabs.client import AsyncElevenLabs

logger = logging.getLogger("app.services.voice")


async def add_cloned_voice(name: str, file_paths: list[str], description: str = "") -> str:
    """Clone a voice from audio samples using ElevenLabs Instant Voice Clone."""
    if settings.ELEVENLABS_API_KEY == "placeholder_eleven_key":
        raise ValueError("ElevenLabs API key is not configured.")

    opened_files = []
    try:
        for path in file_paths:
            try:
                opened_files.append(open(path, "rb"))
            except Exception as fe:
                logger.error(f"Failed to open sample file {path}: {fe}")

        if not opened_files:
            raise ValueError("No valid audio sample files could be opened.")

        client = AsyncElevenLabs(api_key=settings.ELEVENLABS_API_KEY)
        voice = await client.voices.ivc.create(
            name=name,
            description=description,
            files=opened_files
        )

        logger.info(f"Voice cloned successfully: '{name}' | ID: {voice.voice_id}")
        return voice.voice_id

    except Exception as e:
        logger.error(f"Voice cloning failed: {e}")
        raise
    finally:
        for f in opened_files:
            try:
                f.close()
            except Exception:
                pass


async def stream_tts(text: str, voice_id: str) -> AsyncGenerator[bytes, None]:
    """
    Stream TTS audio from ElevenLabs using the persona's cloned voice.
    Forced to use eleven_v3 model exclusively for paid plans.
    """
    if settings.ELEVENLABS_API_KEY == "placeholder_eleven_key":
        raise ValueError("ElevenLabs API key is not configured.")

    client = AsyncElevenLabs(api_key=settings.ELEVENLABS_API_KEY)
    model_id = "eleven_v3"
    voice_settings = {
        "stability": 0.30,
        "similarity_boost": 0.80,
        "style": 0.45,
    }

    try:
        logger.info(f"ElevenLabs TTS: model={model_id}, voice={voice_id}")

        # CRITICAL: convert() returns an AsyncGenerator[bytes, None].
        # Do NOT use `await` — iterate directly with `async for`.
        async for chunk in client.text_to_speech.convert(
            voice_id=voice_id,
            model_id=model_id,
            text=text,
            voice_settings=voice_settings
        ):
            yield chunk

        logger.info(f"TTS completed via {model_id}")

    except Exception as e:
        logger.error(f"ElevenLabs TTS failed: {e}")
        raise e
