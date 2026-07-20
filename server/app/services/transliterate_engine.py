import logging
from app.config import settings
from groq import Groq

logger = logging.getLogger("app.services.transliterate")

# Dictionary of common Roman Urdu words mapped to standard Urdu script for quick local fallback
FALLBACK_DICT = {
    "kya": "کیا",
    "kya?": "کیا؟",
    "haal": "حال",
    "hai": "ہے",
    "hain": "ہیں",
    "mein": "میں",
    "theek": "ٹھیک",
    "hoon": "ہوں",
    "salam": "سلام",
    "aap": "آپ",
    "kaise": "کیسے",
    "kaisi": "کیسی",
    "ho": "ہو",
    "beta": "بیٹا",
    "mujh": "مجھ",
    "mujhe": "مجھے",
    "yaad": "یاد",
    "aa": "آ",
    "rahi": "رہی",
    "raha": "رہا",
    "bahut": "بہت",
    "bohat": "بہت",
    "gaya": "گیا",
    "gayi": "گئی",
    "acha": "اچھا",
    "achha": "اچھا",
    "khair": "خیر",
    "shukriya": "شکریہ",
    "allah": "اللہ",
    "hafiz": "حافظ",
}

def local_transliterate_fallback(text: str) -> str:
    """Simple dictionary-based mapper for Roman Urdu to Urdu Script."""
    words = text.lower().split()
    translated_words = []
    for word in words:
        # Strip punctuation
        clean_word = "".join(c for c in word if c.isalnum())
        translation = FALLBACK_DICT.get(clean_word, clean_word)
        # Restore punctuation if original word had it
        if word.endswith("?"):
            translation += "؟"
        elif word.endswith("."):
            translation += "۔"
        elif word.endswith(","):
            translation += "،"
        translated_words.append(translation)
    return " ".join(translated_words)

def transliterate_roman_to_urdu(text: str) -> str:
    """
    Transliterates Roman Urdu text to native Arabic-based Urdu script.
    Uses Groq API for high-context translation with a local dictionary fallback.
    """
    if settings.GROQ_API_KEY == "placeholder_groq_key":
        logger.info("Using local dictionary fallback for transliteration.")
        return local_transliterate_fallback(text)

    try:
        client = Groq(api_key=settings.GROQ_API_KEY)
        prompt = (
            "You are a linguistic machine. Convert the following Romanized Urdu/Hindi text "
            "(Urdu written in English script) into proper Arabic-based Urdu script (Nastaliq script). "
            "Respond ONLY with the transliterated script, with no explanations, no titles, and no punctuation changes. "
            f"Text to convert: '{text}'"
        )
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.0,
            max_tokens=256
        )
        urdu_script = chat_completion.choices[0].message.content.strip()
        logger.info(f"Transliterated: '{text}' -> '{urdu_script}'")
        return urdu_script
    except Exception as e:
        logger.error(f"Groq transliteration failed: {e}. Using local dictionary fallback.")
        return local_transliterate_fallback(text)
