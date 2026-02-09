"""Shared preprocessing utilities for training, inference, and realtime apps."""

from __future__ import annotations

import threading
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable, Iterator, Optional, Sequence, Tuple

import cv2
import mediapipe as mp  # type: ignore[import]
from mediapipe import Image as MpImage, ImageFormat as MpImageFormat  # type: ignore[import]
from mediapipe.tasks import python as mp_python  # type: ignore[import]
from mediapipe.tasks.python import vision as mp_vision  # type: ignore[import]

try:  # pragma: no cover - optional dependency
    from ultralytics import YOLO  # type: ignore[import]
except Exception:  # pragma: no cover - YOLO optional
    YOLO = None  # type: ignore[assignment]
import numpy as np

from .config import CONFIG

_FACE_DETECTOR_LOCK = threading.Lock()
_FACE_DETECTOR: Optional[Any] = None
_YOLO_FALLBACK: Optional[Any] = None


@dataclass
class DetectionResult:
    """Structure holding absolute pixel coordinates for a detection."""

    rect: Tuple[int, int, int, int]
    score: float


def _build_face_detector() -> Any:
    base_options = mp_python.BaseOptions(model_asset_path=str(CONFIG.mediapipe_face_model))
    options = mp_vision.FaceDetectorOptions(
        base_options=base_options,
        min_detection_confidence=CONFIG.mediapipe_confidence,
    )
    return mp_vision.FaceDetector.create_from_options(options)


def _get_face_detector() -> Any:
    with _FACE_DETECTOR_LOCK:
        global _FACE_DETECTOR
        if _FACE_DETECTOR is None:
            _FACE_DETECTOR = _build_face_detector()
        return _FACE_DETECTOR


def _get_yolo_fallback() -> Optional[Any]:
    if YOLO is None:
        return None
    global _YOLO_FALLBACK
    if _YOLO_FALLBACK is None:
        model_path = CONFIG.yolo_face_weights
        if not model_path.exists():
            return None
        _YOLO_FALLBACK = YOLO(str(model_path))  # type: ignore[arg-type]
    return _YOLO_FALLBACK


def detect_face_bbox(image_rgb: np.ndarray, min_score: float) -> Optional[DetectionResult]:
    detector = _get_face_detector()
    contiguous = np.ascontiguousarray(image_rgb)
    mp_image = MpImage(image_format=MpImageFormat.SRGB, data=contiguous)
    result = detector.detect(mp_image)
    detection = _select_best_detection(result.detections, min_score, image_rgb.shape)
    if detection is None:
        detection = _detect_with_yolo(image_rgb, min_score)
    return detection


def _select_best_detection(
    detections: Sequence[Any] | None,
    min_score: float,
    image_shape: Tuple[int, int, int],
) -> Optional[DetectionResult]:
    if not detections:
        return None
    best_detection = None
    best_score = 0.0
    for det in detections:
        categories = det.categories or []
        if not categories:
            continue
        score = float(categories[0].score)
        if score >= min_score and score > best_score:
            best_detection = det
            best_score = score
    if best_detection is None:
        return None
    bbox = best_detection.bounding_box
    img_h, img_w, _ = image_shape
    x0 = max(0, int(np.floor(bbox.origin_x)))
    y0 = max(0, int(np.floor(bbox.origin_y)))
    x1 = min(img_w, int(np.ceil(bbox.origin_x + bbox.width)))
    y1 = min(img_h, int(np.ceil(bbox.origin_y + bbox.height)))
    if x1 <= x0 or y1 <= y0:
        return None
    return DetectionResult(rect=(x0, y0, x1, y1), score=best_score)


def _detect_with_yolo(image_rgb: np.ndarray, min_score: float) -> Optional[DetectionResult]:
    model = _get_yolo_fallback()
    if model is None:
        return None
    results = model.predict(image_rgb, conf=min_score, max_det=1, imgsz=640, verbose=False)
    if not results:
        return None
    boxes = getattr(results[0], "boxes", None)
    if boxes is None or boxes.xyxy is None or boxes.conf is None or boxes.xyxy.shape[0] == 0:
        return None
    coords = boxes.xyxy.cpu().numpy().astype(float)
    scores = boxes.conf.cpu().numpy().astype(float)
    idx = int(np.argmax(scores))
    score = float(scores[idx])
    if score < min_score:
        return None
    h, w, _ = image_rgb.shape
    x0, y0, x1, y1 = coords[idx]
    return DetectionResult(
        rect=(int(max(0, np.floor(x0))), int(max(0, np.floor(y0))), int(min(w, np.ceil(x1))), int(min(h, np.ceil(y1)))),
        score=score,
    )


def crop_to_face(image_rgb: np.ndarray, detection: Optional[DetectionResult], padding: float) -> np.ndarray:
    h, w, _ = image_rgb.shape
    if detection is None:
        side = min(h, w)
        y0 = (h - side) // 2
        x0 = (w - side) // 2
        return image_rgb[y0 : y0 + side, x0 : x0 + side]
    x0, y0, x1, y1 = detection.rect
    box_w = max(1, x1 - x0)
    box_h = max(1, y1 - y0)
    pad_w = int(box_w * padding)
    pad_h = int(box_h * padding)
    x0p = max(0, x0 - pad_w)
    y0p = max(0, y0 - pad_h)
    x1p = min(w, x1 + pad_w)
    y1p = min(h, y1 + pad_h)
    return image_rgb[y0p:y1p, x0p:x1p]


def normalise_lighting(image_rgb: np.ndarray) -> np.ndarray:
    hsv = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2HSV)
    h, s, v = cv2.split(hsv)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    v_eq = clahe.apply(v)
    hsv_eq = cv2.merge((h, s, v_eq))
    return cv2.cvtColor(hsv_eq, cv2.COLOR_HSV2RGB)


def preprocess_array(
    image_rgb: np.ndarray,
    *,
    detection: Optional[DetectionResult] = None,
    enforce_face: bool = True,
) -> Tuple[np.ndarray, float]:
    if image_rgb.ndim != 3 or image_rgb.shape[2] != 3:
        raise ValueError("Expected an RGB image with three channels")
    local_detection = detection or detect_face_bbox(image_rgb, CONFIG.min_face_score)
    if local_detection is None and enforce_face:
        retry_score = max(0.1, CONFIG.min_face_score * 0.5)
        local_detection = detect_face_bbox(image_rgb, retry_score)
    fallback_to_center = local_detection is None
    cropped = crop_to_face(image_rgb, local_detection, CONFIG.face_padding if not fallback_to_center else 0.0)
    resized = cv2.resize(cropped, CONFIG.image_size, interpolation=cv2.INTER_AREA)
    normalised = normalise_lighting(resized)
    tensor_ready = np.clip(normalised, 0, 255).astype(np.uint8)
    face_score = local_detection.score if local_detection else 0.0
    return tensor_ready, face_score


def preprocess_image_file(path: Path | str, enforce_face: bool = True) -> Tuple[np.ndarray, float]:
    path_obj = Path(path)
    data = cv2.imread(str(path_obj), cv2.IMREAD_COLOR)
    if data is None:
        raise FileNotFoundError(f"Unable to read image: {path_obj}")
    rgb = cv2.cvtColor(data, cv2.COLOR_BGR2RGB)
    return preprocess_array(rgb, enforce_face=enforce_face)


def preprocess_image_bytes(payload: bytes, enforce_face: bool = True) -> Tuple[np.ndarray, float]:
    buffer = np.frombuffer(payload, dtype=np.uint8)
    decoded = cv2.imdecode(buffer, cv2.IMREAD_COLOR)
    if decoded is None:
        raise ValueError("Unable to decode image bytes")
    rgb = cv2.cvtColor(decoded, cv2.COLOR_BGR2RGB)
    return preprocess_array(rgb, enforce_face=enforce_face)


def iter_labelled_files(root: Path, split: str, extensions: Sequence[str] | None = None) -> Iterator[Tuple[Path, str]]:
    suffixes = set(ext.lower() for ext in (extensions or (".jpg", ".jpeg", ".png", ".bmp", ".webp")))
    split_dir = root / split
    for label_dir in split_dir.iterdir():
        if not label_dir.is_dir():
            continue
        label = label_dir.name.lower().strip()
        for file_path in label_dir.rglob("*"):
            if file_path.suffix.lower() in suffixes:
                yield file_path, label


def filter_supported(file_iter: Iterable[Tuple[Path, str]]) -> Tuple[np.ndarray, np.ndarray]:
    paths: list[str] = []
    labels: list[int] = []
    for path, label in file_iter:
        if label not in CONFIG.canonical_labels:
            continue
        idx = CONFIG.canonical_labels.index(label)
        paths.append(str(path))
        labels.append(idx)
    if not paths:
        raise ValueError("No supported images found in dataset")
    return np.array(paths), np.array(labels, dtype=np.int64)
