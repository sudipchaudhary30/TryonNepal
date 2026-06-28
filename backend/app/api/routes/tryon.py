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
from app.api.routes.garments import get_garment_by_id

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

    # Get garment
    garment_item = get_garment_by_id(garment_id)
    # The imageUrl is like "/uploads/xxx.png" or "/clothes/xxx.png"
    # We need the absolute path on the disk
    # Assuming frontend/public is the root for /clothes and backend/uploads for /uploads
    image_url = garment_item.imageUrl
    
    if image_url.startswith('/uploads/'):
        garment_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'uploads', image_url.replace('/uploads/', ''))
    else:
        # Fallback to frontend public clothes
        garment_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', 'frontend', 'public', image_url.lstrip('/'))

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
