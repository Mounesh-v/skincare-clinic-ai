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
from .auth import verify_google_token

LOGGER = logging.getLogger("ml_service")
logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(levelname)s - %(message)s")


PROJECT_ROOT = Path(__file__).resolve().parents[1]
STATIC_ROOT = PROJECT_ROOT / "client" / "dist"
INDEX_FILE = STATIC_ROOT / "index.html"


class SkinServiceHandler(BaseHTTPRequestHandler):
    analyzer: SkinAnalyzerService | None = None
    analyzer_lock = threading.Lock()
    started_at = time.time()
    static_root = STATIC_ROOT
    index_file = INDEX_FILE

    # Disable default noisy logging to stderr
    def log_message(self, format: str, *args: Any) -> None:  # pragma: no cover - HTTPServer hook
        LOGGER.info("%s - %s", self.address_string(), format % args)

    def _set_cors_headers(self) -> None:
        origin = self.headers.get("Origin") or "*"
        self.send_header("Access-Control-Allow-Origin", origin)
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type,Authorization")
        self.send_header("Access-Control-Allow-Credentials", "true")

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
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length) if length else b"{}"
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
            try:
                analyzer = self._get_analyzer()
                result = analyzer.analyze_request(body)
                self._json_response(result)
            except ValueError as exc:
                self._json_error(str(exc), status=HTTPStatus.BAD_REQUEST)
            except FileNotFoundError as exc:
                self._json_error(str(exc), status=HTTPStatus.INTERNAL_SERVER_ERROR)
            except Exception as exc:  # pragma: no cover - guardrail
                LOGGER.exception("Failed to analyze payload")
                self._json_error(str(exc), status=HTTPStatus.INTERNAL_SERVER_ERROR)
            return

        if parsed.path == "/api/auth/google":
            credential = body.get("credential")
            if not credential:
                self._json_error("credential is required", status=HTTPStatus.BAD_REQUEST)
                return
            try:
                auth_payload = verify_google_token(credential)
                self._json_response(auth_payload)
            except ValueError as exc:
                self._json_error(str(exc), status=HTTPStatus.BAD_REQUEST)
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
