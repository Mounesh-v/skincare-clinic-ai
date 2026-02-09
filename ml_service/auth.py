"""Lightweight auth helpers for local testing."""
from __future__ import annotations

import base64
import json
import secrets
import time
from typing import Any, Dict


def _decode_jwt_payload(token: str) -> Dict[str, Any]:
    parts = token.split(".")
    if len(parts) != 3:
        return {}
    payload = parts[1]
    padding = "=" * (-len(payload) % 4)
    try:
        decoded = base64.urlsafe_b64decode((payload + padding).encode("utf-8"))
        data = json.loads(decoded.decode("utf-8"))
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def verify_google_token(credential: str) -> Dict[str, Any]:
    if not credential or not isinstance(credential, str):
        raise ValueError("Google credential is required")
    payload = _decode_jwt_payload(credential)
    name = payload.get("name") or payload.get("given_name") or "Guest User"
    email = payload.get("email") or "guest@example.com"
    picture = payload.get("picture") or "https://placehold.co/128x128?text=User"
    now = int(time.time())
    token = secrets.token_urlsafe(32)
    user = {
        "id": payload.get("sub") or secrets.token_hex(8),
        "name": name,
        "email": email,
        "picture": picture,
        "provider": "google",
        "created_at": payload.get("iat", now),
    }
    return {
        "token": token,
        "user": user,
        "issued_at": now,
        "expires_in": 60 * 60 * 12,
    }
