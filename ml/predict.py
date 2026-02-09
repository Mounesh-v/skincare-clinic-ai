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


class PredictionResult(TypedDict):
    image: str
    best_index: int
    probabilities: List[float]
    face_score: float
    top_indices: List[int]
    top_predictions: List[TopPrediction]


def infer(model: torch.nn.Module, image_path: Path, device: torch.device) -> PredictionResult:
    processed, face_score = preprocess_image_file(image_path, enforce_face=True)
    tensor = to_tensor(processed).to(device)
    with torch.no_grad():
        logits = model(tensor)
        probs = torch.softmax(logits, dim=1).squeeze(0).cpu().numpy()
    best_idx = int(np.argmax(probs))
    top_idx = np.argsort(probs)[::-1][: min(3, probs.shape[0])]
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
    }


def iter_images(target: Path) -> Iterable[Path]:
    if target.is_dir():
        for file_path in sorted(target.rglob("*")):
            if file_path.suffix.lower() in {".jpg", ".jpeg", ".png", ".bmp", ".webp"}:
                yield file_path
    else:
        yield target


def format_output(result: PredictionResult, idx_to_label: Dict[int, str], display_labels: Dict[str, str]) -> str:
    idx = int(result["best_index"])
    label_key = idx_to_label[idx]
    friendly = display_labels.get(label_key, label_key.title())
    prob_values = np.asarray(result["probabilities"], dtype=float)
    prob_percent = prob_values[idx] * 100
    face_score = float(result["face_score"])
    top_chunks: List[str] = []
    for rank_idx in result.get("top_indices", []):
        label = idx_to_label.get(rank_idx, str(rank_idx))
        friendly_label = display_labels.get(label, label.title())
        top_chunks.append(f"{friendly_label}={prob_values[rank_idx] * 100:.1f}%")
    top_str = ", ".join(top_chunks)
    return (
        f"{result['image']}: {friendly} ({prob_percent:.1f}% confidence, face score {face_score:.2f})"
        + (f" | Top-3 {top_str}" if top_str else "")
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Run inference on images")
    parser.add_argument("path", type=Path, help="Image file or directory")
    parser.add_argument("--weights", type=Path, default=CONFIG.models_dir / "skin_classifier.pt")
    parser.add_argument("--class-map", type=Path, default=CONFIG.class_map_path)
    parser.add_argument("--json", action="store_true", help="Emit JSON instead of text")
    parser.add_argument(
        "--min-face-score",
        type=float,
        default=0.2,
        help="Skip outputs whose detected face confidence is below this threshold",
    )
    args = parser.parse_args()

    idx_to_label, _, display_labels = load_class_map(args.class_map)
    model = inference_model(len(idx_to_label), args.weights)
    device = torch.device(CONFIG.default_device)
    model.to(device)

    results: List[PredictionResult] = []
    rejected: List[PredictionResult] = []
    for image_path in iter_images(args.path):
        try:
            result = infer(model, image_path, device)
            if result["face_score"] < args.min_face_score:
                rejected.append(result)
                if not args.json:
                    print(
                        f"Skipped {image_path}: insufficient face score {result['face_score']:.2f}"
                        f" (< {args.min_face_score:.2f}). Prompt user to retake."
                    )
                continue
            results.append(result)
            if not args.json:
                print(format_output(result, idx_to_label, display_labels))
        except Exception as exc:  # pragma: no cover - CLI guardrail
            print(f"Failed on {image_path}: {exc}")

    if args.json:
        payload: Dict[str, object] = {"results": results}
        if rejected:
            payload["rejected"] = rejected
        print(json.dumps(payload, indent=2))
    elif rejected:
        print(
            f"Skipped {len(rejected)} image(s) due to low face score (< {args.min_face_score:.2f})."
            " Consider retaking those photos."
        )


if __name__ == "__main__":
    main()
