from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from beanie import Document, Indexed
from pydantic import Field


class TryOnSession(Document):
    user_id: Indexed(str)
    garment_id: Indexed(str)
    result_image_url: Optional[str] = None
    processing_time_ms: Optional[int] = None
    device_info: Optional[str] = None
    feedback: Optional[int] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = 'try_on_sessions'

    def __repr__(self) -> str:
        return f"TryOnSession(id={self.id!r}, user_id={self.user_id!r}, garment_id={self.garment_id!r})"
