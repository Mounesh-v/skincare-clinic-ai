from __future__ import annotations

import argparse
import json
import time
from pathlib import Path
from typing import Tuple, cast
from collections import Counter

import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import models, transforms
from torchvision.datasets import ImageFolder
from torch.utils.data import DataLoader, random_split, WeightedRandomSampler
from tqdm import tqdm

from ml.config import CONFIG
from ml.model_utils import AttentionClassifierHead


# =============================================================================
# DATASET CONFIGURATION
# =============================================================================
DATA_DIR = CONFIG.dataset_root


def set_seed(seed: int) -> None:
    """Set random seed for reproducibility."""
    import random, numpy as np
    torch.manual_seed(seed)
    random.seed(seed)
    np.random.seed(seed)


def create_model(
    num_classes: int,
    use_attention: bool = True,
) -> nn.Module:
    """Build EfficientNetV2-S classifier (384×384 input).

    Args:
        num_classes: Number of output classes.
        use_attention: Use SE-style :class:`AttentionClassifierHead` (default
            ``True``).  Pass ``False`` to use a plain ``nn.Linear`` head.

    Returns:
        EfficientNetV2-S model ready for fine-tuning.
    """
    model = models.efficientnet_v2_s(
        weights=models.EfficientNet_V2_S_Weights.IMAGENET1K_V1
    )
    in_features: int = cast(nn.Linear, model.classifier[1]).in_features
    if use_attention:
        model.classifier[1] = AttentionClassifierHead(in_features, num_classes)
    else:
        model.classifier[1] = nn.Linear(in_features, num_classes)
    return model


def freeze_backbone(model: nn.Module) -> None:
    """Freeze all layers except the classifier."""
    for name, param in model.named_parameters():
        if 'classifier' not in name:
            param.requires_grad = False
    print("[OK] Backbone frozen (only classifier trainable)", flush=True)


def unfreeze_backbone(model: nn.Module) -> None:
    """Unfreeze all layers."""
    for param in model.parameters():
        param.requires_grad = True
    print("[OK] Backbone unfrozen (all layers trainable)", flush=True)


def get_optimizer(model: nn.Module, lr_backbone: float, lr_classifier: float) -> optim.Optimizer:
    """Create optimizer with differential learning rates."""
    backbone_params = []
    classifier_params = []

    for name, param in model.named_parameters():
        if not param.requires_grad:
            continue
        if 'classifier' in name:
            classifier_params.append(param)
        else:
            backbone_params.append(param)

    param_groups = []
    if backbone_params:
        param_groups.append({'params': backbone_params, 'lr': lr_backbone})
    if classifier_params:
        param_groups.append({'params': classifier_params, 'lr': lr_classifier})

    return optim.AdamW(param_groups, weight_decay=1e-4)


def train_one_epoch(
    model: nn.Module,
    loader: DataLoader,
    criterion: nn.Module,
    optimizer: optim.Optimizer,
    device: torch.device,
    epoch: int,
) -> Tuple[float, float]:
    """Train for one epoch with batch progress tracking."""
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0

    pbar = tqdm(loader, desc=f"Epoch {epoch} [Train]", unit="batch")

    for batch_idx, (images, labels) in enumerate(pbar, 1):
        images = images.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()

        # Gradient clipping for stability
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)

        optimizer.step()

        running_loss += loss.item() * images.size(0)
        _, preds = torch.max(outputs, 1)
        correct += (preds == labels).sum().item()
        total += labels.size(0)

        batch_acc = 100 * correct / total
        batch_loss = running_loss / total
        pbar.set_postfix({'loss': f'{batch_loss:.4f}', 'acc': f'{batch_acc:.2f}%'})

    epoch_loss = running_loss / total
    epoch_acc = correct / total
    return epoch_loss, epoch_acc


def evaluate(
    model: nn.Module,
    loader: DataLoader,
    criterion: nn.Module,
    device: torch.device,
    class_names: list[str] | None = None,
) -> Tuple[float, float]:
    """Evaluate the model with per-class accuracy reporting."""
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0
    num_classes = len(class_names) if class_names else 0
    class_correct = [0] * num_classes
    class_total   = [0] * num_classes

    pbar = tqdm(loader, desc="Validation", unit="batch")

    with torch.no_grad():
        for batch_idx, (images, labels) in enumerate(pbar, 1):
            images = images.to(device)
            labels = labels.to(device)
            outputs = model(images)
            loss = criterion(outputs, labels)

            running_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)

            if class_names:
                for lbl, pred in zip(labels.cpu(), preds.cpu()):
                    lbl_i = int(lbl.item())
                    class_total[lbl_i] += 1
                    if lbl_i == int(pred.item()):
                        class_correct[lbl_i] += 1

            batch_acc = 100 * correct / total
            batch_loss = running_loss / total
            pbar.set_postfix({'loss': f'{batch_loss:.4f}', 'acc': f'{batch_acc:.2f}%'})

    # Per-class accuracy report - crucial for diagnosing which condition the
    # model is missing (e.g. pores vs wrinkles confusion).
    if class_names:
        print("\n  Per-class validation accuracy:")
        for i, name in enumerate(class_names):
            n = class_total[i]
            acc = 100.0 * class_correct[i] / n if n > 0 else 0.0
            bar = "#" * int(acc / 5) + "." * (20 - int(acc / 5))
            print(f"    {name:>12}: {acc:5.1f}%  [{bar}]  ({class_correct[i]}/{n})")

    return running_loss / total, correct / total


def save_checkpoint(
    model: nn.Module,
    weights_path: Path,
    metadata_path: Path,
    val_acc: float = 0.0,
    epoch: int = 0,
) -> None:
    """Save model checkpoint and metadata."""
    weights_path.parent.mkdir(parents=True, exist_ok=True)
    torch.save(model.state_dict(), weights_path)

    metadata = {
        "weights": weights_path.name,
        "class_map": json.loads(CONFIG.class_map_path.read_text(encoding="utf-8")),
        "image_size": 384,
        "model": "efficientnet_v2_s",
        "val_accuracy": round(val_acc, 4),
        "epoch": epoch,
        "timestamp": time.time(),
    }
    metadata_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")


def main() -> None:
    """Main training function."""
    parser = argparse.ArgumentParser(description="Train skin condition classifier (EfficientNetV2-S)")
    parser.add_argument("--epochs", type=int, default=20)
    parser.add_argument("--batch-size", type=int, default=8)
    parser.add_argument("--lr-backbone", type=float, default=5e-5)
    parser.add_argument("--lr-classifier", type=float, default=2e-4)
    parser.add_argument("--freeze-epochs", type=int, default=5, help="Epochs to freeze backbone")
    parser.add_argument("--early-stop-patience", type=int, default=6)
    parser.add_argument("--weights-out", type=Path, default=CONFIG.model_v2s_weights)
    parser.add_argument("--metadata-out", type=Path, default=CONFIG.models_dir / "model_metadata.json")
    parser.add_argument(
        "--use-attention-head", action="store_true", default=True,
        help="Replace final Linear with SE-style AttentionClassifierHead",
    )
    args = parser.parse_args()

    # Hardcoded V2-S input dimensions: 384 crop, 420 pre-resize.
    image_size: int = 384
    resize_to:  int = 420

    print("=" * 70)
    print("  SKIN CONDITION CLASSIFICATION - EfficientNetV2-S RETRAINING")
    print("=" * 70)

    device = torch.device("cpu")  # Force CPU
    print(f"  Device        : {device}")
    print(f"  Epochs        : {args.epochs}")
    print(f"  Batch size    : {args.batch_size}")
    print(f"  LR backbone   : {args.lr_backbone}")
    print(f"  LR classifier : {args.lr_classifier}")
    print(f"  Freeze epochs : {args.freeze_epochs}")
    print(f"  Early stop    : {args.early_stop_patience} epochs patience")
    print("=" * 70)

    set_seed(CONFIG.rng_seed)

    # Dataset
    print(f"\nDataset root: {DATA_DIR}")
    if not DATA_DIR.exists():
        raise FileNotFoundError(f"Dataset directory not found: {DATA_DIR}")

    total_images = sum(1 for _ in DATA_DIR.rglob("*") if _.suffix.lower() in {".jpg", ".jpeg", ".png", ".bmp", ".webp"})
    print(f"Total images found: {total_images}")

    # Augmentation
    # Stronger augmentation pipeline for skin condition classification:
    # - TrivialAugmentWide: state-of-the-art auto-augment policy
    # - RandomPerspective: mimics selfie camera angle variance
    # - GaussianBlur: robustness to slightly out-of-focus phone cameras
    # - ColorJitter: skin tone / lighting variation
    # - RandomErasing: simulates partial occlusions (hair, hands)
    train_transform = transforms.Compose([
        transforms.Resize((resize_to, resize_to)),
        transforms.RandomCrop(image_size),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(p=0.05),
        transforms.TrivialAugmentWide(),                   # auto-augment
        transforms.RandomPerspective(distortion_scale=0.2, p=0.3),
        transforms.GaussianBlur(kernel_size=3, sigma=(0.1, 1.5)),
        transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.2, hue=0.05),
        transforms.RandomGrayscale(p=0.05),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        transforms.RandomErasing(p=0.15, scale=(0.02, 0.12)),
    ])

    val_transform = transforms.Compose([
        transforms.Resize((image_size, image_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    # Load & split
    print(f"Loading dataset from: {DATA_DIR}")
    full_dataset = ImageFolder(str(DATA_DIR), transform=None)
    class_names  = full_dataset.classes

    print(f"\n[INFO] Dataset loaded: {len(full_dataset)} samples | {len(class_names)} classes")
    labels_list = [label for _, label in full_dataset.samples]
    class_counts = Counter(labels_list)

    print("\n  Per-class distribution:")
    for idx, name in enumerate(class_names):
        count = class_counts.get(idx, 0)
        print(f"    {name:>12}: {count} images")

    # 80/20 split
    train_size = int(0.8 * len(full_dataset))
    val_size   = len(full_dataset) - train_size
    print(f"\n  Train: {train_size} | Val: {val_size}")

    train_dataset, val_dataset = random_split(
        full_dataset,
        [train_size, val_size],
        generator=torch.Generator().manual_seed(CONFIG.rng_seed),
    )

    cast(ImageFolder, train_dataset.dataset).transform = train_transform
    cast(ImageFolder, val_dataset.dataset).transform   = val_transform

    # WeightedRandomSampler: ensures rare classes are seen as often as common ones
    train_weights = [
        1.0 / class_counts[full_dataset.samples[i][1]]
        for i in train_dataset.indices
    ]
    sampler = WeightedRandomSampler(
        weights=train_weights,
        num_samples=len(train_weights),
        replacement=True,
    )

    train_loader = DataLoader(
        train_dataset,
        batch_size=args.batch_size,
        sampler=sampler,
        num_workers=0,
        pin_memory=False,
    )
    val_loader = DataLoader(
        val_dataset,
        batch_size=args.batch_size,
        shuffle=False,
        num_workers=0,
        pin_memory=False,
    )

    # Model
    print(f"\n[SETUP] Building EfficientNetV2-S + AttentionHead ({len(class_names)} classes)...")
    model = create_model(len(class_names), use_attention=True).to(device)

    # Label smoothing (0.1): reduces overconfidence and improves calibration
    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)

    best_val_acc      = 0.0
    best_state        = None
    patience_counter  = 0
    prev_train_loss   = 0.0
    optimizer = get_optimizer(model, args.lr_backbone, args.lr_classifier)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=args.epochs)

    print(f"\n[START] Starting training -- {args.epochs} epochs\n")
    print("  Tip: Ctrl+C at any time saves the best checkpoint found so far.")
    print("=" * 70)

    try:
        for epoch in range(1, args.epochs + 1):
            print(f"\n{'='*70}")
            print(f"  EPOCH {epoch}/{args.epochs}")
            print(f"{'='*70}")

            # Phase-based backbone freeze / unfreeze
            if epoch == 1:
                freeze_backbone(model)
                optimizer = get_optimizer(model, args.lr_backbone, args.lr_classifier)
                scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
                    optimizer, T_max=args.epochs
                )
            elif epoch == args.freeze_epochs + 1:
                unfreeze_backbone(model)
                optimizer = get_optimizer(model, args.lr_backbone, args.lr_classifier)
                scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
                    optimizer, T_max=max(args.epochs - args.freeze_epochs, 1)
                )

            train_loss, train_acc = train_one_epoch(
                model, train_loader, criterion, optimizer, device, epoch
            )
            val_loss, val_acc = evaluate(
                model, val_loader, criterion, device, class_names=class_names
            )

            print(f"\n{'-'*70}")
            print(f"  EPOCH {epoch} SUMMARY")
            print(f"  Train -> loss: {train_loss:.4f}  acc: {train_acc*100:.2f}%")
            print(f"  Val   -> loss: {val_loss:.4f}  acc: {val_acc*100:.2f}%")
            if epoch > 1:
                print(f"  Loss delta: {train_loss - prev_train_loss:+.4f}")
            prev_train_loss = train_loss

            scheduler.step()
            print(f"{'-'*70}")

            if val_acc > best_val_acc:
                best_val_acc = val_acc
                best_state   = model.state_dict()
                patience_counter = 0
                save_checkpoint(model, args.weights_out, args.metadata_out, val_acc, epoch)
                print(f"  [BEST] New best val acc: {best_val_acc*100:.2f}% -- checkpoint saved")
            else:
                patience_counter += 1
                print(f"  [WAIT] No improvement ({patience_counter}/{args.early_stop_patience})")

            if patience_counter >= args.early_stop_patience:
                print(f"\n[STOP] Early stopping (no improvement for {args.early_stop_patience} epochs)")
                break

    except KeyboardInterrupt:
        print("\n\n!! Training interrupted - saving best checkpoint...")

    # Final save
    if best_state is not None:
        if not args.weights_out.exists():
            model.load_state_dict(best_state)
            save_checkpoint(model, args.weights_out, args.metadata_out, best_val_acc, args.epochs)
        print(f"\n{'='*70}")
        print(f"  [OK] TRAINING COMPLETE")
        print(f"  Best val accuracy : {best_val_acc*100:.2f}%")
        print(f"  Model saved       : {args.weights_out}")
        print(f"  Metadata saved    : {args.metadata_out}")
        print(f"{'='*70}\n")
    else:
        print("\n[ERROR] Training failed - no checkpoint saved")


if __name__ == "__main__":
    main()
