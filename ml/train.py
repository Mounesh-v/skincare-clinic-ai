from __future__ import annotations

import argparse
import json
import time
from pathlib import Path
from typing import Tuple, cast

import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import models, transforms
from torchvision.datasets import ImageFolder
from torch.utils.data import DataLoader, random_split, WeightedRandomSampler
from tqdm import tqdm

from .config import CONFIG
from .model_utils import AttentionClassifierHead


# =============================================================================
# DATASET CONFIGURATION
# =============================================================================
DATA_DIR = Path(__file__).parent / "data" / "raw" / "Skin v2"


def set_seed(seed: int) -> None:
    """Set random seed for reproducibility."""
    torch.manual_seed(seed)


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
    print("✓ Backbone frozen (only classifier trainable)", flush=True)


def unfreeze_backbone(model: nn.Module) -> None:
    """Unfreeze all layers."""
    for param in model.parameters():
        param.requires_grad = True
    print("✓ Backbone unfrozen (all layers trainable)", flush=True)


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
    
    # Use tqdm for progress bar
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
        
        # Update progress bar
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
) -> Tuple[float, float]:
    """Evaluate the model with progress bar."""
    model.eval()  # Set to evaluation mode
    running_loss = 0.0
    correct = 0
    total = 0
    
    # Use tqdm for progress bar
    pbar = tqdm(loader, desc="Validation", unit="batch")
    
    with torch.no_grad():  # Disable gradient computation
        for batch_idx, (images, labels) in enumerate(pbar, 1):
            images = images.to(device)
            labels = labels.to(device)
            outputs = model(images)
            loss = criterion(outputs, labels)
            
            running_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)
            
            # Update progress bar
            batch_acc = 100 * correct / total
            batch_loss = running_loss / total
            pbar.set_postfix({'loss': f'{batch_loss:.4f}', 'acc': f'{batch_acc:.2f}%'})
    
    return running_loss / total, correct / total


def save_checkpoint(
    model: nn.Module,
    weights_path: Path,
    metadata_path: Path,
) -> None:
    """Save model checkpoint and metadata.

    Args:
        model: Trained model whose ``state_dict`` will be saved.
        weights_path: Destination ``.pt`` file.
        metadata_path: Destination JSON metadata file.
    """
    weights_path.parent.mkdir(parents=True, exist_ok=True)
    torch.save(model.state_dict(), weights_path)

    metadata = {
        "weights": weights_path.name,
        "class_map": json.loads(CONFIG.class_map_path.read_text(encoding="utf-8")),
        "image_size": 384,
        "model": "efficientnet_v2_s",
        "timestamp": time.time(),
    }
    metadata_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")


def main() -> None:
    """Main training function."""
    parser = argparse.ArgumentParser(description="Train skin-type classifier (CPU-optimized)")
    parser.add_argument("--epochs", type=int, default=15)
    parser.add_argument("--batch-size", type=int, default=8)
    parser.add_argument("--lr-backbone", type=float, default=1e-4)
    parser.add_argument("--lr-classifier", type=float, default=3e-4)
    parser.add_argument("--freeze-epochs", type=int, default=3, help="Epochs to freeze backbone")
    parser.add_argument("--early-stop-patience", type=int, default=5)
    parser.add_argument("--weights-out", type=Path, default=CONFIG.model_v2s_weights)
    parser.add_argument("--metadata-out", type=Path, default=CONFIG.models_dir / "model_metadata.json")
    parser.add_argument(
        "--use-attention-head", action="store_true",
        help="Replace final Linear with SE-style AttentionClassifierHead (default: True via create_model)",
    )
    args = parser.parse_args()

    # Hardcoded V2-S input dimensions: 384 crop, 416 pre-resize.
    image_size: int = 384
    resize_to:  int = 416
    
    print("="*70)
    print("SKIN TYPE CLASSIFICATION TRAINING")
    print("="*70)
    
    # STEP 4 - SAFETY CHECK
    device = torch.device("cpu")  # Force CPU
    print(f"Device: {device}")
    print(f"Epochs: {args.epochs}")
    print(f"Batch size: {args.batch_size}")
    print(f"LR backbone: {args.lr_backbone}")
    print(f"LR classifier: {args.lr_classifier}")
    print(f"Freeze epochs: {args.freeze_epochs}")
    print(f"Early stop patience: {args.early_stop_patience}")
    print("="*70)
    
    set_seed(CONFIG.rng_seed)
    
    # STEP 1 - DATASET SOURCE FIX
    print(f"\n{'='*70}")
    print(f"STEP 1 - DATASET SOURCE VALIDATION")
    print(f"{'='*70}")
    print(f"Dataset root (DATA_DIR): {DATA_DIR}")
    print(f"Absolute path: {DATA_DIR.resolve()}")
    print(f"Path exists: {DATA_DIR.exists()}")
    
    if not DATA_DIR.exists():
        raise FileNotFoundError(f"Dataset directory not found: {DATA_DIR}")
    
    # Count total images
    total_jpg = len(list(DATA_DIR.glob("**/*.jpg")))
    total_jpeg = len(list(DATA_DIR.glob("**/*.jpeg")))
    total_png = len(list(DATA_DIR.glob("**/*.png")))
    total_images = total_jpg + total_jpeg + total_png
    
    print(f"\nTotal images found: {total_images}")
    print(f"  - JPG files: {total_jpg}")
    print(f"  - JPEG files: {total_jpeg}")
    print(f"  - PNG files: {total_png}")
    
    # IMPROVEMENT: Stronger augmentation pipeline — random crops, colour jitter,
    # rotation, grayscale, and random erasing combat overfitting on small skin
    # datasets and significantly improve generalisation (PMC9735681).
    train_transform = transforms.Compose([
        transforms.Resize((resize_to, resize_to)),
        transforms.RandomCrop(image_size),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(p=0.1),
        transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.2, hue=0.05),
        transforms.RandomRotation(degrees=15),
        transforms.RandomGrayscale(p=0.05),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        transforms.RandomErasing(p=0.1, scale=(0.02, 0.1)),
    ])

    val_transform = transforms.Compose([
        transforms.Resize((image_size, image_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    
    # Load full dataset from root directory
    print(f"\nLoading dataset from: {DATA_DIR}")
    full_dataset = ImageFolder(str(DATA_DIR), transform=None)
    
    print(f"\n📊 Dataset loaded successfully!")
    print(f"Total samples: {len(full_dataset)}")
    print(f"Number of classes: {len(full_dataset.classes)}")
    print(f"Class names: {full_dataset.classes}")
    
    # STEP 3 - DATA VERIFICATION LOGS
    print(f"\n{'='*70}")
    print(f"STEP 3 - PER-CLASS DISTRIBUTION")
    print(f"{'='*70}")
    
    from collections import Counter
    labels = [label for _, label in full_dataset.samples]
    class_counts = Counter(labels)
    
    for idx, class_name in enumerate(full_dataset.classes):
        count = class_counts.get(idx, 0)
        print(f"  {class_name}: {count} images")
    
    # Print first 5 sample paths to verify real dataset usage
    print(f"\nFirst 5 sample file paths (verification):")
    for i, (path, label) in enumerate(full_dataset.samples[:5]):
        class_name = full_dataset.classes[label]
        print(f"  {i+1}. [{class_name}] {path}")
    
    # 80/20 random split
    train_size = int(0.8 * len(full_dataset))
    val_size = len(full_dataset) - train_size
    
    print(f"\n{'='*70}")
    print(f"PERFORMING 80/20 RANDOM SPLIT")
    print(f"{'='*70}")
    print(f"Train size: {train_size} ({train_size/len(full_dataset)*100:.1f}%)")
    print(f"Val size: {val_size} ({val_size/len(full_dataset)*100:.1f}%)")
    
    # Split dataset
    train_dataset, val_dataset = random_split(
        full_dataset,
        [train_size, val_size],
        generator=torch.Generator().manual_seed(CONFIG.rng_seed)
    )
    
    # Apply transforms to splits
    # cast: random_split wraps the underlying ImageFolder; .dataset is always
    # an ImageFolder here, which does have a .transform attribute.
    cast(ImageFolder, train_dataset.dataset).transform = train_transform
    cast(ImageFolder, val_dataset.dataset).transform = val_transform

    # IMPROVEMENT: WeightedRandomSampler rebalances per-class frequency so rare
    # skin conditions (e.g. wrinkles) are seen as often as common ones (acne)
    # during training — significantly reduces macro-recall disparity.
    train_weights = [
        1.0 / class_counts[full_dataset.samples[i][1]]
        for i in train_dataset.indices
    ]
    sampler = WeightedRandomSampler(
        weights=train_weights,
        num_samples=len(train_weights),
        replacement=True,
    )

    # STEP 4 - SAFETY CHECK: CPU-optimized data loaders
    print(f"\n{'='*70}")
    print(f"STEP 4 - SAFETY CHECK")
    print(f"{'='*70}")
    print(f"✓ Device: CPU (forced)")
    print(f"✓ num_workers: 0 (CPU optimization)")
    print(f"✓ pin_memory: False (CPU optimization)")
    print(f"✓ Mixed precision: Disabled")
    print(f"✓ Oversampling: WeightedRandomSampler (class rebalancing active)")

    train_loader = DataLoader(
        train_dataset,
        batch_size=args.batch_size,
        sampler=sampler,          # IMPROVEMENT: replaces shuffle=True
        num_workers=0,            # CPU optimization
        pin_memory=False,         # CPU optimization
    )
    val_loader = DataLoader(
        val_dataset,
        batch_size=args.batch_size,
        shuffle=False,
        num_workers=0,  # CPU optimization
        pin_memory=False  # CPU optimization
    )
    
    print(f"\n🔧 Creating model...")
    model = create_model(
        len(full_dataset.classes),
        use_attention=args.use_attention_head,
    ).to(device)
    attn_label = " + AttentionHead" if args.use_attention_head else ""
    print(f"✓ Model created: EfficientNetV2-S{attn_label}")

    # IMPROVEMENT: Label smoothing (0.1) reduces overconfidence and improves
    # calibration on noisy skin-condition labels (Müller et al., 2019).
    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
    
    # Training loop — initialise variables that are set inside the loop so
    # Pylance knows they are always bound before use.
    best_val_acc = 0.0
    best_state = None
    patience_counter = 0
    prev_train_loss: float = 0.0
    optimizer = get_optimizer(model, args.lr_backbone, args.lr_classifier)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=args.epochs)
    
    print(f"\n🚀 Starting training...\n")
    print("="*70)
    print("  Tip: Press Ctrl+C at any time to stop and save the best checkpoint.")
    print("="*70)

    try:
      for epoch in range(1, args.epochs + 1):
        print(f"\n{'='*70}")
        print(f"EPOCH {epoch}/{args.epochs}")
        print(f"{'='*70}")
        
        # Freeze/unfreeze backbone
        if epoch == 1:
            freeze_backbone(model)
            optimizer = get_optimizer(model, args.lr_backbone, args.lr_classifier)
            # IMPROVEMENT: CosineAnnealingLR decays the LR smoothly to near-zero
            # over the entire training run, avoiding the accuracy plateau that
            # occurs with a fixed LR (Loshchilov & Hutter, 2016).
            scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
                optimizer, T_max=args.epochs
            )
        elif epoch == args.freeze_epochs + 1:
            unfreeze_backbone(model)
            optimizer = get_optimizer(model, args.lr_backbone, args.lr_classifier)
            # Re-initialise scheduler after optimizer refresh (backbone unfrozen).
            scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
                optimizer, T_max=max(args.epochs - args.freeze_epochs, 1)
            )
        
        # Training
        train_loss, train_acc = train_one_epoch(model, train_loader, criterion, optimizer, device, epoch)
        
        # STEP 2 - VALIDATION FREEZE FIX (with tqdm progress bar)
        val_loss, val_acc = evaluate(model, val_loader, criterion, device)
        
        # Summary
        print(f"\n{'─'*70}")
        print(f"EPOCH {epoch} SUMMARY:")
        print(f"  Train Loss: {train_loss:.4f} | Train Acc: {train_acc*100:.2f}%")
        print(f"  Val Loss:   {val_loss:.4f} | Val Acc:   {val_acc*100:.2f}%")
        
        # STEP 5 - CONFIRM TRAINING LOSS DECREASES
        if epoch > 1:
            print(f"  Loss change: {train_loss - prev_train_loss:+.4f}")
        prev_train_loss = train_loss
        # IMPROVEMENT: Step LR scheduler once per epoch for cosine decay.
        scheduler.step()

        print(f"{'─'*70}")

        # Save best model immediately to disk whenever val_acc improves
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            best_state = model.state_dict()
            patience_counter = 0
            save_checkpoint(model, args.weights_out, args.metadata_out)
            print(f"✅ New best val acc: {best_val_acc*100:.2f}% — checkpoint saved to disk")
        else:
            patience_counter += 1
            print(f"⏳ No improvement (patience: {patience_counter}/{args.early_stop_patience})")
        
        # Early stopping
        if patience_counter >= args.early_stop_patience:
            print(f"\n🛑 Early stopping triggered (no improvement for {args.early_stop_patience} epochs)")
            break
    except KeyboardInterrupt:
        print(f"\n\n⚠️  Training interrupted — saving best checkpoint found so far...")

    # Save final model (only needed if Ctrl+C hit before any checkpoint was written)
    if best_state is not None:
        if not args.weights_out.exists():
            model.load_state_dict(best_state)
            save_checkpoint(model, args.weights_out, args.metadata_out)
        print(f"\n{'='*70}")
        print(f"✅ TRAINING COMPLETE")
        print(f"{'='*70}")
        print(f"Best validation accuracy: {best_val_acc*100:.2f}%")
        print(f"Model saved to: {args.weights_out}")
        print(f"Metadata saved to: {args.metadata_out}")
        print(f"{'='*70}\n")
    else:
        print(f"\n❌ Training failed - no best state saved")


if __name__ == "__main__":
    main()
