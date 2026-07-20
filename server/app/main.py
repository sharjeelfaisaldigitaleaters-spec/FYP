from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.core.exceptions import register_exception_handlers
from app.routers import auth, consent, upload, conversation, library, family, settings as user_settings
import logging

# Configure Logging
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("app.main")

app = FastAPI(
    title="Memory Keeper Backend",
    description="FastAPI Backend for Grief Support Voice Replica & Archiving Engine",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None
)

# CORS configurations — driven by ALLOWED_ORIGINS env var so the production
# Vercel domain can be added without a code change (see app/config.py).
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Error Handlers
register_exception_handlers(app)

# Include Router Modules
app.include_router(auth.router, prefix="/api")
app.include_router(consent.router, prefix="/api")
app.include_router(upload.router, prefix="/api")
app.include_router(conversation.router, prefix="/api")
app.include_router(library.router, prefix="/api")
app.include_router(family.router, prefix="/api")
app.include_router(user_settings.router, prefix="/api")

@app.get("/health")
def health_check():
    """Health check endpoint to ensure server is operating."""
    return {
        "status": "healthy",
        "service": "memory-keeper-api",
        "debug_mode": settings.DEBUG
    }

@app.get("/")
def read_root():
    return {
        "message": "Welcome to Memory Keeper (Echoes of Tomorrow) API portal.",
        "documentation": "/docs"
    }
