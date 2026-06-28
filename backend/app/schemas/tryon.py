from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field, field_validator


class TryOnRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    garment_type: str = Field(examples=['upper_body'])


class TryOnResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    result_image: str = Field(examples=['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...'])
    processing_time_ms: int = Field(ge=0, examples=[142])
    success: bool = Field(default=True)


class TryOnFeedback(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    session_id: str = Field(examples=['ckx123example'])
    rating: int = Field(ge=1, le=5, examples=[5])

    @field_validator('rating')
    @classmethod
    def validate_rating(cls, value: int) -> int:
        if value < 1 or value > 5:
            raise ValueError('rating must be between 1 and 5')
        return value
