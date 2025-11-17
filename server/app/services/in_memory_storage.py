"""
Simple in-memory storage for transient binary blobs (images, visualizations).

This module provides a process-local, thread-safe store with optional TTL-based
expiry. It is intended for development/local use and not for production.
"""

from __future__ import annotations

import threading
import time
from dataclasses import dataclass
from typing import Dict, Optional, Tuple


@dataclass
class _Entry:
    data: bytes
    content_type: Optional[str]
    expires_at: Optional[float]  # epoch seconds


class InMemoryStorage:
    """A singleton in-memory key-value store for binary data with TTL support."""

    _instance: "InMemoryStorage" | None = None
    _lock = threading.RLock()

    def __init__(self) -> None:
        self._data: Dict[str, _Entry] = {}
        self._gc_interval_seconds: int = 60
        self._last_gc: float = 0.0

    @classmethod
    def instance(cls) -> "InMemoryStorage":
        with cls._lock:
            if cls._instance is None:
                cls._instance = InMemoryStorage()
            return cls._instance

    def put(self, key: str, data: bytes, content_type: Optional[str] = None, ttl_seconds: Optional[int] = None) -> None:
        expires_at = time.time() + ttl_seconds if ttl_seconds and ttl_seconds > 0 else None
        with self._lock:
            self._data[key] = _Entry(data=data, content_type=content_type, expires_at=expires_at)
            self._maybe_gc()

    def get(self, key: str) -> Optional[Tuple[bytes, Optional[str]]]:
        with self._lock:
            entry = self._data.get(key)
            if entry is None:
                return None
            if entry.expires_at is not None and entry.expires_at < time.time():
                # expired
                del self._data[key]
                return None
            return entry.data, entry.content_type

    def delete(self, key: str) -> None:
        with self._lock:
            if key in self._data:
                del self._data[key]

    def delete_prefix(self, prefix: str) -> int:
        with self._lock:
            keys = [k for k in self._data.keys() if k.startswith(prefix)]
            for k in keys:
                del self._data[k]
            return len(keys)

    def exists(self, key: str) -> bool:
        with self._lock:
            entry = self._data.get(key)
            if entry is None:
                return False
            if entry.expires_at is not None and entry.expires_at < time.time():
                del self._data[key]
                return False
            return True

    def _maybe_gc(self) -> None:
        now = time.time()
        if now - self._last_gc < self._gc_interval_seconds:
            return
        expired = []
        for key, entry in list(self._data.items()):
            if entry.expires_at is not None and entry.expires_at < now:
                expired.append(key)
        for key in expired:
            del self._data[key]
        self._last_gc = now


# Convenience functions
store = InMemoryStorage.instance()

def make_mem_image_key(batch_id: str, filename: str) -> str:
    return f"mem://{batch_id}/{filename}"

def make_mem_vis_key(analysis_id: str, viz_type: str) -> str:
    return f"memvis://{analysis_id}/{viz_type}.jpg"


