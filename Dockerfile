# Skincare AI — Hugging Face Spaces Docker image
# Port 7860 is required by HF Spaces (DO NOT change)

FROM python:3.11-slim

# ── System libraries ──────────────────────────────────────────────────────
# libgl1 / libglib2.0-0 : OpenCV headless still needs these at runtime
# libsm6 / libxrender1 / libxext6 : MediaPipe transitive deps
# git + git-lfs : needed only if you do in-container git ops; safe to keep
# System dependencies for OpenCV and MediaPipe
RUN apt-get update && apt-get install -y \
    libgl1 \
    libsm6 \
    libxext6 \
    libglib2.0-0 \
    libgles2 \
    libegl1 \
    libxrender1 \
    git \
    git-lfs \
    && rm -rf /var/lib/apt/lists/*

# ── Python deps ───────────────────────────────────────────────────────────
WORKDIR /app
COPY requirements_hf.txt .
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir -r requirements_hf.txt

# ── Application code ──────────────────────────────────────────────────────
COPY . .

# ── Runtime ───────────────────────────────────────────────────────────────
# HF Spaces REQUIRES port 7860
ENV PORT=7860
EXPOSE 7860

# Use 1 worker — ViT semaphore in analyzer.py already handles concurrency safely
CMD ["uvicorn", "app:fastapi_app", "--host", "0.0.0.0", "--port", "7860", "--workers", "1"]
