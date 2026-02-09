"""Training script for the skin-type EfficientNet-B0 classifier."""

from __future__ import annotations

import argparse
import json
import random
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Sequence, Tuple, cast

import numpy as np
import torch
from torch import nn, optim
from torch.utils.data import DataLoader, Dataset, WeightedRandomSampler
from torchvision import models

from .config import CONFIG
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
    def __init__(self, items: Sequence[DatasetItem], enforce_face: bool = True) -> None:
        self.items = list(items)
        self.enforce_face = enforce_face
        self.mean = torch.tensor(CONFIG.normalization_mean, dtype=torch.float32).view(3, 1, 1)
        self.std = torch.tensor(CONFIG.normalization_std, dtype=torch.float32).view(3, 1, 1)

    def __len__(self) -> int:
        return len(self.items)

    def __getitem__(self, index: int) -> Tuple[torch.Tensor, int]:
        item = self.items[index]
        try:
            image, _ = preprocess_image_file(item.path, enforce_face=self.enforce_face)
        except ValueError:
            image, _ = preprocess_image_file(item.path, enforce_face=False)
        tensor = torch.from_numpy(image).float().permute(2, 0, 1) / 255.0
        tensor = (tensor - self.mean) / self.std
        return tensor, item.label_idx


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
    parser.add_argument("--weights-out", type=Path, default=CONFIG.models_dir / "skin_classifier.pt")
    parser.add_argument("--metadata-out", type=Path, default=CONFIG.models_dir / "model_metadata.json")
    args = parser.parse_args()

    set_seed(CONFIG.rng_seed)
    device = torch.device(CONFIG.default_device)

    train_items = build_items(CONFIG.train_split)
    val_items = build_items(CONFIG.val_split)

    if args.overfit:
        train_items = train_items[:10]
        val_items = train_items

    train_dataset = SkinDataset(train_items, enforce_face=not args.overfit)
    val_dataset = SkinDataset(val_items, enforce_face=False)

    sampler, class_weights = make_sampler(train_items, len(CONFIG.canonical_labels))

    train_loader = DataLoader(
        train_dataset,
        batch_size=args.batch_size,
        sampler=sampler,
        num_workers=args.num_workers,
    )
    val_loader = DataLoader(
        val_dataset,
        batch_size=args.batch_size,
        shuffle=False,
        num_workers=args.num_workers,
    )

    model = create_model(len(CONFIG.canonical_labels)).to(device)
    criterion = nn.CrossEntropyLoss(weight=class_weights.to(device))
    optimizer = optim.AdamW(model.parameters(), lr=args.lr, weight_decay=args.weight_decay)

    best_acc = 0.0
    best_state = None

    for epoch in range(1, args.epochs + 1):
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


if __name__ == "__main__":
    main()
