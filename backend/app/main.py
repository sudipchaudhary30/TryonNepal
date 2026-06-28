from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import datetime, timezone
from uuid import uuid4

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from app.api.routes.designs import router as designs_router
from app.api.routes.garments import get_garment_by_id, router as garments_router, serialize_garments
from app.api.routes.tryon import router as tryon_router
from app.api.routes.users import router as users_router
from app.config import get_settings
from app.core.tryon_engine import TryOnEngine, load_engine_on_startup
from app.database import connect_db, close_db
from app.utils.logger import logger

settings = get_settings()
_model_loaded = False
_device = 'cpu'
_tryon_sessions: list[dict[str, object]] = []
_feedback_entries: list[dict[str, object]] = []


class TryOnSessionCreate(BaseModel):
    garmentId: str | None = None
    deviceType: str = Field(default='mobile')
    source: str = Field(default='browser')


class FeedbackCreate(BaseModel):
    sessionId: str
    garmentId: str | None = None
    rating: int = Field(ge=1, le=5)
    comment: str | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _model_loaded, _device
    # Connect to MongoDB
    await connect_db()
    await load_engine_on_startup()
    engine = TryOnEngine.get_instance()
    _device = engine.device
    _model_loaded = engine.is_ready
    logger.info('Starting AR TryOn Nepal backend on %s', _device)
    yield
    # Close MongoDB connection
    await close_db()
    logger.info('Stopping AR TryOn Nepal backend')


app = FastAPI(
    title='AR Tryon Nepal API',
    description='Backend API for AR Tryon Nepal virtual try-on platform.',
    version='0.1.0',
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(tryon_router, prefix='/api')
app.include_router(garments_router, prefix='/api')
app.include_router(users_router, prefix='/api')
app.include_router(designs_router, prefix='/api')

uploads_dir = os.path.join(os.path.dirname(__file__), '..', 'uploads')
os.makedirs(uploads_dir, exist_ok=True)
app.mount('/uploads', StaticFiles(directory=uploads_dir), name='uploads')


@app.get('/garments')
def public_garments() -> dict[str, list[dict[str, object]]]:
    return {'items': serialize_garments()}


@app.get('/garments/{garment_id}')
def public_garment_detail(garment_id: str) -> dict[str, object]:
    return get_garment_by_id(garment_id).model_dump()


@app.post('/session')
def create_session(payload: TryOnSessionCreate) -> dict[str, object]:
    garment_id = payload.garmentId
    if garment_id is not None:
        try:
            get_garment_by_id(garment_id)
        except HTTPException:
            raise

    session_id = str(uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    session_record = {
        'sessionId': session_id,
        'garmentId': garment_id,
        'deviceType': payload.deviceType,
        'source': payload.source,
        'createdAt': created_at,
    }
    _tryon_sessions.append(session_record)
    return {'sessionId': session_id, 'status': 'created', 'createdAt': created_at}


@app.post('/feedback')
def submit_feedback(payload: FeedbackCreate) -> dict[str, object]:
    created_at = datetime.now(timezone.utc).isoformat()
    feedback_record = {
        'sessionId': payload.sessionId,
        'garmentId': payload.garmentId,
        'rating': payload.rating,
        'comment': payload.comment,
        'createdAt': created_at,
    }
    _feedback_entries.append(feedback_record)
    return {'status': 'saved', 'feedbackCount': len(_feedback_entries), 'createdAt': created_at}


@app.get('/health')
def health() -> dict[str, object]:
    return {
        'status': 'ok',
        'model_loaded': _model_loaded,
        'device': _device,
        'version': app.version,
    }


@app.get('/')
def root() -> RedirectResponse:
    return RedirectResponse(url='/docs')
