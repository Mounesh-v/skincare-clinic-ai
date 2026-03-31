import os
import json
import random
import logging
import threading
import numpy as np
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class SkinTypeMonitor:
    """
    Production monitoring class to track prediction confidence, entropy, and bias drift.
    Ensures thread safety and memory bounds.
    """
    def __init__(self):
        self.prediction_counts = {"oily": 0, "dry": 0, "normal": 0, "combination": 0}
        self.total = 0
        self.conf_sum = 0.0
        self.lock = threading.Lock()

    def track_prediction(self, result: Dict[str, Any], image_rgb: np.ndarray = None):
        """Asynchronously tracks prediction distribution, entropy, and bias drift."""
        try:
            skin_type = result.get("skin_type", "").lower()
            confidence = float(result.get("confidence", 0.0))
            scores = result.get("scores", {})
            
            # Entropy calculation (SAFE)
            entropy = -sum(p * np.log(p + 1e-9) for p in scores.values())
            
            # Top-2 gap calculation
            sorted_scores = sorted(scores.values(), reverse=True)
            gap = (sorted_scores[0] - sorted_scores[1]) if len(sorted_scores) > 1 else 0.0

            # Structured logging (Task 7)
            log_data = {
                "type": result.get("skin_type"),
                "confidence": confidence,
                "scores": scores,
                "top2_gap": round(gap, 4),
                "entropy": round(float(entropy), 4)
            }
            logger.info(json.dumps(log_data))

            # Debug image saving (RATE LIMITED)
            if confidence < 0.50 and random.random() < 0.2 and image_rgb is not None:
                os.makedirs("debug_samples", exist_ok=True)
                import cv2
                import uuid
                sample_id = uuid.uuid4().hex[:8]
                filename = os.path.join("debug_samples", f"debug_{sample_id}.jpg")
                cv2.imwrite(filename, cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR))
                with open(f"{filename}.json", "w") as f:
                    json.dump(log_data, f, indent=2)

            # Thread-safe metric updates
            with self.lock:
                self.total += 1
                if skin_type in self.prediction_counts:
                    self.prediction_counts[skin_type] += 1
                self.conf_sum += confidence

                # Drift detection (every 50 predictions)
                if self.total > 0 and self.total % 50 == 0:
                    self._check_drift_no_lock()

                # Memory safety
                if self.total > 1000:
                    self.prediction_counts = {"oily": 0, "dry": 0, "normal": 0, "combination": 0}
                    self.total = 0
                    self.conf_sum = 0.0

        except Exception as e:
            logger.error(f"Monitor tracking failed (non-blocking): {str(e)}")

    def _check_drift_no_lock(self):
        """Check for statistical bias without re-locking (assumes lock is held)."""
        comb_ratio = self.prediction_counts.get("combination", 0) / self.total
        oily_ratio = self.prediction_counts.get("oily", 0) / self.total
        normal_ratio = self.prediction_counts.get("normal", 0) / self.total

        drift_detected = False

        if comb_ratio > 0.40:
            logger.warning(f"Combination bias detected: {comb_ratio*100:.1f}%")
            drift_detected = True
        
        if oily_ratio > 0.50:
            logger.warning(f"Oily bias detected: {oily_ratio*100:.1f}%")
            drift_detected = True
            
        if normal_ratio < 0.15:
            logger.warning(f"Normal under-detection: {normal_ratio*100:.1f}%")
            drift_detected = True

        # Confidence monitoring
        avg_conf = self.conf_sum / self.total
        if avg_conf > 0.75:
            logger.warning(f"Overconfident model (avg: {avg_conf:.2f})")
        
        if avg_conf < 0.45:
            logger.warning(f"Underconfident model (avg: {avg_conf:.2f})")

        # Retraining trigger hint
        if drift_detected:
            logger.warning("Retraining recommended: dataset imbalance or domain shift")

# Global singleton
monitor = SkinTypeMonitor()

def evaluate_batch(images: List[np.ndarray]) -> Dict[str, Any]:
    """
    Evaluate a batch of images directly bypassing the API.
    Used for offline evaluation and testing.
    """
    from ml.skin_type_vit import infer_skin_type_vit
    
    distribution = {"oily": 0, "dry": 0, "normal": 0, "combination": 0}
    total_conf = 0.0
    total_entropy = 0.0
    
    if not images:
        return {}
        
    for image in images:
        # ViT returns {oily, dry, normal} probability scores directly.
        # Do NOT pass these into infer_skin_type() — that function expects
        # condition keys (acne, pores, wrinkles, …), not skin-type probabilities.
        vit_scores = infer_skin_type_vit(image)

        # Derive type and confidence directly from ViT scores.
        best_key = max(vit_scores, key=lambda k: float(vit_scores.get(k, 0.0)))
        confidence = float(vit_scores[best_key])

        parsed_type = best_key.lower()
        if parsed_type in distribution:
            distribution[parsed_type] += 1

        total_conf += confidence

        entropy = -sum(p * np.log(p + 1e-9) for p in vit_scores.values())
        total_entropy += entropy
        
    N = len(images)
    return {
        "distribution": {k: round(v / N, 4) for k, v in distribution.items()},
        "avg_confidence": round(total_conf / N, 4),
        "avg_entropy": round(float(total_entropy / N), 4)
    }
