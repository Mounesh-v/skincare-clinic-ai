"""Realtime webcam loop with MediaPipe detection and EfficientNet classification."""

from __future__ import annotations

import argparse
import time
from pathlib import Path

import cv2
import numpy as np
import torch

from .config import CONFIG
from .model_utils import inference_model, load_class_map, to_tensor
from .preprocessing import DetectionResult, detect_face_bbox, preprocess_array
from .skin_type_vit import infer_skin_type_vit


COLORS = {
    "background": (20, 20, 20),
    "text": (255, 255, 255),
    "dry": (102, 153, 255),
    "oily": (102, 255, 178),
    "normal": (255, 204, 102),
}


def draw_label(frame: np.ndarray, detection: DetectionResult, label: str, prob: float) -> None:
    x0, y0, x1, y1 = detection.rect
    color = COLORS.get(label.lower(), (0, 255, 0))
    cv2.rectangle(frame, (x0, y0), (x1, y1), color, 2)
    bar_top = y1 + 10
    bar_height = 10
    bar_width = int((x1 - x0) * prob)
    cv2.rectangle(frame, (x0, bar_top), (x0 + bar_width, bar_top + bar_height), color, -1)
    text = f"{label.title()} {prob * 100:.1f}%"
    cv2.putText(frame, text, (x0, max(30, y0 - 10)), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)


def annotate_status(frame: np.ndarray, message: str) -> None:
    cv2.rectangle(frame, (0, 0), (frame.shape[1], 30), COLORS["background"], -1)
    cv2.putText(frame, message, (10, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.6, COLORS["text"], 2)


def run_loop(weights: Path, class_map: Path, camera_index: int, min_score: float, mirror: bool) -> None:
    import logging
    logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
    idx_to_label, _, display_labels = load_class_map(class_map)
    model = inference_model(len(idx_to_label), weights)
    device = torch.device("cpu")
    model.to(device)

    cap = cv2.VideoCapture(camera_index)
    if not cap.isOpened():
        logging.error(f"Unable to open camera index {camera_index}")
        return

    last_prediction = "Initializing"
    fps_start = time.time()
    frames = 0

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                last_prediction = "Camera frame unavailable"
                break
            if mirror:
                frame = cv2.flip(frame, 1)
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            detection = detect_face_bbox(rgb, min_score)
            if detection is None:
                annotate_status(frame, "No face detected")
            else:
                processed, _ = preprocess_array(rgb, detection=detection, enforce_face=False)
                tensor = to_tensor(processed).to(device)
                with torch.no_grad():
                    logits = model(tensor)
                    probs = torch.softmax(logits, dim=1).squeeze(0).cpu().numpy()
                # Infer skin type using ViT model
                skin_result = infer_skin_type_vit(processed)
                skin_type = skin_result["skin_type"]
                best_idx = int(np.argmax(probs))
                label_key = idx_to_label[best_idx]
                friendly = display_labels.get(label_key, label_key.title())
                confidence = float(probs[best_idx])
                draw_label(frame, detection, friendly, confidence)
                last_prediction = f"{friendly}: {confidence * 100:.1f}% | Skin type: {skin_type}"
            frames += 1
            elapsed = time.time() - fps_start
            fps = frames / elapsed if elapsed > 0 else 0.0
            annotate_status(frame, f"{last_prediction} | {fps:.1f} FPS")
            cv2.imshow("Skin Analyzer", frame)
            key = cv2.waitKey(1) & 0xFF
            if key in (27, ord("q")):
                break
    finally:
        cap.release()
        cv2.destroyAllWindows()


def main() -> None:
    parser = argparse.ArgumentParser(description="Realtime webcam skin analyzer")
    parser.add_argument("--weights", type=Path, default=CONFIG.models_dir / "skin_classifier.pt")
    parser.add_argument("--class-map", type=Path, default=CONFIG.class_map_path)
    parser.add_argument("--camera", type=int, default=0)
    parser.add_argument("--min-score", type=float, default=CONFIG.min_face_score)
    parser.add_argument("--no-mirror", action="store_true", help="Disable mirrored preview")
    args = parser.parse_args()

    run_loop(args.weights, args.class_map, args.camera, args.min_score, mirror=not args.no_mirror)


if __name__ == "__main__":
    main()
