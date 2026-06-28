from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    email: EmailStr = Field(examples=['user@example.com'])
    name: str = Field(min_length=1, examples=['Aarav'])
    avatar_url: str | None = Field(default=None, examples=['https://cdn.example.com/avatar.jpg'])
    age: int | None = Field(default=None, ge=1, le=120, examples=[24])
    height_cm: float | None = Field(default=None, ge=50, le=250, examples=[172.5])


class UserUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str | None = Field(default=None, min_length=1)
    avatar_url: str | None = None
    age: int | None = Field(default=None, ge=1, le=120)
    height_cm: float | None = Field(default=None, ge=50, le=250)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: EmailStr
    name: str
    avatar_url: str | None
    age: int | None
    height_cm: float | None
    created_at: datetime
    updated_at: datetime
