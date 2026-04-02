"""Beard detection and facial zone masking pre-processing.

Uses MediaPipe FaceLandmarker (Tasks API) to locate lower-face landmarks.
If the chin/jaw region exhibits high darkness + edge density consistent with
beard coverage, the image is flagged and only safe zones are passed to the
ViT model:
    - Forehead (above eyebrows)
    - Nose bridge and tip (vertical centre strip)
    - Upper cheeks (below eyes, above beard line)

The lower face is masked out with the image's mean skin colour so the ViT
model sees neutral pixels there instead of beard texture noise.

Design constraints
------------------
- Never raises — all failures fall back to "no beard, full face".
- Lazy model loading: FaceLandmarker .task file is downloaded once on first
  use and cached in ml/assets/.
- If the model download fails (network issue), switches automatically to a
  pure-pixel fallback that uses fixed facial proportions on the 384×384
  cropped face image.
- Does NOT touch ViT weights, ensemble logic, scoring, rule engine, or
  any frontend file.
"""

from __future__ import annotations

import logging
import threading
import urllib.request
from pathlib import Path
from typing import Dict, List, Tuple

import cv2
import numpy as np

logger = logging.getLogger("ml.beard_masking")

# ---------------------------------------------------------------------------
# FaceLandmarker model – downloaded once from Google's MediaPipe CDN
# ---------------------------------------------------------------------------
_LANDMARK_MODEL_URL = (
    "https://storage.googleapis.com/mediapipe-models/"
    "face_landmarker/face_landmarker/float16/1/face_landmarker.task"
)
_LANDMARK_MODEL_PATH = Path(__file__).resolve().parent / "assets" / "face_landmarker.task"

# Thread-safe lazy loader state
_landmarker_lock = threading.Lock()
_landmarker: object | None = None  # FaceLandmarker instance or sentinel "failed"
_USE_PIXEL_FALLBACK = False

# ---------------------------------------------------------------------------
# Zone definitions (pixel coordinates for a 384 × 384 face crop)
# ---------------------------------------------------------------------------
# Each entry: (row_start, row_end, col_start, col_end)
_ZONE_DEFS: Dict[str, Tuple[int, int, int, int]] = {
    "forehead":      (5,   98,  30,  354),   # top quarter, centre-ish
    "nose_bridge":   (98,  256, 145, 239),   # vertical centre strip
    "left_cheek":    (135, 245, 10,  140),   # upper cheek, left side
    "right_cheek":   (135, 245, 244, 374),   # upper cheek, right side
}

# Beard region (lower face) for detection analysis
# rows 252–384: chin, jaw, upper-lip area in a well-cropped 384×384 face
_BEARD_DETECT_ROW_START = 252
_BEARD_DETECT_ROW_END = 384
_BEARD_SCORE_THRESHOLD = 0.28  # combined darkness + edge-density threshold

# MediaPipe Face Mesh landmark indices that mark the lower face boundary
# (chin, jaw, and upper-lip area from the 468-point Face Mesh map).
_LOWER_FACE_LANDMARK_INDICES: Tuple[int, ...] = (
    # Chin and jaw perimeter
    152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127,
    162, 21, 54, 103, 67, 109, 10, 338, 297, 332, 284, 251,
    389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377,
    # Upper-lip base
    0, 267, 269, 270, 291, 321, 314, 17, 84, 61, 37, 39, 40,
)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _download_landmark_model() -> bool:
    """Download face_landmarker.task to ml/assets/ if not already present.

    Returns True on success, False on any failure.
    """
    if _LANDMARK_MODEL_PATH.exists():
        return True
    try:
        logger.info(
            "Downloading FaceLandmarker model from MediaPipe CDN → %s",
            _LANDMARK_MODEL_PATH,
        )
        _LANDMARK_MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
        urllib.request.urlretrieve(_LANDMARK_MODEL_URL, _LANDMARK_MODEL_PATH)
        logger.info(
            "FaceLandmarker model saved (%d KB).",
            _LANDMARK_MODEL_PATH.stat().st_size // 1024,
        )
        return True
    except Exception as exc:  # noqa: BLE001
        logger.warning(
            "FaceLandmarker model download failed: %s — beard detection will use pixel fallback.",
            exc,
        )
        return False


def _ensure_landmarker() -> object | None:
    """Return a ready FaceLandmarker instance, or None if unavailable."""
    global _landmarker, _USE_PIXEL_FALLBACK

    if _landmarker is not None:
        return None if _landmarker == "failed" else _landmarker

    with _landmarker_lock:
        if _landmarker is not None:
            return None if _landmarker == "failed" else _landmarker

        if not _download_landmark_model():
            _landmarker = "failed"
            _USE_PIXEL_FALLBACK = True
            return None

        try:
            from mediapipe.tasks.python import BaseOptions  # type: ignore[import]
            from mediapipe.tasks.python import vision as mp_vision  # type: ignore[import]

            options = mp_vision.FaceLandmarkerOptions(
                base_options=BaseOptions(
                    model_asset_path=str(_LANDMARK_MODEL_PATH)
                ),
                output_face_blendshapes=False,
                output_facial_transformation_matrixes=False,
                num_faces=1,
                min_face_detection_confidence=0.35,
                min_face_presence_confidence=0.35,
                min_tracking_confidence=0.35,
            )
            _landmarker = mp_vision.FaceLandmarker.create_from_options(options)
            logger.info("FaceLandmarker loaded successfully.")
        except Exception as exc:  # noqa: BLE001
            logger.warning(
                "FaceLandmarker init failed: %s — using pixel fallback.",
                exc,
            )
            _landmarker = "failed"
            _USE_PIXEL_FALLBACK = True
            return None

    return _landmarker if _landmarker != "failed" else None


def _landmark_lower_face_crop(
    image_rgb: np.ndarray,
    landmarks: object,
) -> Tuple[int, int, int, int]:
    """Extract bounding box of the lower-face landmark region.

    Returns (row_start, row_end, col_start, col_end) in pixel coordinates.
    Falls back to fixed proportions if landmarks are sparse or out-of-range.
    """
    h, w = image_rgb.shape[:2]
    all_lm = landmarks.face_landmarks  # type: ignore[attr-defined]
    if not all_lm:
        return (_BEARD_DETECT_ROW_START, h, 0, w)

    face_lm = all_lm[0]
    points: List[Tuple[int, int]] = []
    for idx in _LOWER_FACE_LANDMARK_INDICES:
        if idx < len(face_lm):
            lm = face_lm[idx]
            px = int(lm.x * w)
            py = int(lm.y * h)
            if 0 <= px < w and 0 <= py < h:
                points.append((px, py))

    if len(points) < 6:
        return (_BEARD_DETECT_ROW_START, h, 0, w)

    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    # Only use the lower portion (below vertical mid-face)
    y_floor = int(h * 0.52)
    r1 = max(y_floor, min(ys))
    r2 = min(h, max(ys))
    c1 = max(0, min(xs))
    c2 = min(w, max(xs))
    if r2 <= r1 or c2 <= c1:
        return (_BEARD_DETECT_ROW_START, h, 0, w)
    return (r1, r2, c1, c2)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def detect_beard(image_rgb: np.ndarray) -> Dict:
    """Detect whether a beard is present in the lower-face region.

    Detection pipeline:
    1. Use FaceLandmarker to locate lower-face landmarks and crop that region.
    2. Compute mean L-channel darkness in the crop (beard = darker than skin).
    3. Compute Canny edge density in the crop (beard hair = high edge density).
    4. Combined score: ``0.60 × darkness + 0.40 × edge_density``.
    5. Flag as bearded if combined score > _BEARD_SCORE_THRESHOLD (0.28).

    Falls back to a fixed-proportion crop if FaceLandmarker is unavailable.

    Args:
        image_rgb: np.ndarray, shape (H, W, 3), dtype uint8, RGB.
                   Expected to be the already-cropped face image (≈384×384).

    Returns:
        {
            "bearded":     bool,
            "beard_score": float,   # 0.0–1.0
            "method":      str,     # "landmark" | "pixel_fallback"
        }
    """
    try:
        return _detect_beard_impl(image_rgb)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Beard detection failed unexpectedly: %s — assuming no beard.", exc)
        return {"bearded": False, "beard_score": 0.0, "method": "error_fallback"}


def _detect_beard_impl(image_rgb: np.ndarray) -> Dict:
    h, w = image_rgb.shape[:2]
    method = "pixel_fallback"
    r1, r2, c1, c2 = _BEARD_DETECT_ROW_START, h, 0, w  # default: fixed proportions

    landmarker = _ensure_landmarker()
    if landmarker is not None:
        try:
            import mediapipe as mp  # type: ignore[import]

            mp_image = mp.Image(
                image_format=mp.ImageFormat.SRGB,
                data=np.ascontiguousarray(image_rgb),
            )
            result = landmarker.detect(mp_image)  # type: ignore[attr-defined]
            if result.face_landmarks:
                r1, r2, c1, c2 = _landmark_lower_face_crop(image_rgb, result)
                method = "landmark"
        except Exception as exc:  # noqa: BLE001
            logger.debug("Landmark-based crop failed: %s — using pixel coords.", exc)

    # Guard against empty/invalid region
    r1, r2 = max(0, r1), min(h, r2)
    c1, c2 = max(0, c1), min(w, c2)
    if r2 <= r1 or c2 <= c1:
        return {"bearded": False, "beard_score": 0.0, "method": method}

    lower_face = image_rgb[r1:r2, c1:c2]
    if lower_face.size == 0:
        return {"bearded": False, "beard_score": 0.0, "method": method}

    # Signal 1 — Darkness: beard hair is darker than surrounding skin.
    # Use L-channel in OpenCV LAB (range 0–255); darker = lower L.
    lab = cv2.cvtColor(lower_face, cv2.COLOR_RGB2LAB)
    mean_l = float(np.mean(lab[:, :, 0].astype(np.float32)))
    # Normalise: values below ~160 are notably dark for skin
    darkness_score = float(np.clip(1.0 - (mean_l / 195.0), 0.0, 1.0))

    # Signal 2 — Edge density: beard hairs create many fine edges.
    gray = cv2.cvtColor(lower_face, cv2.COLOR_RGB2GRAY)
    edges = cv2.Canny(gray, 35, 110)
    edge_density = float(np.sum(edges > 0) / max(1, edges.size))

    beard_score = float(darkness_score * 0.60 + edge_density * 0.40)
    bearded = beard_score > _BEARD_SCORE_THRESHOLD

    logger.debug(
        "Beard detection [%s]: mean_L=%.1f darkness=%.3f edge_density=%.4f "
        "beard_score=%.3f bearded=%s region=[%d:%d, %d:%d]",
        method, mean_l, darkness_score, edge_density, beard_score,
        bearded, r1, r2, c1, c2,
    )
    return {
        "bearded": bearded,
        "beard_score": round(beard_score, 4),
        "method": method,
    }


def apply_zone_mask(image_rgb: np.ndarray) -> Tuple[np.ndarray, List[str]]:
    """Return a copy of *image_rgb* with only the safe skin zones exposed.

    Safe zones (forehead, nose bridge/tip, upper cheeks) retain their original
    pixels.  All other areas are filled with the image's mean colour so the
    ViT model sees a neutral background instead of beard or hairline texture.

    Zone coordinates are scaled from the 384×384 reference frame to the actual
    image dimensions, so the function works with any input size.

    Args:
        image_rgb: np.ndarray, shape (H, W, 3), dtype uint8, RGB.

    Returns:
        (masked_image, zones_used):
            masked_image — same shape as input.
            zones_used   — list of zone names that contributed pixels.
    """
    h, w = image_rgb.shape[:2]
    scale_y = h / 384.0
    scale_x = w / 384.0

    # Fill with the mean colour of the input to avoid artificial brightness shifts.
    mean_colour = image_rgb.mean(axis=(0, 1)).astype(np.uint8)
    masked = np.full_like(image_rgb, mean_colour)

    zones_used: List[str] = []
    for zone_name, (r1_ref, r2_ref, c1_ref, c2_ref) in _ZONE_DEFS.items():
        r1 = max(0, int(r1_ref * scale_y))
        r2 = min(h, int(r2_ref * scale_y))
        c1 = max(0, int(c1_ref * scale_x))
        c2 = min(w, int(c2_ref * scale_x))
        if r2 > r1 and c2 > c1:
            masked[r1:r2, c1:c2] = image_rgb[r1:r2, c1:c2]
            zones_used.append(zone_name)

    return masked, zones_used
