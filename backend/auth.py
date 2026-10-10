"""
auth.py — Password hashing with bcrypt and JWT token management.

Replaces the previous SHA-256+salt approach.
Existing SHA-256 hashes are detected by the absence of '$2b$' prefix
and handled via a migration path: login still works, password is
re-hashed with bcrypt on next successful login.

NOTE: Uses bcrypt directly (bypasses passlib) because bcrypt>=4.x breaks passlib.
"""

import os
import hashlib
import bcrypt as _bcrypt
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt

# ─── Password hashing ────────────────────────────────────────────────────────

# bcrypt hard-limits passwords to 72 bytes
_MAX_PW_BYTES = 72


def _encode(password: str) -> bytes:
    """Encode password to bytes, truncated to 72 bytes (bcrypt hard limit)."""
    return password.encode("utf-8")[:_MAX_PW_BYTES]


def hash_password(password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    return _bcrypt.hashpw(_encode(password), _bcrypt.gensalt()).decode("utf-8")


def _verify_sha256_legacy(password: str, stored: str) -> bool:
    """Verify a password against the old SHA-256+salt format: 'salt$hash'."""
    try:
        salt, hash_value = stored.split('$', 1)
        h = hashlib.sha256((password + salt).encode()).hexdigest()
        return h == hash_value
    except Exception:
        return False


def verify_password(password: str, stored_hash: str) -> bool:
    """
    Verify a password against stored hash.
    Supports both bcrypt (new) and SHA-256+salt (legacy).
    """
    if stored_hash.startswith('$2b$') or stored_hash.startswith('$2a$'):
        return _bcrypt.checkpw(_encode(password), stored_hash.encode("utf-8"))
    # Legacy SHA-256 format
    return _verify_sha256_legacy(password, stored_hash)


def needs_rehash(stored_hash: str) -> bool:
    """True if the stored hash is legacy SHA-256 and should be upgraded to bcrypt."""
    return not (stored_hash.startswith('$2b$') or stored_hash.startswith('$2a$'))


# ─── JWT ─────────────────────────────────────────────────────────────────────

SECRET_KEY = os.getenv('JWT_SECRET', 'numiviz-dev-secret-change-in-production')
ALGORITHM = os.getenv('JWT_ALGORITHM', 'HS256')
ACCESS_TOKEN_EXPIRE_DAYS = int(os.getenv('JWT_EXPIRATION_DAYS', '7'))


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta else timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    """Decode and verify a JWT token. Returns payload dict or None."""
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None
