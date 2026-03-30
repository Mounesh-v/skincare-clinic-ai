"""
Hugging Face Spaces FastAPI entry point for the Skincare AI service.
Wraps the existing ml_service/analyzer.py with a FastAPI interface.
"""
from __future__ import annotations

import base64
import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s - %(message)s",
)
LOGGER = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Lazy global model reference (populated inside lifespan)
# ---------------------------------------------------------------------------
_analyzer = None
_startup_error: str | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models once at startup, cleanly shut down on exit."""
    global _analyzer, _startup_error
    LOGGER.info("Starting up — loading ML models...")
    try:
        from ml_service.analyzer import SkinAnalyzerService  # noqa: PLC0415 (import inside lifespan)
        _analyzer = SkinAnalyzerService()
        _analyzer.load_models()
        _startup_error = None
        LOGGER.info("ML models ready.")
    except Exception as exc:  # noqa: BLE001
        _analyzer = None
        _startup_error = str(exc)
        LOGGER.exception("Startup completed without loaded models")
    yield
    LOGGER.info("Shutting down.")


fastapi_app = FastAPI(
    title="Skincare AI API",
    description="Skin type & condition analysis powered by EfficientNet-V2S + ViT ensemble.",
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS — reads ML_ALLOWED_ORIGINS env var set in HF Space secrets
# ---------------------------------------------------------------------------
_DEFAULT_ORIGINS = (
    "https://skincare-clinic-ai-tjjy.vercel.app,"
    "https://skincare-clinic-ai.vercel.app,"
    "http://localhost:5173,"
    "http://localhost:5174,"
    "http://127.0.0.1:5173,"
    "http://127.0.0.1:5174"
)
ALLOWED_ORIGINS: list[str] = [
    o.strip()
    for o in os.getenv("ML_ALLOWED_ORIGINS", _DEFAULT_ORIGINS).split(",")
    if o.strip()
]

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

LOGGER.info("CORS allowed origins: %s", ALLOWED_ORIGINS)


# ---------------------------------------------------------------------------
# Health endpoint
# ---------------------------------------------------------------------------
@fastapi_app.get("/api/health", tags=["health"])
def health_check():
    """Returns service status and whether the model is loaded."""
    return {
        "status": "ok",
        "model_loaded": _analyzer is not None,
        "startup_error": _startup_error,
    }


# ---------------------------------------------------------------------------
# Main analyze endpoint — JSON body with base64 image (same as existing contract)
# ---------------------------------------------------------------------------
class AnalyzeRequest(BaseModel):
    image_data: str   # base64 string or data-URL (data:image/jpeg;base64,...)
    answers: dict = {}
    lead: dict = {}


@fastapi_app.post("/api/analyze", tags=["inference"])
def analyze_json(req: AnalyzeRequest):
    """
    Accepts a base64-encoded image and optional quiz answers.
    Returns skin type, condition predictions, and recommendations.
    Same request/response contract as the existing local ML service.
    """
    if _analyzer is None:
        raise HTTPException(status_code=503, detail="Model not loaded yet. Please retry in a moment.")
    try:
        result = _analyzer.analyze_request(req.model_dump())
        return result
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except FileNotFoundError as exc:
        LOGGER.exception("Model weights missing")
        raise HTTPException(status_code=503, detail="ML model unavailable.") from exc
    except Exception as exc:  # noqa: BLE001
        LOGGER.exception("Unexpected error during analysis")
        raise HTTPException(status_code=500, detail="Internal server error during analysis.") from exc


# ---------------------------------------------------------------------------
# File-upload convenience endpoint (multipart/form-data)
# ---------------------------------------------------------------------------
@fastapi_app.post("/analyze", tags=["inference"])
async def analyze_upload(file: UploadFile = File(...)):
    """
    Accepts a multipart image file upload.
    Internally converts to base64 and calls the same analyzer.
    Useful for testing with curl or Postman.
    """
    if _analyzer is None:
        raise HTTPException(status_code=503, detail="Model not loaded yet.")
    raw = await file.read()
    b64 = base64.b64encode(raw).decode("ascii")
    mime = file.content_type or "image/jpeg"
    image_data = f"data:{mime};base64,{b64}"
    try:
        result = _analyzer.analyze_request({"image_data": image_data, "answers": {}, "lead": {}})
        return result
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        LOGGER.exception("File upload analysis failed")
        raise HTTPException(status_code=500, detail="Internal server error.") from exc
