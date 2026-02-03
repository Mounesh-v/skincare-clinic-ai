"""Utilities for loading and running the skin-type classification model.

The predictor uses a TorchScript module saved via the training script in
``train_skin_model.py``. When a trained model file is not available the
predictor gracefully falls back to lightweight heuristics so that the API keeps
responding, while clearly flagging the reduced confidence.
"""

from __future__ import annotations

import importlib
import io
import statistics
from pathlib import Path
from typing import TYPE_CHECKING, Any, Dict, Iterable, List, Optional, Tuple


def _optional_import(module_name: str) -> Optional[Any]:  # pragma: no cover - helper
    try:
        return importlib.import_module(module_name)
    except ImportError:
        return None


torch = _optional_import("torch")
transforms = _optional_import("torchvision.transforms")
Image = _optional_import("PIL.Image")
ImageFilter = _optional_import("PIL.ImageFilter")

if TYPE_CHECKING:  # pragma: no cover - typing helpers
    PILImage = Any  # type: ignore[assignment]
    Tensor = Any  # type: ignore[assignment]
    Module = Any  # type: ignore[assignment]

SKIN_LABELS = ["dry", "oily", "combination", "sensitive", "normal"]


class SkinTypePredictor:
    """Wraps a torch model (if present) and exposes convenience helpers."""

    def __init__(self, weights_path: Optional[Path] = None) -> None:
        self.weights_path = Path(weights_path) if weights_path else None
        torch_module = torch
        if torch_module is not None:
            self.device = torch_module.device("cuda" if torch_module.cuda.is_available() else "cpu")
        else:  # Torch not installed; keep device placeholder for type checkers
            self.device = "cpu"

        self._model: Optional["Module"] = None
        self.available = False
        self.transform = self._build_transform()
        self._load_model()

    # ---------------------------------------------------------------------
    # Public API
    # ---------------------------------------------------------------------
    def predict(self, image_bytes: bytes) -> Dict[str, object]:
        """Return predicted skin type, probabilities, and simple feature stats."""

        image_module = Image
        if image_module is None:
            raise RuntimeError("Pillow is required for image analysis but is not installed")

        image = image_module.open(io.BytesIO(image_bytes)).convert("RGB")
        feature_stats = self._compute_feature_stats(image)
        face_score = self._estimate_face_presence(image)
        if face_score < 0.12:  # not enough facial structure detected
            raise ValueError("No_face_detected")

        if self.available and self._model is not None:
            probabilities = self._run_model(image)
            top_label, top_score = max(probabilities, key=lambda item: item[1])
            confidence = float(round(top_score, 4))
            notes = None
            if feature_stats["lighting_variability"] > 0.35:
                notes = "Lighting variability is high. Try capturing in even daylight for sharper results."
        else:
            top_label, confidence, probabilities, notes = self._fallback_prediction(feature_stats)

        feature_insights = [
            {"label": "Brightness", "value": round(feature_stats["brightness"] * 100, 2), "unit": ""},
            {
                "label": "Texture Contrast",
                "value": round(feature_stats["texture_contrast"] * 100, 2),
                "unit": "",
            },
            {
                "label": "Lighting Variability",
                "value": round(feature_stats["lighting_variability"] * 100, 2),
                "unit": "",
            },
        ]

        return {
            "predicted_skin_type": top_label,
            "confidence": confidence,
            "probabilities": [
                {"label": label, "score": float(round(score, 4))} for label, score in probabilities
            ],
            "feature_insights": feature_insights,
            "notes": notes,
            "face_score": float(round(face_score, 3)),
        }

    def _estimate_face_presence(self, image: "PILImage") -> float:
        grayscale = image.convert("L")
        resized = grayscale.resize((64, 64))
        pixels = list(resized.getdata())
        mean_intensity = statistics.mean(pixels)
        variance = statistics.pvariance(pixels)
        if ImageFilter is not None:
            edges = resized.filter(ImageFilter.FIND_EDGES)
            edge_values = list(edges.getdata())
        else:
            # Fall back to grayscale variance when edge detector is unavailable.
            edge_values = pixels
        edge_mean = statistics.mean(edge_values) if edge_values else 0.0
        score = (variance / (mean_intensity + 1.0)) * 0.4 + (edge_mean / 255.0) * 0.6
        return float(max(0.0, min(score, 1.0)))

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------
    def _load_model(self) -> None:
        torch_module = torch
        if torch_module is None:
            self.available = False
            return

        if not self.weights_path or not self.weights_path.exists():
            self.available = False
            return

        try:
            loaded_model = torch_module.jit.load(str(self.weights_path), map_location=self.device)
            loaded_model.eval()
            loaded_model.to(self.device)
            self._model = loaded_model
            if self.transform is None:
                print("[SkinTypePredictor] TorchVision transforms unavailable; running in heuristic mode")
                self.available = False
            else:
                self.available = True
        except (RuntimeError, ValueError) as error:  # pragma: no cover - defensive
            print(f"[SkinTypePredictor] Failed to load model: {error}")
            self._model = None
            self.available = False

    def _run_model(self, image: "PILImage") -> List[Tuple[str, float]]:
        torch_module = torch
        if torch_module is None or self._model is None or self.transform is None:
            raise RuntimeError("Torch runtime or preprocessing pipeline unavailable")

        tensor = self.transform(image).unsqueeze(0).to(self.device)
        with torch_module.no_grad():
            logits = self._model(tensor)
            probabilities = torch_module.softmax(logits, dim=1).squeeze(0)

        return list(zip(SKIN_LABELS, probabilities.cpu().tolist()))

    @staticmethod
    def _compute_feature_stats(image: "PILImage") -> Dict[str, float]:
        image_module = Image
        image_filter_module = ImageFilter
        if image_filter_module is None or image_module is None:
            raise RuntimeError("Pillow is required for feature analysis but is not installed")
        grayscale = image.convert("L")
        histogram = grayscale.histogram()
        total_pixels = float(sum(histogram))
        brightness = sum(i * hist for i, hist in enumerate(histogram)) / (255.0 * total_pixels)

        blurred = grayscale.filter(image_filter_module.GaussianBlur(3))
        contrast_map = image_module.blend(grayscale, blurred, alpha=0.5)
        contrast_hist = contrast_map.histogram()
        texture_contrast = statistics.pvariance(contrast_hist) / 1e6

        resized = grayscale.resize((32, 32))
        row_means = [statistics.mean(resized.crop((0, y, 32, y + 1)).getdata()) / 255.0 for y in range(32)]
        lighting_variability = statistics.pvariance(row_means)

        return {
            "brightness": brightness,
            "texture_contrast": min(texture_contrast, 1.0),
            "lighting_variability": min(lighting_variability, 0.5),
        }

    @staticmethod
    def _fallback_prediction(feature_stats: Dict[str, float]) -> Tuple[str, float, List[Tuple[str, float]], Optional[str]]:
        brightness = feature_stats["brightness"]
        contrast = feature_stats["texture_contrast"]

        if brightness < 0.35 and contrast < 0.15:
            label = "dry"
        elif brightness > 0.6 and contrast > 0.2:
            label = "oily"
        elif contrast > 0.25:
            label = "combination"
        else:
            label = "normal"

        confidence = 0.55
        probabilities = [(name, 0.1) for name in SKIN_LABELS]
        idx = SKIN_LABELS.index(label)
        probabilities[idx] = (label, confidence)
        notes = "Running in heuristic mode. Train and export the Torch model for higher accuracy."
        return label, confidence, probabilities, notes

    def _build_transform(self) -> Optional[Any]:
        transform_module = transforms
        if transform_module is not None:
            return transform_module.Compose(
                [
                    transform_module.Resize((224, 224)),
                    transform_module.ToTensor(),
                    transform_module.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
                ]
            )
        if torch is None:
            return None
        return self._fallback_transform

    def _fallback_transform(self, image: "PILImage") -> "Tensor":
        torch_module = torch
        if torch_module is None:
            raise RuntimeError("PyTorch is required for preprocessing but is not installed")

        resized = image.convert("RGB").resize((224, 224))
        width, height = resized.size
        data = torch_module.ByteTensor(list(resized.getdata()))
        tensor = data.view(height, width, 3).permute(2, 0, 1).to(dtype=torch_module.float32) / 255.0

        mean = torch_module.tensor([0.485, 0.456, 0.406], dtype=torch_module.float32).view(3, 1, 1)
        std = torch_module.tensor([0.229, 0.224, 0.225], dtype=torch_module.float32).view(3, 1, 1)
        return (tensor - mean) / std


def load_predictor(weights_dir: Path) -> SkinTypePredictor:
    weights_path = weights_dir / "skin_classifier.ts"
    return SkinTypePredictor(weights_path=weights_path)
