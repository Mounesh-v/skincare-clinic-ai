"""Convenience entrypoint for running the unified web + ML service."""
from __future__ import annotations

import sys

from ml_service.main import main as run_service


if __name__ == "__main__":
    run_service(sys.argv[1:])
