from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from beanie import Document, Indexed
from pydantic import Field


class User(Document):
    email: Indexed(str, unique=True)
    name: str
    avatar_url: Optional[str] = None
    age: Optional[int] = None
    height_cm: Optional[float] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = 'users'

    def __repr__(self) -> str:
        return f"User(id={self.id!r}, email={self.email!r})"
