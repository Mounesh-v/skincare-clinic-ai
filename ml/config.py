"""Central configuration for the skin-type ML pipeline."""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Sequence, Tuple


@dataclass(frozen=True)
class SkinConfig:
    """Immutable settings shared across training, inference, and realtime apps.

    Primary model: EfficientNetV2-S (skin_classifier_v2s.pt)
    """

    base_dir: Path = Path(__file__).resolve().parent
    models_dir: Path = base_dir / "models"
    assets_dir: Path = base_dir / "assets"
    class_map_path: Path = base_dir / "class_map.json"
    mediapipe_face_model: Path = assets_dir / "face_detection_short_range.tflite"
    dataset_root: Path = Path(os.getenv("SKINCARE_DATASET_ROOT", str(base_dir / "data" / "raw" / "Skin v2")))
    model_v2s_weights: Path = models_dir / "skin_classifier_v2s.pt"
    image_size: int = 384
    batch_size: int = 16
    num_epochs: int = 35
    learning_rate_backbone: float = 1e-5
    learning_rate_head: float = 1e-4
    confidence_threshold: float = 0.65
    quality_min_brightness: float = 0.2
    quality_max_brightness: float = 0.9
    quality_min_blur_score: float = 100.0
    canonical_labels: Sequence[str] = ("acne", "blackheads", "dark spots", "pores", "wrinkles")
    display_labels: Dict[str, str] = None  # type: ignore[assignment]
    mediapipe_model_selection: int = int(os.getenv("SKINCARE_MP_MODEL_SELECTION", "1"))
    mediapipe_confidence: float = float(os.getenv("SKINCARE_MP_CONFIDENCE", "0.45"))
    face_padding: float = float(os.getenv("SKINCARE_FACE_PADDING", "0.32"))
    min_face_score: float = float(os.getenv("SKINCARE_MIN_FACE_SCORE", "0.4"))
    normalization_mean: Tuple[float, float, float] = (0.485, 0.456, 0.406)
    normalization_std: Tuple[float, float, float] = (0.229, 0.224, 0.225)
    rng_seed: int = int(os.getenv("SKINCARE_RNG_SEED", "2024"))
    default_device: str = os.getenv("SKINCARE_DEVICE", "cpu")

    def __post_init__(self) -> None:  # pragma: no cover - simple assignment fixup
        pretty_labels = {label: label.replace("_", " ").title() for label in self.canonical_labels}
        object.__setattr__(self, "display_labels", pretty_labels)
        self.models_dir.mkdir(parents=True, exist_ok=True)
        self.assets_dir.mkdir(parents=True, exist_ok=True)
        self._sync_class_map()
        if not self.mediapipe_face_model.exists():
            raise FileNotFoundError(
                f"Missing MediaPipe face detector asset at {self.mediapipe_face_model}."
                " Run the setup step to download 'face_detection_short_range.tflite'."
            )

    def _sync_class_map(self) -> None:
        idx_to_label = {str(i): label for i, label in enumerate(self.canonical_labels)}
        label_to_idx = {label: idx for idx, label in enumerate(self.canonical_labels)}
        payload = {
            "idx_to_label": idx_to_label,
            "label_to_idx": label_to_idx,
            "display_labels": self.display_labels,
        }
        try:
            existing = json.loads(self.class_map_path.read_text(encoding="utf-8"))
        except FileNotFoundError:
            existing = {}
        except json.JSONDecodeError:
            existing = {}
        if existing != payload:
            self.class_map_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


CONFIG = SkinConfig()
