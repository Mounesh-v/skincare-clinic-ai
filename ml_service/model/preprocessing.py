"""Image preprocessing utilities shared by training and inference pipelines.

This module standardises face-centric preprocessing so that both the trainer
and the online predictor use identical steps:

1. Detect a face with MediaPipe and crop with configurable padding.
2. Normalise lighting via CLAHE on the value channel in HSV space.
3. Resize to the MobileNetV2 input resolution and emit float32 tensors.

Keeping preprocessing centralised eliminates train/serve skew and makes the
model easier to port to TensorFlow Lite later on.
"""

from __future__ import annotations

import threading
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Iterable, Optional, Sequence, Tuple

import cv2
import numpy as np

try:  # pragma: no cover - optional dependency
    from mediapipe.python.solutions import face_detection as mp_face_detection  # type: ignore[import]
    from mediapipe.python.solutions.face_detection import FaceDetection as FaceDetectionType  # type: ignore[import]
except Exception:  # pragma: no cover - fallback when mediapipe missing
    mp_face_detection = None  # type: ignore[assignment]
    FaceDetectionType = Any  # type: ignore[assignment]

# ---------------------------------------------------------------------------
# Label metadata
# ---------------------------------------------------------------------------
CANONICAL_LABELS: Sequence[str] = ("dry", "oily", "normal", "combination")
DISPLAY_LABELS: Dict[str, str] = {
    "dry": "Dry",
    "oily": "Oily",
    "normal": "Normal",
    "combination": "Combination",
}
LABEL_TO_INDEX: Dict[str, int] = {label: idx for idx, label in enumerate(CANONICAL_LABELS)}
INDEX_TO_LABEL: Dict[int, str] = {idx: label for label, idx in LABEL_TO_INDEX.items()}
TARGET_IMAGE_SIZE: Tuple[int, int] = (224, 224)


# ---------------------------------------------------------------------------
# MediaPipe face detection helpers
# ---------------------------------------------------------------------------
_mp_face_detection = mp_face_detection


_FACE_DETECTOR_LOCK = threading.Lock()
_FACE_DETECTORS: Dict[int, Any] = {}


@dataclass
class DetectionResult:
    """Lightweight storage for face detection results."""

    rect: Tuple[int, int, int, int]
    score: float


def _get_face_detector(model_selection: int = 1):
    with _FACE_DETECTOR_LOCK:
        detector = _FACE_DETECTORS.get(model_selection)
        if detector is None:
            if _mp_face_detection is None:
                raise ImportError("mediapipe is not available; install mediapipe to enable face detection")
            detector = _mp_face_detection.FaceDetection(
                model_selection=model_selection,
                min_detection_confidence=0.4,
            )
            _FACE_DETECTORS[model_selection] = detector
        return detector


def detect_face_bbox(image_rgb: np.ndarray, min_score: float = 0.5) -> Optional[DetectionResult]:
    """Return the strongest face bounding box in absolute pixel coordinates."""

    # Try multiple detector configs so angled or distant faces still register.
    attempts = [
        (1, min_score),
        (0, min(0.45, min_score)),
        (1, 0.3),
    ]

    best_rect: Optional[DetectionResult] = None

    for model_selection, score_threshold in attempts:
        detector = _get_face_detector(model_selection)
        results = detector.process(image_rgb)
        if not results.detections:
            continue

        candidate = max(results.detections, key=lambda det: det.score)
        score = float(candidate.score)
        if score < score_threshold:
            continue

        bbox = candidate.location_data.relative_bounding_box
        h, w, _ = image_rgb.shape
        x_min = max(0.0, bbox.xmin)
        y_min = max(0.0, bbox.ymin)
        width = min(1.0, bbox.width)
        height = min(1.0, bbox.height)

        x0 = int(np.floor(x_min * w))
        y0 = int(np.floor(y_min * h))
        x1 = int(np.ceil((x_min + width) * w))
        y1 = int(np.ceil((y_min + height) * h))

        result = DetectionResult(rect=(x0, y0, x1, y1), score=score)
        if best_rect is None or result.score > best_rect.score:
            best_rect = result

    return best_rect


def crop_to_face(image_rgb: np.ndarray, detection: Optional[DetectionResult], padding: float = 0.25) -> np.ndarray:
    """Crop image around the detected face; fall back to a centred square crop."""

    h, w, _ = image_rgb.shape
    if detection is None:
        side = min(h, w)
        y0 = (h - side) // 2
        x0 = (w - side) // 2
        return image_rgb[y0 : y0 + side, x0 : x0 + side]

    x0, y0, x1, y1 = detection.rect
    box_w = x1 - x0
    box_h = y1 - y0
    pad_w = int(box_w * padding)
    pad_h = int(box_h * padding)

    x0p = max(0, x0 - pad_w)
    y0p = max(0, y0 - pad_h)
    x1p = min(w, x1 + pad_w)
    y1p = min(h, y1 + pad_h)

    return image_rgb[y0p:y1p, x0p:x1p]


def normalise_lighting(image_rgb: np.ndarray) -> np.ndarray:
    """Apply CLAHE on the V channel in HSV space to stabilise exposure."""

    hsv = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2HSV)
    h, s, v = cv2.split(hsv)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    v_eq = clahe.apply(v)
    hsv_eq = cv2.merge((h, s, v_eq))
    return cv2.cvtColor(hsv_eq, cv2.COLOR_HSV2RGB)


def preprocess_array(
    image_rgb: np.ndarray,
    target_size: Tuple[int, int] = TARGET_IMAGE_SIZE,
    enforce_face: bool = True,
    min_face_score: float = 0.5,
) -> Tuple[np.ndarray, float]:
    """Preprocess a raw RGB image and return (processed_image, face_score)."""

    if image_rgb.ndim != 3 or image_rgb.shape[2] != 3:
        raise ValueError("Expected RGB image with 3 channels")

    detection = detect_face_bbox(image_rgb, min_score=min_face_score)
    if detection is None and enforce_face:
        raise ValueError("Face detection failed")

    cropped = crop_to_face(image_rgb, detection, padding=0.28)
    resized = cv2.resize(cropped, target_size, interpolation=cv2.INTER_AREA)
    normalised = normalise_lighting(resized)
    face_score = detection.score if detection is not None else 0.0
    tensor = normalised.astype(np.float32)
    return tensor, face_score


def preprocess_image_file(
    file_path: Path | str,
    target_size: Tuple[int, int] = TARGET_IMAGE_SIZE,
    enforce_face: bool = True,
    min_face_score: float = 0.5,
) -> Tuple[np.ndarray, float]:
    """Load an image from disk and run preprocessing."""

    path = Path(file_path)
    data = cv2.imread(str(path), cv2.IMREAD_COLOR)
    if data is None:
        raise FileNotFoundError(f"Failed to read image: {path}")
    rgb = cv2.cvtColor(data, cv2.COLOR_BGR2RGB)
    return preprocess_array(rgb, target_size=target_size, enforce_face=enforce_face, min_face_score=min_face_score)


def preprocess_image_bytes(
    image_bytes: bytes,
    target_size: Tuple[int, int] = TARGET_IMAGE_SIZE,
    enforce_face: bool = True,
    min_face_score: float = 0.5,
) -> Tuple[np.ndarray, float]:
    """Decode raw bytes into an RGB image and preprocess it."""

    buffer = np.frombuffer(image_bytes, dtype=np.uint8)
    decoded = cv2.imdecode(buffer, cv2.IMREAD_COLOR)
    if decoded is None:
        raise ValueError("Unable to decode image bytes")
    rgb = cv2.cvtColor(decoded, cv2.COLOR_BGR2RGB)
    return preprocess_array(rgb, target_size=target_size, enforce_face=enforce_face, min_face_score=min_face_score)


def filter_labelled_files(file_iter: Iterable[Tuple[Path, str]]) -> Tuple[np.ndarray, np.ndarray]:
    """Filter dataset paths to the supported label set."""

    paths: list[str] = []
    labels: list[int] = []
    for path, label in file_iter:
        label_key = label.lower().strip()
        if label_key not in LABEL_TO_INDEX:
            continue
        paths.append(str(path))
        labels.append(LABEL_TO_INDEX[label_key])
    return np.array(paths), np.array(labels, dtype=np.int32)
