import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    # API endpoints and runtime configs
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True

    # Comma-separated list of allowed frontend origins (CORS). Defaults cover
    # local Vite dev servers; production deployments should set this via env var.
    ALLOWED_ORIGINS: str = "http://localhost:8080,http://127.0.0.1:8080,http://localhost:5173,http://127.0.0.1:5173,http://localhost:8081,http://127.0.0.1:8081"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    # Supabase credentials
    SUPABASE_URL: str = Field(default="https://placeholder.supabase.co")
    SUPABASE_KEY: str = Field(default="placeholder_key")
    SUPABASE_BUCKET_NAME: str = "memories-gallery"

    # AI API keys
    GROQ_API_KEY: str = Field(default="placeholder_groq_key")
    ELEVENLABS_API_KEY: str = Field(default="placeholder_eleven_key")

    # Security
    JWT_SECRET: str = Field(default="supersecretsecret")
    ALGORITHM: str = "HS256"

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
