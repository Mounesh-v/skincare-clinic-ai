from __future__ import annotations
# Imports and directory setup

# === DATASET PIPELINE ===
import os
import json
import random
import torch
from torchvision import datasets, transforms
from torch.utils.data import DataLoader, random_split
from torchvision.datasets import ImageFolder

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data', 'raw', 'Skin v2')
RESULTS_DIR = os.path.join(os.path.dirname(__file__), 'models', 'results')
os.makedirs(RESULTS_DIR, exist_ok=True)

# Scan classes and generate class_map.json
class_names = sorted([d for d in os.listdir(DATA_DIR) if os.path.isdir(os.path.join(DATA_DIR, d))])
class_map = {
    "idx_to_label": {str(i): name for i, name in enumerate(class_names)},
    "label_to_idx": {name: i for i, name in enumerate(class_names)},
    "display_labels": {name: name.replace('_', ' ').title() for name in class_names}
}
with open(os.path.join(os.path.dirname(__file__), 'class_map.json'), 'w') as f:
    json.dump(class_map, f, indent=2)

# Transforms
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]
train_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.15, hue=0.05),
    transforms.ToTensor(),
    transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD)
])
val_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD)
])

# ImageFolder dataset
full_dataset = datasets.ImageFolder(DATA_DIR)
num_classes = len(full_dataset.classes)

# Split train/val (80/20)
SEED = 42
random.seed(SEED)
torch.manual_seed(SEED)
num_total = len(full_dataset)
num_val = int(0.2 * num_total)
num_train = num_total - num_val
train_set, val_set = random_split(full_dataset, [num_train, num_val], generator=torch.Generator().manual_seed(SEED))


# Patch transforms for each split (ImageFolder always has 'transform')
train_set.dataset.transform = train_transform  # type: ignore[attr-defined]
val_set.dataset.transform = val_transform  # type: ignore[attr-defined]

# DataLoaders
BATCH_SIZE = 16
train_loader = DataLoader(train_set, batch_size=BATCH_SIZE, shuffle=True, num_workers=0, pin_memory=False)
val_loader = DataLoader(val_set, batch_size=BATCH_SIZE, shuffle=False, num_workers=0, pin_memory=False)
"""Training script for the skin-type EfficientNet-B0 classifier."""




import argparse
import json
import random
import time
from collections import Counter
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Sequence, Tuple, cast

import numpy as np
import torch
from torch import nn, optim
from torch.utils.data import DataLoader, Dataset, WeightedRandomSampler
from torchvision import models

from .config import CONFIG
from .model_utils import normalize_tensor, to_tensor
from .preprocessing import iter_labelled_files, preprocess_image_file


def set_seed(seed: int) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)


@dataclass
class DatasetItem:
    path: str
    label_idx: int


class SkinDataset(Dataset[Tuple[torch.Tensor, int]]):
    def __init__(
        self,
        items: Sequence[DatasetItem],
        enforce_face: bool = True,
        augment: bool = False,
    ) -> None:
        self.items = list(items)
        self.enforce_face = enforce_face
        self.augment = augment

    def __len__(self) -> int:
        return len(self.items)

    def __getitem__(self, index: int) -> Tuple[torch.Tensor, int]:
        item = self.items[index]
        try:
            image, _ = preprocess_image_file(item.path, enforce_face=self.enforce_face)
        except ValueError:
            image, _ = preprocess_image_file(item.path, enforce_face=False)
        tensor = to_tensor(image, add_batch_dim=False, normalize=False)
        if self.augment:
            tensor = self._augment_tensor(tensor)
        tensor = normalize_tensor(tensor)
        return tensor, item.label_idx

    def _augment_tensor(self, tensor: torch.Tensor) -> torch.Tensor:
        if torch.rand(1).item() < 0.5:
            tensor = torch.flip(tensor, dims=[2])
        brightness = 1.0 + (torch.rand(1).item() - 0.5) * 0.2
        tensor = torch.clamp(tensor * brightness, 0.0, 1.0)
        if torch.rand(1).item() < 0.3:
            tensor = torch.clamp(tensor + torch.randn_like(tensor) * 0.02, 0.0, 1.0)
        return tensor


def build_items(split: str) -> List[DatasetItem]:
    dataset_root = Path(CONFIG.dataset_root)
    if not dataset_root.exists():
        raise FileNotFoundError(f"Dataset root not found: {dataset_root}")
    items: List[DatasetItem] = []
    for file_path, label in iter_labelled_files(dataset_root, split):
        label = label.lower()
        if label not in CONFIG.canonical_labels:
            continue
        idx = CONFIG.canonical_labels.index(label)
        items.append(DatasetItem(str(file_path), idx))
    if not items:
        raise RuntimeError(f"No labelled samples found for split '{split}'")
    return items


def make_sampler(items: Sequence[DatasetItem], num_classes: int) -> Tuple[WeightedRandomSampler, torch.Tensor]:
    labels = np.array([item.label_idx for item in items], dtype=np.int64)
    class_counts = np.bincount(labels, minlength=num_classes).astype(np.float32)
    class_counts = np.maximum(class_counts, 1.0)
    class_weights = 1.0 / class_counts
    sample_weights = class_weights[labels].astype(np.float64)
    sampler = WeightedRandomSampler(weights=sample_weights.tolist(), num_samples=len(items), replacement=True)
    criterion_weights = torch.tensor(class_weights, dtype=torch.float32)
    return sampler, criterion_weights


def summarize_distribution(items: Sequence[DatasetItem], split_name: str) -> None:
    counts = Counter(item.label_idx for item in items)
    total = len(items)
    pieces = []
    for idx, label in enumerate(CONFIG.canonical_labels):
        pieces.append(f"{label}:{counts.get(idx, 0)}")
    summary = ", ".join(pieces)
    print(f"{split_name} distribution -> total={total} ({summary})", flush=True)


def rebalance_items(items: Sequence[DatasetItem], num_classes: int) -> List[DatasetItem]:
    counts = Counter(item.label_idx for item in items)
    if not counts:
        return list(items)
    max_count = max(counts.values())
    rng = random.Random(CONFIG.rng_seed)
    balanced: List[DatasetItem] = list(items)
    for class_idx in range(num_classes):
        pool = [item for item in items if item.label_idx == class_idx]
        if not pool:
            continue
        needed = max_count - counts.get(class_idx, 0)
        for _ in range(needed):
            balanced.append(rng.choice(pool))
    rng.shuffle(balanced)
    print(
        f"Applied oversampling balance: before={len(items)} after={len(balanced)} max_class={max_count}",
        flush=True,
    )
    return balanced


def diagnose_predictions(
    model: nn.Module,
    loader: DataLoader,
    device: torch.device,
    num_classes: int,
) -> None:
    totals = torch.zeros(num_classes, dtype=torch.long)
    correct = torch.zeros(num_classes, dtype=torch.long)
    predicted = torch.zeros(num_classes, dtype=torch.long)
    with torch.no_grad():
        for images, labels in loader:
            images = images.to(device)
            labels = labels.to(device)
            outputs = model(images)
            preds = torch.argmax(outputs, dim=1)
            for idx in range(num_classes):
                mask = labels == idx
                totals[idx] += int(mask.sum().item())
                if mask.any().item():
                    correct[idx] += int((preds[mask] == idx).sum().item())
            for idx in range(num_classes):
                predicted[idx] += int((preds == idx).sum().item())
    diagnostics = []
    for idx, label in enumerate(CONFIG.canonical_labels):
        total = totals[idx].item()
        acc = (correct[idx].item() / total) if total else 0.0
        diagnostics.append(f"{label}:acc={acc:.2f} preds={predicted[idx].item()} samples={total}")
    print("Validation diagnostics " + " | ".join(diagnostics), flush=True)


def create_model(num_classes: int) -> nn.Module:
    weights = models.EfficientNet_B0_Weights.IMAGENET1K_V1
    model = models.efficientnet_b0(weights=weights)
    classifier_head = cast(nn.Linear, model.classifier[1])
    in_features = classifier_head.in_features
    model.classifier[1] = nn.Linear(in_features, num_classes)
    return model


def train_one_epoch(
    model: nn.Module,
    loader: DataLoader,
    criterion: nn.Module,
    optimizer: optim.Optimizer,
    device: torch.device,
) -> Tuple[float, float]:
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0
    for images, labels in loader:
        images = images.to(device)
        labels = labels.to(device)
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        running_loss += loss.item() * images.size(0)
        _, preds = torch.max(outputs, 1)
        correct += (preds == labels).sum().item()
        total += labels.size(0)
    return running_loss / total, correct / total


def evaluate(model: nn.Module, loader: DataLoader, criterion: nn.Module, device: torch.device) -> Tuple[float, float]:
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0
    with torch.no_grad():
        for images, labels in loader:
            images = images.to(device)
            labels = labels.to(device)
            outputs = model(images)
            loss = criterion(outputs, labels)
            running_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)
    return running_loss / total, correct / total


def save_checkpoint(model: nn.Module, weights_path: Path, metadata_path: Path) -> None:
    weights_path.parent.mkdir(parents=True, exist_ok=True)
    torch.save(model.state_dict(), weights_path)
    metadata = {
        "weights": weights_path.name,
        "class_map": json.loads(CONFIG.class_map_path.read_text(encoding="utf-8")),
        "image_size": CONFIG.image_size,
        "model": "efficientnet_b0",
        "timestamp": time.time(),
    }
    metadata_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Train the skin-type classifier")
    parser.add_argument("--epochs", type=int, default=12)
    parser.add_argument("--batch-size", type=int, default=16)
    parser.add_argument("--lr", type=float, default=3e-4)
    parser.add_argument("--weight-decay", type=float, default=1e-4)
    parser.add_argument("--num-workers", type=int, default=0)
    parser.add_argument("--overfit", action="store_true", help="Overfit a tiny subset for debugging")
    parser.add_argument("--no-balance", action="store_true", help="Disable oversampling class balance")
    parser.add_argument("--no-augment", action="store_true", help="Disable training-time augmentations")
    parser.add_argument("--weights-out", type=Path, default=CONFIG.models_dir / "skin_classifier.pt")
    parser.add_argument("--metadata-out", type=Path, default=CONFIG.models_dir / "model_metadata.json")
    args = parser.parse_args()

    set_seed(CONFIG.rng_seed)
    device = torch.device(CONFIG.default_device)


    # Use PyTorch's ImageFolder for faster training (no custom preprocessing)
    from torchvision.datasets import ImageFolder
    from torchvision import transforms
    
    # Define transforms
    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    # Load datasets
    train_root = CONFIG.dataset_root / CONFIG.train_split
    val_root = CONFIG.dataset_root / CONFIG.val_split
    
    train_dataset = ImageFolder(str(train_root), transform=train_transform)
    val_dataset = ImageFolder(str(val_root), transform=val_transform)
    
    print(f"Train dataset: {len(train_dataset)} images", flush=True)
    print(f"Val dataset: {len(val_dataset)} images", flush=True)
    
    # Create data loaders
    train_loader = DataLoader(
        train_dataset,
        batch_size=args.batch_size,
        shuffle=True,
        num_workers=args.num_workers,
        pin_memory=True if device.type == "cuda" else False
    )
    val_loader = DataLoader(
        val_dataset,
        batch_size=args.batch_size,
        shuffle=False,
        num_workers=args.num_workers,
        pin_memory=True if device.type == "cuda" else False
    )

    print("Creating model...", flush=True)
    model = create_model(len(CONFIG.canonical_labels)).to(device)
    print("Model created successfully", flush=True)
    criterion = nn.CrossEntropyLoss()  # No class weights for simpler, faster training
    optimizer = optim.AdamW(model.parameters(), lr=args.lr, weight_decay=args.weight_decay)
    print("Starting training...", flush=True)

    best_acc = 0.0
    best_state = None

    for epoch in range(1, args.epochs + 1):
        print(f"Starting epoch {epoch}...", flush=True)
        train_loss, train_acc = train_one_epoch(model, train_loader, criterion, optimizer, device)
        val_loss, val_acc = evaluate(model, val_loader, criterion, device)
        print(
            f"Epoch {epoch:02d}: train_loss={train_loss:.4f} train_acc={train_acc:.3f} "
            f"val_loss={val_loss:.4f} val_acc={val_acc:.3f}",
            flush=True,
        )
        if val_acc >= best_acc:
            best_acc = val_acc
            best_state = model.state_dict()

    if best_state is None:
        raise RuntimeError("Training did not run any epochs")

    model.load_state_dict(best_state)
    save_checkpoint(model, args.weights_out, args.metadata_out)
    print(f"Saved weights to {args.weights_out}")
    print(f"Saved metadata to {args.metadata_out}")
    diagnose_predictions(model, val_loader, device, len(CONFIG.canonical_labels))


if __name__ == "__main__":
    main()
