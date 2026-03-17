"""Entry point for the local skin analysis microservice."""
from __future__ import annotations

import argparse
import json
import logging
import mimetypes
import os
import signal
import sys
import threading
import time
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any, Dict
from urllib.parse import ParseResult, unquote, urlparse

from .analyzer import SkinAnalyzerService
from .retraining import RetrainConfig, RetrainMonitor

LOGGER = logging.getLogger("ml_service")

# Respect NODE_ENV: suppress INFO noise in production
_IS_PRODUCTION = os.getenv("NODE_ENV", "development").lower() == "production"
_LOG_LEVEL = logging.WARNING if _IS_PRODUCTION else logging.INFO
logging.basicConfig(level=_LOG_LEVEL, format="[%(asctime)s] %(levelname)s - %(message)s")

if _IS_PRODUCTION:
    LOGGER.warning("ML service running in PRODUCTION mode (log level=WARNING)")
else:
    LOGGER.info("ML service running in DEVELOPMENT mode (log level=INFO)")

# 10 MB limit for uploaded images (base64-encoded)
_MAX_BODY_BYTES = 10 * 1024 * 1024

# ---------------------------------------------------------------------------
# CORS allowlist  —  reads ML_ALLOWED_ORIGINS from env, e.g.
#   ML_ALLOWED_ORIGINS=http://localhost:5005,http://localhost:5174
# ---------------------------------------------------------------------------
_DEFAULT_ORIGINS = "http://localhost:5005,http://localhost:5174,http://127.0.0.1:5005,http://127.0.0.1:5174"
_ALLOWED_ORIGINS: frozenset[str] = frozenset(
    o.strip() for o in os.getenv("ML_ALLOWED_ORIGINS", _DEFAULT_ORIGINS).split(",") if o.strip()
)

# ---------------------------------------------------------------------------
# Per-IP token-bucket rate limiter for /api/analyze
# Limit: 10 requests per 60-second window per IP address
# ---------------------------------------------------------------------------
_RATE_LIMIT_WINDOW = 60.0          # seconds
_RATE_LIMIT_MAX = 10               # max requests per window
_rate_lock = threading.Lock()
_rate_buckets: dict[str, list[float]] = {}  # ip -> list of request timestamps


def _check_rate_limit(ip: str) -> bool:
    """Return True if the request is allowed, False if rate limit exceeded."""
    now = time.monotonic()
    with _rate_lock:
        timestamps = _rate_buckets.get(ip, [])
        # Drop timestamps older than the window
        timestamps = [t for t in timestamps if now - t < _RATE_LIMIT_WINDOW]
        if len(timestamps) >= _RATE_LIMIT_MAX:
            _rate_buckets[ip] = timestamps
            return False
        timestamps.append(now)
        _rate_buckets[ip] = timestamps
        return True


PROJECT_ROOT = Path(__file__).resolve().parents[1]
STATIC_ROOT = PROJECT_ROOT / "client" / "dist"
INDEX_FILE = STATIC_ROOT / "index.html"


class SkinServiceHandler(BaseHTTPRequestHandler):
    analyzer: SkinAnalyzerService | None = None
    analyzer_lock = threading.Lock()
    retrain_monitor: RetrainMonitor | None = None
    started_at = time.time()
    static_root = STATIC_ROOT
    index_file = INDEX_FILE

    # Disable default noisy logging to stderr
    def log_message(self, format: str, *args: Any) -> None:  # pragma: no cover - HTTPServer hook
        LOGGER.info("%s - %s", self.address_string(), format % args)

    def _set_cors_headers(self) -> None:
        origin = self.headers.get("Origin") or ""
        # Only echo back origins from the allowlist
        if origin in _ALLOWED_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type,Authorization")
            self.send_header("Access-Control-Allow-Credentials", "true")
        # Unknown origins: no CORS headers — browser's same-origin policy will block them

    def _json_response(self, payload: Dict[str, Any], status: HTTPStatus = HTTPStatus.OK) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self._set_cors_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _json_error(self, message: str, status: HTTPStatus = HTTPStatus.BAD_REQUEST) -> None:
        self._json_response({"detail": message}, status=status)

    def _read_json(self) -> Dict[str, Any]:
        content_length = int(self.headers.get("Content-Length", "0"))
        if content_length > _MAX_BODY_BYTES:
            raise ValueError(f"Request body too large ({content_length} bytes). Limit is {_MAX_BODY_BYTES} bytes.")
        raw = self.rfile.read(content_length) if content_length else b"{}"
        if len(raw) > _MAX_BODY_BYTES:
            raise ValueError("Request body exceeded size limit.")
        data = json.loads(raw.decode("utf-8"))
        if not isinstance(data, dict):
            raise ValueError("JSON body must be an object")
        return data

    @classmethod
    def _get_analyzer(cls) -> SkinAnalyzerService:
        if cls.analyzer is not None:
            return cls.analyzer
        with cls.analyzer_lock:
            if cls.analyzer is None:
                cls.analyzer = SkinAnalyzerService()
        return cls.analyzer

    def do_OPTIONS(self) -> None:  # noqa: N802
        self.send_response(HTTPStatus.NO_CONTENT)
        self._set_cors_headers()
        self.end_headers()

    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/"):
            self._handle_api_get(parsed)
            return
        self._serve_static(parsed.path)

    def do_POST(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        if not parsed.path.startswith("/api/"):
            self._json_error("Not Found", status=HTTPStatus.NOT_FOUND)
            return
        try:
            body = self._read_json()
        except json.JSONDecodeError:
            self._json_error("Invalid JSON payload", status=HTTPStatus.BAD_REQUEST)
            return
        except ValueError as exc:
            self._json_error(str(exc), status=HTTPStatus.BAD_REQUEST)
            return

        if parsed.path == "/api/analyze":
            # Rate limit check before any heavy work
            client_ip = self.client_address[0]
            if not _check_rate_limit(client_ip):
                LOGGER.warning("Rate limit exceeded for IP %s on /api/analyze", client_ip)
                self._json_error(
                    "Rate limit exceeded. Maximum 10 requests per minute. Please try again shortly.",
                    status=HTTPStatus.TOO_MANY_REQUESTS,
                )
                return
            try:
                analyzer = self._get_analyzer()
                result = analyzer.analyze_request(body)
                self._json_response(result)
            except ValueError as exc:
                LOGGER.error("Validation error: %s", exc)
                self._json_error(str(exc), status=HTTPStatus.BAD_REQUEST)
            except FileNotFoundError:
                # Do NOT expose internal file paths in production
                LOGGER.exception("Model weights not found")
                self._json_error(
                    "ML model unavailable. Please contact support.",
                    status=HTTPStatus.INTERNAL_SERVER_ERROR,
                )
            except Exception:  # pragma: no cover - guardrail
                LOGGER.exception("Failed to analyze payload")
                self._json_error(
                    "Internal server error during analysis.",
                    status=HTTPStatus.INTERNAL_SERVER_ERROR,
                )
            return



        self._json_error("Not Found", status=HTTPStatus.NOT_FOUND)

    def _handle_api_get(self, parsed_path: ParseResult) -> None:
        if parsed_path.path == "/api/health":
            uptime = time.time() - self.started_at
            payload = {
                "status": "ok",
                "uptime": round(uptime, 2),
                "model_loaded": self.analyzer is not None,
            }
            self._json_response(payload)
            return
        self._json_error("Not Found", status=HTTPStatus.NOT_FOUND)

    def _serve_static(self, request_path: str) -> None:
        if not self.static_root.exists():
            self.send_error(HTTPStatus.NOT_FOUND, "Frontend build not found. Run `npm run build` inside client/ first.")
            return
        normalized = unquote(request_path.split("?", 1)[0].split("#", 1)[0])
        relative = normalized.lstrip("/")
        cache_forever = False
        if not relative:
            target = self.index_file
        else:
            target = (self.static_root / relative).resolve()
            try:
                target.relative_to(self.static_root)
            except ValueError:
                self.send_error(HTTPStatus.FORBIDDEN, "Invalid path")
                return
            if target.is_file():
                cache_forever = relative.startswith("assets/")
            else:
                if "." in relative:
                    self.send_error(HTTPStatus.NOT_FOUND, "Static asset not found")
                    return
                target = self.index_file
        self._send_file(target, cache_forever)

    def _send_file(self, file_path: Path, cache_forever: bool) -> None:
        try:
            content = file_path.read_bytes()
        except FileNotFoundError:
            self.send_error(HTTPStatus.NOT_FOUND, "File not found")
            return
        mime, _ = mimetypes.guess_type(str(file_path))
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", mime or "application/octet-stream")
        self.send_header("Content-Length", str(len(content)))
        cache_header = "public, max-age=31536000, immutable" if cache_forever else "no-cache"
        self.send_header("Cache-Control", cache_header)
        self.end_headers()
        self.wfile.write(content)


def create_server(host: str, port: int) -> ThreadingHTTPServer:
    SkinServiceHandler.started_at = time.time()
    analyzer = SkinAnalyzerService()
    analyzer.load_models()
    SkinServiceHandler.analyzer = analyzer

    SkinServiceHandler.retrain_monitor = RetrainMonitor(
        RetrainConfig(
            dataset_root=PROJECT_ROOT / "ml" / "data" / "user_collected",
            production_weights=Path(os.getenv("SKINCARE_PROD_WEIGHTS", str(PROJECT_ROOT / "ml" / "models" / "skin_classifier_v2s.pt"))),
            production_metadata=Path(os.getenv("SKINCARE_PROD_METADATA", str(PROJECT_ROOT / "ml" / "models" / "model_metadata.json"))),
            retrain_threshold=int(os.getenv("SKINCARE_RETRAIN_THRESHOLD", "500")),
            poll_interval_seconds=int(os.getenv("SKINCARE_RETRAIN_POLL_SECONDS", "300")),
        )
    )
    SkinServiceHandler.retrain_monitor.start()

    server = ThreadingHTTPServer((host, port), SkinServiceHandler)
    LOGGER.info("Starting ML service on http://%s:%s serving %s", host, port, STATIC_ROOT)
    return server


def serve_forever(server: ThreadingHTTPServer) -> None:
    def shutdown_handler(signum: int, _frame: Any) -> None:  # pragma: no cover - signal handler
        LOGGER.info("Received signal %s, shutting down", signum)
        server.shutdown()

    signal.signal(signal.SIGINT, shutdown_handler)
    signal.signal(signal.SIGTERM, shutdown_handler)
    try:
        server.serve_forever()
    finally:
        if SkinServiceHandler.retrain_monitor is not None:
            SkinServiceHandler.retrain_monitor.stop()
        server.server_close()
        LOGGER.info("ML service stopped")


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Run the skin analysis microservice")
    parser.add_argument("--host", default=os.getenv("APP_HOST", "127.0.0.1"))
    parser.add_argument("--port", type=int, default=int(os.getenv("APP_PORT", "5174")))
    args = parser.parse_args(argv)

    server = create_server(args.host, args.port)
    serve_forever(server)


if __name__ == "__main__":
    main(sys.argv[1:])
