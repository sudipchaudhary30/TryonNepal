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
    model_url: Optional[str] = None  # 3D model URL (.glb)
    file_type: str = "2D"  # '2D' or '3D'
    is_custom_design: bool = False
    design_data: Optional[dict[str, object]] = None
    brand: Optional[str] = None
    price: Optional[float] = None
    uploaded_by: str = "Anonymous"  # Display name of uploader
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = 'garments'
        protected_namespaces = ()  # Disable Pydantic namespace protection for 'model_url'

    def __repr__(self) -> str:
        return f"Garment(id={self.id!r}, name={self.name!r}, category={self.category.value!r})"

    def to_dict(self) -> dict[str, object]:
        """Convert to API response format."""
        return {
            'id': str(self.id),
            'userId': self.user_id,
            'name': self.name,
            'category': self.category.value,
            'imageUrl': self.image_url,
            'thumbnailUrl': self.thumbnail_url,
            'modelUrl': self.model_url,
            'fileType': self.file_type,
            'isCustomDesign': self.is_custom_design,
            'designData': self.design_data,
            'brand': self.brand,
            'price': self.price,
            'uploadedBy': self.uploaded_by,
            'createdAt': self.created_at.isoformat(),
            'updatedAt': self.updated_at.isoformat(),
        }
