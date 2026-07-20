from fastapi import Request, FastAPI
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger("app.core.exceptions")

class ConsentRequiredException(Exception):
    def __init__(self, message: str = "Consent verification must be completed first."):
        self.message = message
        super().__init__(self.message)

class StorageException(Exception):
    def __init__(self, message: str = "File storage transaction failed."):
        self.message = message
        super().__init__(self.message)

def register_exception_handlers(app: FastAPI):
    @app.exception_handler(ConsentRequiredException)
    async def consent_exception_handler(request: Request, exc: ConsentRequiredException):
        logger.warning(f"Consent check blocked request: {exc.message}")
        return JSONResponse(
            status_code=403,
            content={"status": "error", "code": "CONSENT_REQUIRED", "message": exc.message}
        )

    @app.exception_handler(StorageException)
    async def storage_exception_handler(request: Request, exc: StorageException):
        logger.error(f"Storage error occurred: {exc.message}")
        return JSONResponse(
            status_code=500,
            content={"status": "error", "code": "STORAGE_FAILED", "message": exc.message}
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"Global server error on {request.url.path}: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"status": "error", "code": "INTERNAL_ERROR", "message": "An unexpected error occurred."}
        )
