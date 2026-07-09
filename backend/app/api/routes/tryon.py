from __future__ import annotations

import os
import time
import numpy as np
from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from uuid import uuid4

try:
    import cv2
except Exception:
    cv2 = None

from app.core.tryon_engine import TryOnEngine
from app.api.routes.garments import get_garment_by_id, resolve_garment_asset_path

router = APIRouter(prefix='/tryon', tags=['tryon'])


@router.get('/health')
def health() -> dict[str, str]:
    return {'status': 'ok', 'service': 'tryon'}


@router.post('/')
async def run_tryon(
    person_image: UploadFile = File(...),
    garment_id: str = Form(...),
    garment_type: str = Form(...)
) -> dict[str, object]:
    if cv2 is None:
        raise HTTPException(status_code=500, detail='cv2 is not installed or available.')

    start_time = time.time()
    
    # Read person image
    person_bytes = await person_image.read()
    person_np = np.frombuffer(person_bytes, np.uint8)
    person_img = cv2.imdecode(person_np, cv2.IMREAD_COLOR)

    # Get garment from MongoDB
    garment_item = await get_garment_by_id(garment_id)
    image_url = garment_item.image_url
    
    garment_path = resolve_garment_asset_path(image_url)
    if not garment_path:
        raise HTTPException(status_code=404, detail='Garment image URL is missing.')

    if not os.path.exists(garment_path):
        raise HTTPException(status_code=404, detail=f'Garment image not found on disk at {garment_path}')

    garment_img = cv2.imread(garment_path, cv2.IMREAD_UNCHANGED)
    if garment_img is None:
        raise HTTPException(status_code=500, detail='Failed to load garment image.')

    # Run inference
    engine = TryOnEngine.get_instance()
    result_img = engine.run_inference(person_img, garment_img, garment_type)

    # Save result
    uploads_dir = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'uploads')
    os.makedirs(uploads_dir, exist_ok=True)
    new_filename = f"tryon_result_{uuid4()}.jpg"
    result_path = os.path.join(uploads_dir, new_filename)
    
    cv2.imwrite(result_path, result_img)
    
    processing_time_ms = int((time.time() - start_time) * 1000)
    
    return {
        'resultImageUrl': f"/uploads/{new_filename}",
        'processingTimeMs': processing_time_ms
    }
