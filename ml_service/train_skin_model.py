"""CLI to train a skin-type classifier using transfer learning.

Example usage:

    uvicorn ml_service.main:app --reload  # run API in another terminal

    # train the model (expects an ImageFolder with class sub-directories)
    python -m ml_service.train_skin_model \
        --dataset ./data/skin_dataset \
        --output ./model_weights/skin_classifier.ts \
        --epochs 12

Dataset layout:

skin_dataset/
    dry/
        img001.jpg
    oily/
        ...

The script fine-tunes MobileNetV2 and exports a TorchScript module compatible
with the runtime predictor used by the FastAPI service.
"""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any, Tuple, cast

try:  # pragma: no cover - optional dependency import
    import torch  # type: ignore[import]
    from torch import nn  # type: ignore[import]
    from torch.utils.data import DataLoader  # type: ignore[import]
    from torchvision import datasets, transforms  # type: ignore[import]
    from torchvision.models import mobilenet_v2, MobileNet_V2_Weights  # type: ignore[import]
except ImportError as torch_import_error:  # pragma: no cover - runtime guard
    torch = None  # type: ignore[assignment]
    nn = None  # type: ignore[assignment]
    DataLoader = object  # type: ignore[assignment]
    datasets = None  # type: ignore[assignment]
    transforms = None  # type: ignore[assignment]
    mobilenet_v2 = None  # type: ignore[assignment]
    MobileNet_V2_Weights = None  # type: ignore[assignment]
    _TORCH_IMPORT_ERROR = torch_import_error
else:
    _TORCH_IMPORT_ERROR = None

LABELS = ["dry", "oily", "combination", "sensitive", "normal"]


def build_dataloaders(dataset_dir: Path, batch_size: int = 32) -> Tuple[Any, Any]:
    if _TORCH_IMPORT_ERROR is not None or transforms is None or datasets is None or DataLoader is object:
        raise RuntimeError(
            "PyTorch and TorchVision must be installed to build dataloaders"
        ) from _TORCH_IMPORT_ERROR

    data_transforms = {
        "train": transforms.Compose(
            [
                transforms.RandomResizedCrop(224),
                transforms.RandomHorizontalFlip(),
                transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.02),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ]
        ),
        "val": transforms.Compose(
            [
                transforms.Resize(256),
                transforms.CenterCrop(224),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ]
        ),
    }

    image_datasets = {
        phase: datasets.ImageFolder(dataset_dir / phase, data_transforms[phase])
        for phase in ("train", "val")
    }

    data_loader_cls = cast(Any, DataLoader)

    loaders = {
        phase: data_loader_cls(image_datasets[phase], batch_size=batch_size, shuffle=(phase == "train"), num_workers=4)
        for phase in ("train", "val")
    }

    return loaders["train"], loaders["val"]


def train_model(train_loader: Any, val_loader: Any, epochs: int, device: Any) -> Any:
    if _TORCH_IMPORT_ERROR is not None or torch is None or nn is None or mobilenet_v2 is None or MobileNet_V2_Weights is None:
        raise RuntimeError("PyTorch must be installed to train the skin model") from _TORCH_IMPORT_ERROR

    weights = MobileNet_V2_Weights.IMAGENET1K_V1
    model = mobilenet_v2(weights=weights)
    model.classifier[1] = nn.Linear(model.last_channel, len(LABELS))
    model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=3e-4, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode="min", patience=2)

    for epoch in range(epochs):
        model.train()
        running_loss = 0.0
        for inputs, labels in train_loader:
            inputs = inputs.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * inputs.size(0)

        epoch_loss = running_loss / len(train_loader.dataset)

        model.eval()
        val_loss = 0.0
        correct = 0
        with torch.no_grad():
            for inputs, labels in val_loader:
                inputs = inputs.to(device)
                labels = labels.to(device)
                outputs = model(inputs)
                loss = criterion(outputs, labels)
                val_loss += loss.item() * inputs.size(0)
                preds = outputs.argmax(dim=1)
                correct += (preds == labels).sum().item()

        val_loss = val_loss / len(val_loader.dataset)
        val_acc = correct / len(val_loader.dataset)
        scheduler.step(val_loss)

        print(f"Epoch {epoch + 1}/{epochs} - train loss {epoch_loss:.4f} — val loss {val_loss:.4f} — val acc {val_acc:.3%}")

    return model


def export_model(model: Any, output_path: Path, device: Any) -> None:
    if torch is None:
        raise RuntimeError("PyTorch must be installed to export the skin model")
    model.eval()
    example_input = torch.randn(1, 3, 224, 224, device=device)
    traced = cast(Any, torch.jit.trace(model, example_input))
    output_path.parent.mkdir(parents=True, exist_ok=True)
    traced.save(str(output_path))
    print(f"Saved TorchScript module to {output_path}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train the skin-type classifier")
    parser.add_argument("--dataset", type=Path, required=True, help="Path to dataset folder containing train/ and val/")
    parser.add_argument("--output", type=Path, default=Path("model_weights/skin_classifier.ts"), help="Where to store the TorchScript model")
    parser.add_argument("--epochs", type=int, default=12)
    parser.add_argument("--batch-size", type=int, default=32)
    return parser.parse_args()


def main() -> None:
    if _TORCH_IMPORT_ERROR is not None or torch is None:
        raise SystemExit(
            "PyTorch and TorchVision are required to run the training CLI."
        )
    args = parse_args()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    train_loader, val_loader = build_dataloaders(args.dataset, batch_size=args.batch_size)
    model = train_model(train_loader, val_loader, epochs=args.epochs, device=device)
    export_model(model, args.output, device)


if __name__ == "__main__":
    main()
