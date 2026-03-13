"""Image quality validation for production safety.

Rejects images that are too dark, overexposed, or blurry before
the model ever sees them — saving inference time and improving
the reliability of customer-facing predictions.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Optional

import cv2
import numpy as np

from .config import CONFIG

LOGGER = logging.getLogger(__name__)


@dataclass
class QualityResult:
    """Outcome of an image-quality check."""

    is_valid: bool
    brightness: float
    blur_score: float
    rejection_reason: Optional[str] = None


def validate_image_quality(
    image_rgb: np.ndarray,
    *,
    min_brightness: float | None = None,
    max_brightness: float | None = None,
    min_blur_score: float | None = None,
) -> QualityResult:
    """Evaluate brightness and sharpness of *image_rgb*.

    Parameters
    ----------
    image_rgb:
        Input image in RGB uint8 format.
    min_brightness:
        Reject if mean gray-level is below this (default from config).
    max_brightness:
        Reject if mean gray-level exceeds this (default from config).
    min_blur_score:
        Reject if Laplacian variance is below this (default from config).

    Returns
    -------
    QualityResult
        Contains a validity flag, measured metrics, and an optional
        human-readable rejection reason.
    """
    _min_b = min_brightness if min_brightness is not None else CONFIG.quality_min_brightness
    _max_b = max_brightness if max_brightness is not None else CONFIG.quality_max_brightness
    _min_blur = min_blur_score if min_blur_score is not None else CONFIG.quality_min_blur_score

    gray = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2GRAY)
    # IMPROVEMENT: Normalize brightness to 0–1 scale to match CONFIG thresholds
    # (quality_min_brightness=0.2, quality_max_brightness=0.9). Previously the raw
    # 0–255 mean was compared against these 0–1 values, so the checks never fired.
    brightness = float(gray.mean()) / 255.0
    blur_score = float(cv2.Laplacian(gray, cv2.CV_64F).var())

    LOGGER.debug("Quality check — brightness=%.3f  blur=%.1f", brightness, blur_score)

    if brightness < _min_b:
        return QualityResult(
            is_valid=False,
            brightness=brightness,
            blur_score=blur_score,
            rejection_reason=(
                "Image is too dark. Please retake the photo in better lighting "
                "with your face clearly visible."
            ),
        )

    if brightness > _max_b:
        return QualityResult(
            is_valid=False,
            brightness=brightness,
            blur_score=blur_score,
            rejection_reason=(
                "Image is overexposed. Please reduce lighting or avoid "
                "direct light on the camera."
            ),
        )

    if blur_score < _min_blur:
        return QualityResult(
            is_valid=False,
            brightness=brightness,
            blur_score=blur_score,
            rejection_reason=(
                "Image is too blurry. Please hold the camera steady, "
                "ensure focus, and try again."
            ),
        )

    return QualityResult(
        is_valid=True,
        brightness=brightness,
        blur_score=blur_score,
    )
