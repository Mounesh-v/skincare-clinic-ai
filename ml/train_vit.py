"""
Fine-tuning script for the ViT skin-type classifier.

Usage:
    python -m ml.train_vit

Dataset expected at: ml/data/raw/Skin v2/
Label mapping:
    acne        → oily
    blackheads  → oily
    pores       → oily
    wrinkles    → dry
    dark spots  → normal

Best checkpoint saved to: ml/models/vit_skin_type/
"""

from __future__ import annotations

import random
import sys
from pathlib import Path
from typing import Dict, List, Tuple

# ---------------------------------------------------------------------------
# Imports
# ---------------------------------------------------------------------------
try:
    import torch
    import torch.nn as nn
    from torch.utils.data import DataLoader, Dataset
    from transformers import AutoFeatureExtractor, AutoModelForImageClassification
    from tqdm import tqdm
    from PIL import Image
    import numpy as np
except ImportError as exc:
    print(f"ERROR: Missing dependency — {exc}")
    print("Run: pip install transformers torch Pillow tqdm")
    sys.exit(1)

from .config import CONFIG

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
BASE_MODEL = "google/vit-base-patch16-224"
SAVE_DIR = CONFIG.models_dir / "vit_skin_type"
DATASET_ROOT = CONFIG.dataset_root  # ml/data/raw/Skin v2

LABEL_MAP: Dict[str, str] = {
    "acne": "oily",
    "blackheads": "oily",
    "pores": "oily",
    "wrinkles": "dry",
    "dark spots": "normal",
    # Tolerate underscore variants
    "dark_spots": "normal",
}

SKIN_TYPES = ["dry", "normal", "oily"]
LABEL2ID = {label: idx for idx, label in enumerate(SKIN_TYPES)}
ID2LABEL = {idx: label for label, idx in LABEL2ID.items()}

BATCH_SIZE = 8
NUM_EPOCHS = CONFIG.num_epochs
LR_BACKBONE = 2e-5
LR_HEAD = 2e-4
EARLY_STOP_PATIENCE = 5
VAL_SPLIT = 0.2
RNG_SEED = CONFIG.rng_seed


# ---------------------------------------------------------------------------
# Dataset
# ---------------------------------------------------------------------------
class SkinTypeDataset(Dataset):
    """Reads images from Skin v2/ subfolders, maps to skin type labels."""

    def __init__(self, samples: List[Tuple[Path, int]], extractor) -> None:
        self.samples = samples
        self.extractor = extractor

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> Dict:
        path, label_id = self.samples[idx]
        try:
            image = Image.open(path).convert("RGB")
        except Exception:
            # Return a blank image on corrupt files rather than crashing
            image = Image.new("RGB", (224, 224), color=(128, 128, 128))
        inputs = self.extractor(images=image, return_tensors="pt")
        pixel_values = inputs["pixel_values"].squeeze(0)  # (3, 224, 224)
        return {"pixel_values": pixel_values, "labels": torch.tensor(label_id, dtype=torch.long)}


def _collect_samples(dataset_root: Path) -> List[Tuple[Path, int]]:
    """Walk dataset_root subfolders and collect (image_path, label_id) pairs."""
    samples: List[Tuple[Path, int]] = []
    image_exts = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

    if not dataset_root.exists():
        raise FileNotFoundError(
            f"Dataset not found at: {dataset_root}\n"
            "Expected structure: ml/data/raw/Skin v2/<condition>/<image.jpg>"
        )

    found_folders: List[str] = []
    for folder in sorted(dataset_root.iterdir()):
        if not folder.is_dir():
            continue
        folder_name = folder.name.lower()
        skin_type = LABEL_MAP.get(folder_name)
        if skin_type is None:
            print(f"  [WARN] Unknown folder '{folder.name}' — skipping.")
            continue
        found_folders.append(folder.name)
        label_id = LABEL2ID[skin_type]
        for img_path in folder.rglob("*"):
            if img_path.suffix.lower() in image_exts:
                samples.append((img_path, label_id))

    print(f"[DATA] Found folders: {found_folders}")
    print(f"[DATA] Total images: {len(samples)}")
    return samples


def _split(samples: List[Tuple[Path, int]], val_ratio: float, seed: int, max_samples: int = 2000):
    rng = random.Random(seed)
    shuffled = list(samples)
    rng.shuffle(shuffled)
    
    # Speed up: Subsample if requested
    if max_samples and len(shuffled) > max_samples:
        print(f"[SPEED] Subsampling dataset from {len(shuffled)} to {max_samples} for faster CPU training.")
        shuffled = shuffled[:max_samples]
        
    split_idx = int(len(shuffled) * (1 - val_ratio))
    return shuffled[:split_idx], shuffled[split_idx:]


# ---------------------------------------------------------------------------
# Training helpers
# ---------------------------------------------------------------------------
def _set_backbone_frozen(model, frozen: bool) -> None:
    """Freeze or unfreeze all ViT layers except the classifier head."""
    for name, param in model.named_parameters():
        if "classifier" in name:
            param.requires_grad = True  # head always trainable
        else:
            param.requires_grad = not frozen


def _make_optimizer(model, frozen_backbone: bool):
    head_params = [p for n, p in model.named_parameters() if "classifier" in n and p.requires_grad]
    backbone_params = [p for n, p in model.named_parameters() if "classifier" not in n and p.requires_grad]
    param_groups = [{"params": head_params, "lr": LR_HEAD}]
    if backbone_params:
        param_groups.append({"params": backbone_params, "lr": LR_BACKBONE})
    return torch.optim.AdamW(param_groups, weight_decay=0.01)


def _run_epoch(model, loader, optimizer, device, train: bool) -> Tuple[float, float]:
    model.train(train)
    total_loss = 0.0
    correct = 0
    total = 0
    criterion = nn.CrossEntropyLoss()

    with torch.set_grad_enabled(train):
        for batch in loader:
            pixel_values = batch["pixel_values"].to(device)
            labels = batch["labels"].to(device)

            outputs = model(pixel_values=pixel_values)
            loss = criterion(outputs.logits, labels)

            if train:
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()

            total_loss += loss.item() * labels.size(0)
            preds = outputs.logits.argmax(dim=-1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)

    avg_loss = total_loss / total if total > 0 else 0.0
    accuracy = correct / total if total > 0 else 0.0
    return avg_loss, accuracy


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main() -> None:
    print("=" * 60)
    print("ViT Skin Type Fine-tuning")
    print("=" * 60)
    print(f"Dataset : {DATASET_ROOT}")
    print(f"Base    : {BASE_MODEL}")
    print(f"Save to : {SAVE_DIR}")
    print(f"Epochs  : {NUM_EPOCHS}  |  Batch: {BATCH_SIZE}  |  Seed: {RNG_SEED}")
    print()

    device = torch.device("cpu")
    print(f"[INFO] Running on: {device}")

    # Load feature extractor
    print(f"[1/4] Loading feature extractor from '{BASE_MODEL}' ...")
    extractor = AutoFeatureExtractor.from_pretrained(BASE_MODEL)

    # Load model
    print(f"[2/4] Loading model from '{BASE_MODEL}' ...")
    model = AutoModelForImageClassification.from_pretrained(
        BASE_MODEL,
        num_labels=len(SKIN_TYPES),
        id2label=ID2LABEL,
        label2id=LABEL2ID,
        ignore_mismatched_sizes=True,
    )
    model.to(device)

    # Collect and split data
    print("[3/4] Collecting dataset ...")
    all_samples = _collect_samples(DATASET_ROOT)
    if not all_samples:
        print("ERROR: No images found. Check dataset path and folder names.")
        sys.exit(1)

    train_samples, val_samples = _split(all_samples, VAL_SPLIT, RNG_SEED)
    print(f"[DATA] Train: {len(train_samples)}  |  Val: {len(val_samples)}")

    train_ds = SkinTypeDataset(train_samples, extractor)
    val_ds = SkinTypeDataset(val_samples, extractor)

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True, num_workers=4, pin_memory=True)
    val_loader = DataLoader(val_ds, batch_size=BATCH_SIZE, shuffle=False, num_workers=4, pin_memory=True)

    # Training loop
    print("[4/4] Training ...")
    best_val_acc = 0.0
    patience_counter = 0
    SAVE_DIR.mkdir(parents=True, exist_ok=True)

    for epoch in range(1, NUM_EPOCHS + 1):
        # Phase: freeze backbone for first 3 epochs
        freeze = epoch <= 3
        _set_backbone_frozen(model, frozen=freeze)
        optimizer = _make_optimizer(model, frozen_backbone=freeze)

        phase_tag = "backbone frozen" if freeze else "all layers"
        print(f"\nEpoch {epoch}/{NUM_EPOCHS}  [{phase_tag}]")

        # Train
        train_loss, train_acc = _run_epoch(model, train_loader, optimizer, device, train=True)
        # Validate
        val_loss, val_acc = _run_epoch(model, val_loader, optimizer, device, train=False)

        print(
            f"  train_loss={train_loss:.4f}  train_acc={train_acc:.4f}"
            f"  |  val_loss={val_loss:.4f}  val_acc={val_acc:.4f}"
        )

        # Save best
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            patience_counter = 0
            print(f"  ✓ New best val_acc={best_val_acc:.4f} — saving checkpoint ...")
            model.save_pretrained(str(SAVE_DIR))
            extractor.save_pretrained(str(SAVE_DIR))
        else:
            patience_counter += 1
            print(f"  No improvement ({patience_counter}/{EARLY_STOP_PATIENCE})")
            if patience_counter >= EARLY_STOP_PATIENCE:
                print(f"\n[EARLY STOP] No improvement for {EARLY_STOP_PATIENCE} epochs.")
                break

    print()
    print("=" * 60)
    print(f"Best val accuracy : {best_val_acc:.4f}")
    print(f"Saved to          : {SAVE_DIR}")
    print("=" * 60)


if __name__ == "__main__":
    main()
