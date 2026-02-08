from pathlib import Path

try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover - optional dev dependency
    load_dotenv = None
else:
    base_dir = Path(__file__).resolve().parent
    load_dotenv(base_dir / ".env", override=False)
    load_dotenv(base_dir / ".env.local", override=True)
