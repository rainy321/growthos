# -*- coding: utf-8 -*-
"""Password hashing and signed session tokens using only the standard library.

The previous implementation used a single SHA-256 round.  It remains readable so
existing demo accounts can sign in, while every newly created password uses
PBKDF2-HMAC-SHA256.  Session tokens are compact HMAC-signed payloads; they are
deliberately simple, but still expire and cannot be forged without SESSION_SECRET.
"""
import base64
import hashlib
import hmac
import json
import os
import secrets
import time


PBKDF2_ITERATIONS = 310_000
SESSION_TTL_SECONDS = 60 * 60 * 24 * 7


def _b64encode(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")


def _b64decode(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def _session_secret() -> bytes:
    secret = os.environ.get("SESSION_SECRET", "").strip()
    if not secret:
        if os.environ.get("ENVIRONMENT", "").lower() == "production":
            raise RuntimeError("SESSION_SECRET is required in production")
        secret = "growth-os-local-development-only"
    return secret.encode("utf-8")


def hash_pw(password: str) -> str:
    """Return a slow, salted password hash suitable for storage."""
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", (password or "").encode("utf-8"), salt, PBKDF2_ITERATIONS
    )
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${_b64encode(salt)}${_b64encode(digest)}"


def verify_pw(password: str, stored: str | None) -> bool:
    """Verify current PBKDF2 hashes and legacy ``salt$sha256`` hashes."""
    if not stored:
        return False
    parts = stored.split("$")
    if len(parts) == 4 and parts[0] == "pbkdf2_sha256":
        try:
            iterations = int(parts[1])
            salt = _b64decode(parts[2])
            expected = _b64decode(parts[3])
        except (TypeError, ValueError):
            return False
        actual = hashlib.pbkdf2_hmac(
            "sha256", (password or "").encode("utf-8"), salt, iterations
        )
        return hmac.compare_digest(actual, expected)

    # Backwards compatibility for seeded accounts from the hackathon build.
    if len(parts) == 2:
        salt, expected = parts
        actual = hashlib.sha256((salt + (password or "")).encode("utf-8")).hexdigest()
        return hmac.compare_digest(actual, expected)
    return False


def create_token(user_id: str, ttl_seconds: int = SESSION_TTL_SECONDS) -> str:
    payload = {
        "sub": user_id,
        "iat": int(time.time()),
        "exp": int(time.time()) + ttl_seconds,
    }
    encoded = _b64encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signature = _b64encode(hmac.new(_session_secret(), encoded.encode("ascii"), hashlib.sha256).digest())
    return f"{encoded}.{signature}"


def verify_token(token: str | None) -> str | None:
    if not token or "." not in token:
        return None
    encoded, supplied = token.split(".", 1)
    expected = _b64encode(hmac.new(_session_secret(), encoded.encode("ascii"), hashlib.sha256).digest())
    if not hmac.compare_digest(supplied, expected):
        return None
    try:
        payload = json.loads(_b64decode(encoded))
        if int(payload.get("exp", 0)) <= int(time.time()):
            return None
        return str(payload["sub"])
    except (KeyError, TypeError, ValueError, json.JSONDecodeError):
        return None
