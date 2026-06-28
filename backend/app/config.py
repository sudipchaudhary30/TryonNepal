from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

    mongodb_url: str = Field(default='mongodb://127.0.0.1:27017', alias='MONGODB_URL')
    mongodb_db_name: str = Field(default='ar-tryon-nepal', alias='MONGODB_DB_NAME')
    supabase_url: str = Field(default='', alias='SUPABASE_URL')
    supabase_key: str = Field(default='', alias='SUPABASE_KEY')
    secret_key: str = Field(default='change-me', alias='SECRET_KEY')
    ai_model_path: str = Field(default='./ai_models/viton_hd/checkpoint.pth', alias='AI_MODEL_PATH')
    environment: str = Field(default='dev', alias='ENVIRONMENT')
    debug: bool = Field(default=True, alias='DEBUG')
    cors_origins: list[str] = Field(default_factory=lambda: ['http://localhost:5173'])


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
