"""Utility helpers shared across inference entry points."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, Tuple, cast

import numpy as np
import torch
from torchvision import models

from .config import CONFIG

_MEAN = torch.tensor(CONFIG.normalization_mean, dtype=torch.float32).view(3, 1, 1)
_STD = torch.tensor(CONFIG.normalization_std, dtype=torch.float32).view(3, 1, 1)


def load_class_map(path: Path | None = None) -> Tuple[Dict[int, str], Dict[str, int], Dict[str, str]]:
    target = path or CONFIG.class_map_path
    data = json.loads(target.read_text(encoding="utf-8"))
    idx_to_label = {int(k): v for k, v in data["idx_to_label"].items()}
    label_to_idx = {k: int(v) for k, v in data["label_to_idx"].items()}
    display_labels = data.get("display_labels", {})
    return idx_to_label, label_to_idx, display_labels


def inference_model(num_classes: int, weights_path: Path) -> torch.nn.Module:
    model = models.efficientnet_b0(weights=None)
    head = cast(torch.nn.Linear, model.classifier[1])
    in_features = head.in_features
    model.classifier[1] = torch.nn.Linear(in_features, num_classes)
    state_dict = torch.load(weights_path, map_location="cpu")
    model.load_state_dict(state_dict)
    model.eval()
    return model


def normalize_tensor(tensor: torch.Tensor) -> torch.Tensor:
    return (tensor - _MEAN) / _STD


def to_tensor(image: np.ndarray, add_batch_dim: bool = True, normalize: bool = True) -> torch.Tensor:
    tensor = torch.from_numpy(image).float().permute(2, 0, 1) / 255.0
    if normalize:
        tensor = normalize_tensor(tensor)
    if add_batch_dim:
        tensor = tensor.unsqueeze(0)
    return tensor
