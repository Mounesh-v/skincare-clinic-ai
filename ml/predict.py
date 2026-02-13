"""Inference helpers for the trained skin-type classifier."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Dict, Iterable, List, TypedDict

import numpy as np
import torch

from .config import CONFIG
from .preprocessing import preprocess_image_file
from .model_utils import inference_model, load_class_map, to_tensor


class TopPrediction(TypedDict):
    index: int
    probability: float


from typing import Optional

class PredictionResult(TypedDict, total=False):
    image: str
    best_index: int
    probabilities: List[float]
    face_score: float
    top_indices: List[int]
    top_predictions: List[TopPrediction]
    confidence: float
    message: Optional[str]
    error: Optional[str]


def infer(model: torch.nn.Module, image_path: Path, device: torch.device, threshold: float = 0.65) -> PredictionResult:
    try:
        processed, face_score = preprocess_image_file(image_path, enforce_face=True)
        tensor = to_tensor(processed).to(device)
        with torch.no_grad():
            logits = model(tensor)
            probs = torch.softmax(logits, dim=1).squeeze(0).cpu().numpy()
        best_idx = int(np.argmax(probs))
        top_idx = np.argsort(probs)[::-1][: min(3, probs.shape[0])]
        confidence = float(probs[best_idx])
        message = None
        if confidence < threshold:
            message = "Low confidence – Retake image"
        return {
            "image": str(image_path),
            "best_index": best_idx,
            "probabilities": probs.tolist(),
            "face_score": face_score,
            "top_indices": [int(idx) for idx in top_idx],
            "top_predictions": [
                {"index": int(idx), "probability": float(probs[int(idx)])}
                for idx in top_idx
            ],
            "confidence": confidence,
            "message": message,
        }
    except Exception as e:
        return {
            "image": str(image_path),
            "error": str(e),
            "probabilities": [],
            "face_score": 0.0,
            "top_indices": [],
            "top_predictions": [],
            "confidence": 0.0,
            "message": f"Failed to process image: {e}"
        }


def iter_images(target: Path) -> Iterable[Path]:
    if target.is_dir():
        for file_path in sorted(target.rglob("*")):
            if file_path.suffix.lower() in {".jpg", ".jpeg", ".png", ".bmp", ".webp"}:
                yield file_path
    else:
        yield target


def format_output(result: PredictionResult, idx_to_label: Dict[int, str], display_labels: Dict[str, str]) -> str:
    idx = int(result.get("best_index", -1))
    label_key = idx_to_label.get(idx, str(idx))
    friendly = display_labels.get(label_key, label_key.title())
    prob_values = np.asarray(result.get("probabilities", []), dtype=float)
    prob_percent = prob_values[idx] * 100 if idx >= 0 and idx < len(prob_values) else 0.0
    face_score = float(result.get("face_score", 0.0))
    top_chunks: List[str] = []
    for rank_idx in result.get("top_indices", []):
        label = idx_to_label.get(rank_idx, str(rank_idx))
        friendly_label = display_labels.get(label, label.title())
        top_chunks.append(f"{friendly_label}={prob_values[rank_idx] * 100:.1f}%" if rank_idx < len(prob_values) else f"{friendly_label}=N/A")
    top_str = ", ".join(top_chunks)
    return (
        f"{result.get('image', 'unknown')}: {friendly} ({prob_percent:.1f}% confidence, face score {face_score:.2f})"
        + (f" | Top-3 {top_str}" if top_str else "")
    )


def main() -> None:
    import logging
    import sys
    logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
    parser = argparse.ArgumentParser(description="Run inference on images")
    parser.add_argument("--image", type=Path, required=True, help="Image file path")
    parser.add_argument("--weights", type=Path, default=CONFIG.models_dir / "skin_classifier.pt")
    parser.add_argument("--class-map", type=Path, default=CONFIG.class_map_path)
    parser.add_argument("--threshold", type=float, default=CONFIG.confidence_threshold)
    parser.add_argument("--json", action="store_true", help="Emit JSON instead of text")
    args = parser.parse_args()

    idx_to_label, _, display_labels = load_class_map(args.class_map)
    model = inference_model(len(idx_to_label), args.weights)
    device = torch.device("cpu")
    model.to(device)

    result = infer(model, args.image, device, threshold=args.threshold)
    if args.json:
        print(json.dumps(result, indent=2))
    else:
        if result.get("error"):
            logging.error(result.get("message", result.get("error", "Unknown error")))
        else:
            print(format_output(result, idx_to_label, display_labels))

if __name__ == "__main__":
    main()
