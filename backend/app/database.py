from __future__ import annotations

from motor.motor_asyncio import AsyncIOMotorClient

from beanie import init_beanie

from app.config import get_settings
from app.utils.logger import logger

_client: AsyncIOMotorClient | None = None


async def connect_db() -> None:
    """Initialise Motor client and Beanie ODM."""
    global _client
    settings = get_settings()

    _client = AsyncIOMotorClient(settings.mongodb_url)
    db = _client[settings.mongodb_db_name]

    # Import document models here to avoid circular imports
    from app.models.garment import Garment
    from app.models.outfit import Outfit
    from app.models.tryon_session import TryOnSession
    from app.models.user import User

    try:
        await init_beanie(database=db, document_models=[User, Garment, Outfit, TryOnSession])
        logger.info(
            'Connected to MongoDB at %s, database: %s',
            settings.mongodb_url,
            settings.mongodb_db_name,
        )
    except Exception as exc:
        logger.warning('MongoDB not reachable (%s). Backend running in fallback mode.', exc)


async def close_db() -> None:
    """Close Motor client."""
    global _client
    if _client is not None:
        _client.close()
        _client = None
        logger.info('Closed MongoDB connection')


def get_client() -> AsyncIOMotorClient | None:
    """Return the current Motor client (or None if not connected)."""
    return _client
