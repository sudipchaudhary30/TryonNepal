from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from beanie import Document, Indexed
from pydantic import Field


class Outfit(Document):
    user_id: Indexed(str)
    name: str
    preview_image_url: Optional[str] = None
    garment_ids: list[str] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = 'outfits'

    def __repr__(self) -> str:
        return f"Outfit(id={self.id!r}, name={self.name!r})"
