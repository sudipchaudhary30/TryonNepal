from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.garment import GarmentCategory


class GarmentBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str = Field(min_length=1, examples=['Kurta Set'])
    category: GarmentCategory = Field(examples=[GarmentCategory.TOP])
    brand: str | None = Field(default=None, examples=['Sherpa Tailors'])



class GarmentCreate(GarmentBase):
    image_url: str = Field(examples=['https://cdn.example.com/garments/1.jpg'])
    thumbnail_url: str = Field(examples=['https://cdn.example.com/garments/1-thumb.jpg'])
    is_custom_design: bool = Field(default=False)
    design_data: dict[str, object] | None = None


class GarmentUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str | None = Field(default=None, min_length=1)
    category: GarmentCategory | None = None
    brand: str | None = None

    design_data: dict[str, object] | None = None


class GarmentResponse(GarmentCreate):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime


class GarmentListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total: int
    page: int
    page_size: int
    items: list[GarmentResponse]
