"""Background dataset growth monitor and conditional retraining pipeline."""
from __future__ import annotations

import json
import logging
import re
import subprocess
import sys
import threading
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

LOGGER = logging.getLogger(__name__)

_IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".webp", ".gif"}
_BEST_ACC_PATTERN = re.compile(r"New best val acc:\s*([0-9.]+)%")


@dataclass
class RetrainConfig:
    dataset_root: Path
    production_weights: Path
    production_metadata: Path
    retrain_threshold: int = 500
    poll_interval_seconds: int = 300


class RetrainMonitor:
    """Watches user-collected images and runs retraining out-of-band."""

    def __init__(self, config: RetrainConfig) -> None:
        self._config = config
        self._state_path = self._config.dataset_root / "retrain_state.json"
        self._stop_event = threading.Event()
        self._thread: threading.Thread | None = None
        self._retrain_lock = threading.Lock()

    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return
        self._config.dataset_root.mkdir(parents=True, exist_ok=True)
        self._thread = threading.Thread(target=self._loop, daemon=True, name="retrain-monitor")
        self._thread.start()
        LOGGER.info(
            "Retrain monitor started | threshold=%d poll_interval_s=%d",
            self._config.retrain_threshold,
            self._config.poll_interval_seconds,
        )

    def stop(self) -> None:
        self._stop_event.set()

    def _read_state(self) -> dict[str, Any]:
        if not self._state_path.exists():
            return {
                "last_seen_count": 0,
                "last_retrain_count": 0,
                "production_accuracy": None,
                "last_run_at": None,
            }
        try:
            return json.loads(self._state_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return {
                "last_seen_count": 0,
                "last_retrain_count": 0,
                "production_accuracy": None,
                "last_run_at": None,
            }

    def _write_state(self, state: dict[str, Any]) -> None:
        self._state_path.write_text(json.dumps(state, indent=2), encoding="utf-8")

    def _count_images(self) -> int:
        if not self._config.dataset_root.exists():
            return 0
        return sum(1 for file in self._config.dataset_root.rglob("*") if file.suffix.lower() in _IMAGE_EXTS)

    def _loop(self) -> None:
        while not self._stop_event.is_set():
            try:
                self._check_and_retrain()
            except Exception:
                LOGGER.exception("Retrain monitor check failed")
            self._stop_event.wait(self._config.poll_interval_seconds)

    def _check_and_retrain(self) -> None:
        with self._retrain_lock:
            state = self._read_state()
            count = self._count_images()
            state["last_seen_count"] = count

            since_last_retrain = count - int(state.get("last_retrain_count", 0))
            if since_last_retrain < self._config.retrain_threshold:
                self._write_state(state)
                return

            LOGGER.info(
                "Retrain threshold reached | total_images=%d new_since_last=%d",
                count,
                since_last_retrain,
            )

            candidate_dir = self._config.production_weights.parent / "retrained"
            candidate_dir.mkdir(parents=True, exist_ok=True)
            run_stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
            candidate_weights = candidate_dir / f"skin_classifier_v2s_{run_stamp}.pt"
            candidate_metadata = candidate_dir / f"model_metadata_{run_stamp}.json"

            best_val_acc = self._run_training(candidate_weights, candidate_metadata)
            production_acc = state.get("production_accuracy")

            should_promote = (
                best_val_acc is not None
                and (production_acc is None or best_val_acc > float(production_acc))
            )

            if should_promote:
                self._promote_candidate(candidate_weights, candidate_metadata)
                state["production_accuracy"] = best_val_acc
                LOGGER.info(
                    "Promoted retrained model | new_acc=%.2f%% old_acc=%s",
                    best_val_acc,
                    production_acc,
                )
            else:
                LOGGER.info(
                    "Skipped model promotion | candidate_acc=%s production_acc=%s",
                    best_val_acc,
                    production_acc,
                )

            state["last_retrain_count"] = count
            state["last_run_at"] = datetime.now(timezone.utc).isoformat()
            self._write_state(state)

    def _run_training(self, candidate_weights: Path, candidate_metadata: Path) -> float | None:
        cmd = [
            sys.executable,
            "-m",
            "tools.training.train",
            "--weights-out",
            str(candidate_weights),
            "--metadata-out",
            str(candidate_metadata),
        ]
        LOGGER.info("Starting background retraining job: %s", " ".join(cmd))
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            cwd=str(Path(__file__).resolve().parents[1]),
            check=False,
        )
        if result.returncode != 0:
            LOGGER.error("Retraining failed with code %s", result.returncode)
            LOGGER.error("Retraining stderr: %s", result.stderr[-2000:])
            return None

        output = result.stdout
        matches = _BEST_ACC_PATTERN.findall(output)
        if not matches:
            LOGGER.warning("Could not parse validation accuracy from training output")
            return None

        return float(matches[-1])

    def _promote_candidate(self, candidate_weights: Path, candidate_metadata: Path) -> None:
        candidate_weights.replace(self._config.production_weights)
        candidate_metadata.replace(self._config.production_metadata)
