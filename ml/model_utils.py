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
    """Load trained EfficientNetV2-S with :class:`AttentionClassifierHead`.

    This is the sole inference entry point — EfficientNet-B0 is no longer
    supported.  All call sites that previously imported ``inference_model``
    continue to work unchanged.

    Args:
        num_classes: Number of output classes.
        weights_path: Path to a ``.pt`` file saved by ``train.py``.

    Returns:
        Evaluation-mode ``EfficientNetV2-S`` with :class:`AttentionClassifierHead`.
    """
    model = models.efficientnet_v2_s(weights=None)
    in_features = cast(torch.nn.Linear, model.classifier[1]).in_features
    model.classifier[1] = AttentionClassifierHead(in_features, num_classes)
    state_dict = torch.load(weights_path, map_location="cpu", weights_only=True)
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


# IMPROVEMENT: SE-style attention gate over pooled features improves class
# discrimination on fine-grained skin features without adding heavy compute.
class AttentionClassifierHead(torch.nn.Module):
    """Squeeze-and-Excitation style attention layer before the final classifier.

    Learns a channel-wise attention mask over the backbone's pooled feature
    vector so the model can amplify discriminative dimensions and suppress
    uninformative ones for each skin condition class.

    Args:
        in_features: Dimensionality of the pooled backbone output.
        num_classes: Number of output classes.
        reduction: Bottleneck reduction ratio for the SE gate (default 16).
    """

    def __init__(self, in_features: int, num_classes: int, reduction: int = 16) -> None:
        super().__init__()
        mid = max(in_features // reduction, num_classes * 2)
        self.fc1 = torch.nn.Linear(in_features, mid)
        self.act = torch.nn.SiLU()
        self.fc2 = torch.nn.Linear(mid, in_features)
        self.sigmoid = torch.nn.Sigmoid()
        self.classifier = torch.nn.Linear(in_features, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Apply SE attention gate then classify."""
        attn = self.sigmoid(self.fc2(self.act(self.fc1(x))))
        return self.classifier(x * attn)
