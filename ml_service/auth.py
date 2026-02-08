"""Authentication helpers for Google OAuth backed by MongoDB storage."""

from __future__ import annotations

import os
import uuid
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta
from typing import TYPE_CHECKING, Any, Dict, Optional, Tuple, cast

try:  # pragma: no cover - optional dependency
    import jwt
except Exception as jwt_import_error:  # pragma: no cover - defer failure until use
    jwt = None  # type: ignore[assignment]
    _jwt_error = jwt_import_error
else:
    _jwt_error = None

try:  # pragma: no cover - optional dependency
    from google.oauth2 import id_token
    from google.auth.transport import requests as google_requests
except Exception as google_import_error:  # pragma: no cover - defer failure until use
    id_token = None  # type: ignore[assignment]
    google_requests = None  # type: ignore[assignment]
    _google_error = google_import_error
else:
    _google_error = None

if TYPE_CHECKING:  # pragma: no cover - hints only
    from google.auth.transport.requests import Request
    from pymongo.collection import Collection

try:  # pragma: no cover - optional dependency
    from pymongo import MongoClient
    from pymongo.errors import DuplicateKeyError, PyMongoError
except Exception as mongo_import_error:  # pragma: no cover - defer failure until use
    MongoClient = None  # type: ignore[assignment]
    DuplicateKeyError = PyMongoError = Exception  # type: ignore[assignment]
    _mongo_error = mongo_import_error
else:
    _mongo_error = None


MONGODB_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB_NAME = os.environ.get("MONGODB_DB_NAME", "skincare_ai")
MONGODB_USERS_COLLECTION = os.environ.get("MONGODB_USERS_COLLECTION", "users")

JWT_SECRET = os.environ.get("AUTH_JWT_SECRET", "change-me")
JWT_ALGORITHM = os.environ.get("AUTH_JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.environ.get("AUTH_JWT_EXPIRE_MINUTES", "120"))

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")

_GOOGLE_REQUEST: Optional["Request"] = None
_MONGO_CLIENT: Optional[MongoClient] = None  # type: ignore[valid-type]
_USERS_COLLECTION: Optional["Collection"] = None


@dataclass
class UserRecord:
    id: str
    google_id: str
    email: str
    name: str
    picture: Optional[str]
    created_at: str
    updated_at: str

    def to_public_dict(self) -> Dict[str, Optional[str]]:
        data = asdict(self)
        data.pop("google_id", None)
        data.pop("created_at", None)
        data.pop("updated_at", None)
        return {key: data[key] for key in data}


def _raise_google_error() -> None:
    if _google_error is not None:
        raise RuntimeError("google-auth library not available") from _google_error
    raise RuntimeError("Google authentication not configured")


def _raise_mongo_error() -> None:
    if _mongo_error is not None:
        raise RuntimeError("pymongo library not available") from _mongo_error
    raise RuntimeError("MongoDB configuration invalid")


def _raise_jwt_error() -> None:
    if _jwt_error is not None:
        raise RuntimeError("PyJWT library not available") from _jwt_error
    raise RuntimeError("JWT configuration invalid")


def ensure_auth_ready() -> None:
    if GOOGLE_CLIENT_ID is None:
        raise RuntimeError("GOOGLE_CLIENT_ID environment variable is required for Google login")
    _initialise_collection()
    _ensure_google_request()
    if jwt is None:
        _raise_jwt_error()


def _ensure_google_request() -> None:
    global _GOOGLE_REQUEST
    if _GOOGLE_REQUEST is None:
        if google_requests is None:
            _raise_google_error()
        request_factory = cast(Any, google_requests)
        _GOOGLE_REQUEST = cast("Request", request_factory.Request())


def _initialise_collection() -> None:
    global _MONGO_CLIENT, _USERS_COLLECTION
    if _USERS_COLLECTION is not None:
        return
    if MongoClient is None:
        _raise_mongo_error()
    try:
        mongo_client_class = cast(Any, MongoClient)
        client = mongo_client_class(MONGODB_URI, serverSelectionTimeoutMS=5000)
        client.admin.command("ping")
        db = client[MONGODB_DB_NAME]
        collection = db[MONGODB_USERS_COLLECTION]
        collection.create_index("google_id", unique=True)
        collection.create_index("email", unique=True)
    except PyMongoError as exc:  # type: ignore[misc]
        raise RuntimeError("Failed to initialise MongoDB for authentication") from exc
    _MONGO_CLIENT = client
    _USERS_COLLECTION = cast("Collection", collection)


def verify_google_token(credential: str) -> Dict[str, str]:
    ensure_auth_ready()
    if id_token is None:
        _raise_google_error()
    try:
        token_module = cast(Any, id_token)
        id_info = token_module.verify_oauth2_token(credential, _GOOGLE_REQUEST, GOOGLE_CLIENT_ID)
    except ValueError as exc:  # pragma: no cover - depends on runtime token
        raise ValueError("Invalid Google ID token") from exc

    if id_info.get("aud") != GOOGLE_CLIENT_ID:
        raise ValueError("Token audience mismatch")
    if id_info.get("email_verified") is not True:
        raise ValueError("Google email is not verified")
    return id_info


def _collection() -> "Collection":
    if _USERS_COLLECTION is None:
        _initialise_collection()
    return cast("Collection", _USERS_COLLECTION)


def _doc_to_user(document: Dict[str, Any]) -> UserRecord:
    return UserRecord(
        id=str(document.get("id") or document.get("_id")),
        google_id=str(document.get("google_id", "")),
        email=str(document.get("email", "")),
        name=str(document.get("name", "")),
        picture=document.get("picture"),
        created_at=str(document.get("created_at", "")),
        updated_at=str(document.get("updated_at", "")),
    )


def get_or_create_user(id_info: Dict[str, str]) -> UserRecord:
    ensure_auth_ready()
    google_id_value = str(id_info.get("sub"))
    email_value = str(id_info.get("email", "")).lower()
    if not google_id_value or not email_value:
        raise ValueError("Google token missing subject or email")
    display_name = str(id_info.get("name") or email_value.split("@")[0]).strip()
    avatar = str(id_info.get("picture") or "").strip() or None
    timestamp = datetime.utcnow().isoformat(timespec="seconds")

    collection = _collection()
    existing = collection.find_one({"$or": [{"google_id": google_id_value}, {"email": email_value}]})
    if existing:
        updates: Dict[str, Any] = {}
        if existing.get("google_id") != google_id_value:
            updates["google_id"] = google_id_value
        if display_name and existing.get("name") != display_name:
            updates["name"] = display_name
        if existing.get("picture") != avatar:
            updates["picture"] = avatar
        if updates:
            updates["updated_at"] = timestamp
            collection.update_one({"_id": existing.get("_id")}, {"$set": updates})
            refreshed = collection.find_one({"_id": existing.get("_id")})
            if refreshed:
                existing = refreshed
        return _doc_to_user(existing)

    user_id = str(uuid.uuid4())
    document = {
        "id": user_id,
        "google_id": google_id_value,
        "email": email_value,
        "name": display_name,
        "picture": avatar,
        "created_at": timestamp,
        "updated_at": timestamp,
    }
    try:
        collection.insert_one(document)
    except DuplicateKeyError:
        fallback = collection.find_one({"$or": [{"google_id": google_id_value}, {"email": email_value}]})
        if fallback:
            return _doc_to_user(fallback)
        raise
    return UserRecord(**document)


def issue_jwt(user: UserRecord) -> Tuple[str, datetime]:
    ensure_auth_ready()
    if jwt is None:
        _raise_jwt_error()
    issued_at = datetime.utcnow()
    expires_at = issued_at + timedelta(minutes=JWT_EXPIRE_MINUTES)
    payload = {
        "sub": user.id,
        "email": user.email,
        "name": user.name,
        "iat": int(issued_at.timestamp()),
        "exp": int(expires_at.timestamp()),
    }
    jwt_module = cast(Any, jwt)
    token = jwt_module.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    if isinstance(token, bytes):
        token = token.decode("utf-8")
    return token, expires_at


def serialize_user(user: UserRecord) -> Dict[str, Optional[str]]:
    public = user.to_public_dict()
    # Ensure required fields fall back to safe defaults
    result: Dict[str, Optional[str]] = {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "picture": public.get("picture"),
    }
    for key, value in public.items():
        if key not in result:
            result[key] = value
    return result