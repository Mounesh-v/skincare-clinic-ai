"""
Run once before first launch:
    python -m ml.download_models
Downloads ~330MB ViT model. After this the app runs fully offline.
"""

from __future__ import annotations

import sys
from pathlib import Path


def main() -> None:
    try:
        from transformers import AutoImageProcessor, AutoModelForImageClassification
    except ImportError:
        print("ERROR: 'transformers' package not found.")
        print("Run:  pip install transformers>=4.40.0 torch>=2.0.0 Pillow>=10.0.0")
        sys.exit(1)

    model_id = "dima806/skin_types_image_detection"
    save_dir = Path(__file__).resolve().parent / "models" / "vit_skin_type"

    if save_dir.exists() and any(save_dir.iterdir()):
        print(f"[INFO] Model already present at: {save_dir}")
        print("[INFO] Delete the folder and re-run to force a fresh download.")
        print("Setup complete. Run: python -m service.main")
        return

    save_dir.mkdir(parents=True, exist_ok=True)

    print(f"[1/3] Downloading image processor for '{model_id}' ...")
    extractor = AutoImageProcessor.from_pretrained(model_id)
    print("[1/3] Image processor downloaded.")

    print(f"[2/3] Downloading model weights for '{model_id}' (~330 MB) ...")
    model = AutoModelForImageClassification.from_pretrained(model_id)
    print("[2/3] Model weights downloaded.")

    print(f"[3/3] Saving to {save_dir} ...")
    extractor.save_pretrained(str(save_dir))
    model.save_pretrained(str(save_dir))
    print(f"[3/3] Saved successfully.")

    print()
    print("=" * 60)
    print("Setup complete. Run: python -m service.main")
    print("=" * 60)


if __name__ == "__main__":
    main()
