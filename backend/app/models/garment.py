from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from beanie import Document, Indexed
from pydantic import Field


class GarmentCategory(str, Enum):
    TOP = 'TOP'
    BOTTOM = 'BOTTOM'
    DRESS = 'DRESS'
    OUTERWEAR = 'OUTERWEAR'
    TRADITIONAL = 'TRADITIONAL'
    ACCESSORY = 'ACCESSORY'


class Garment(Document):
    user_id: Indexed(str)
    name: str
    category: GarmentCategory
    image_url: str
    thumbnail_url: str
    is_custom_design: bool = False
    design_data: Optional[dict[str, object]] = None
    brand: Optional[str] = None
    price: Optional[float] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = 'garments'

    def __repr__(self) -> str:
        return f"Garment(id={self.id!r}, name={self.name!r}, category={self.category.value!r})"
