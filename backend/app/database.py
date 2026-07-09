from __future__ import annotations

from pymongo import MongoClient

from app.config import get_settings
from app.utils.logger import logger


async def connect_db() -> None:
    """Test MongoDB connection (PyMongo, no Beanie needed)."""
    settings = get_settings()

    try:
        # Test connection with PyMongo
        client = MongoClient(settings.mongodb_url, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        client.close()
        
        logger.info(
            'Connected to MongoDB at %s, database: %s',
            settings.mongodb_url,
            settings.mongodb_db_name,
        )
    except Exception as exc:
        logger.warning('MongoDB not reachable (%s). Using fallback mode.', exc)


async def close_db() -> None:
    """Close database connections."""
    logger.info('MongoDB connection cleanup')
