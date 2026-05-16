"""
checker.py
Validates an uploaded file and classifies it as 'image' or 'video'.
Raises HTTP 400 for unsupported formats.
"""

import mimetypes
from pathlib import Path
from fastapi import HTTPException

# ── Allowed extensions / MIME types ─────────────────────────────────────────

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".webp"}
VIDEO_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv", ".webm", ".flv", ".wmv"}

IMAGE_MIMES = {
    "image/jpeg", "image/png", "image/bmp",
    "image/tiff", "image/webp",
}
VIDEO_MIMES = {
    "video/mp4", "video/x-msvideo", "video/quicktime",
    "video/x-matroska", "video/webm", "video/x-flv",
    "video/x-ms-wmv",
}


def detect_file_type(filename: str, content_type: str | None = None) -> str:
    """
    Return 'image' or 'video'.

    Detection order:
    1. File extension (fast, reliable for well-named files)
    2. MIME type reported by the client (fallback)

    Raises HTTPException(400) if the file is neither image nor video.
    """
    ext = Path(filename).suffix.lower()

    if ext in IMAGE_EXTENSIONS:
        return "image"
    if ext in VIDEO_EXTENSIONS:
        return "video"

    # Fall back to MIME type
    mime = (content_type or "").lower().split(";")[0].strip()
    if not mime:
        # Let Python's stdlib guess
        guessed, _ = mimetypes.guess_type(filename)
        mime = guessed or ""

    if mime in IMAGE_MIMES:
        return "image"
    if mime in VIDEO_MIMES:
        return "video"

    raise HTTPException(
        status_code=400,
        detail=(
            f"Unsupported file format: '{ext or mime}'. "
            f"Allowed images: {sorted(IMAGE_EXTENSIONS)}. "
            f"Allowed videos: {sorted(VIDEO_EXTENSIONS)}."
        ),
    )


def validate_file_size(file_bytes: bytes, max_mb: int = 100) -> None:
    """Raise HTTP 413 if the file exceeds max_mb megabytes."""
    size_mb = len(file_bytes) / (1024 * 1024)
    if size_mb > max_mb:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({size_mb:.1f} MB). Maximum allowed: {max_mb} MB.",
        )