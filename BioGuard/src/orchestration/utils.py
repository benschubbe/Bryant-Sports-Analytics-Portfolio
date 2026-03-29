"""
BioGuardian Shared Utilities
==============================

Common functions used across the orchestration layer. Extracted from
repeated patterns in main.py, models.py, database.py, and auditor/engine.py
to eliminate duplication and ensure consistent behaviour.
"""

from __future__ import annotations

import hashlib
import json
import logging
from datetime import datetime, timezone
from typing import Any

logger = logging.getLogger("BioGuardian")


def utcnow() -> datetime:
    """Return the current UTC time as a timezone-aware datetime."""
    return datetime.now(tz=timezone.utc)


def utcnow_iso() -> str:
    """Return the current UTC time as an ISO-8601 string."""
    return datetime.now(tz=timezone.utc).isoformat()


def sha256_json(data: Any) -> str:
    """Compute SHA-256 hex digest of JSON-serializable data."""
    canonical = json.dumps(data, sort_keys=True, default=str)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def sha256_bytes(data: bytes) -> str:
    """Compute SHA-256 hex digest of raw bytes."""
    return hashlib.sha256(data).hexdigest()
