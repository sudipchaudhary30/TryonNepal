from __future__ import annotations

import os
import shutil
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel

router = APIRouter(prefix='/garments', tags=['garments'])

CATALOG_TIMESTAMP = datetime.now(timezone.utc).isoformat()

ALLOWED_IMAGE_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.webp'}
ALLOWED_MODEL_EXTENSIONS = {'.glb', '.gltf'}


class GarmentItem(BaseModel):
    id: str
    userId: str
    name: str
    category: str
    imageUrl: str
    thumbnailUrl: str
    modelUrl: str | None = None      # Path to .glb 3D model (optional)
    fileType: str = '2D'             # '2D' or '3D'
    isCustomDesign: bool
    designData: dict[str, object] | None
    brand: str | None
    price: float | None
    uploadedBy: str = 'Community'    # Display name of uploader
    createdAt: str
    updatedAt: str


# In-memory store — all uploads land here and are visible to everyone
COMMUNITY_GARMENTS: list[GarmentItem] = [
    GarmentItem(
        id='demo-himalayan-kurta',
        userId='sample-user',
        name='Himalayan Kurta',
        category='TRADITIONAL',
        imageUrl='/clothes/himalayan_kurta.png',
        thumbnailUrl='/clothes/himalayan_kurta.png',
        modelUrl=None,
        fileType='2D',
        isCustomDesign=False,
        designData=None,
        brand='AR TryOn Nepal',
        price=2499,
        uploadedBy='Heritage Collection',
        createdAt=CATALOG_TIMESTAMP,
        updatedAt=CATALOG_TIMESTAMP,
    ),
    GarmentItem(
        id='demo-daura-suruwal',
        userId='sample-user',
        name='Daura Suruwal Heritage',
        category='TRADITIONAL',
        imageUrl='/clothes/daura_suruwal.png',
        thumbnailUrl='/clothes/daura_suruwal.png',
        modelUrl=None,
        fileType='2D',
        isCustomDesign=False,
        designData=None,
        brand='AR TryOn Nepal',
        price=4299,
        uploadedBy='Nepal Culture',
        createdAt=CATALOG_TIMESTAMP,
        updatedAt=CATALOG_TIMESTAMP,
    ),
    GarmentItem(
        id='demo-sherwani',
        userId='sample-user',
        name='Kathmandu Sherwani Elite',
        category='TRADITIONAL',
        imageUrl='/clothes/sherwani.png',
        thumbnailUrl='/clothes/sherwani.png',
        modelUrl=None,
        fileType='2D',
        isCustomDesign=False,
        designData=None,
        brand='AR TryOn Nepal',
        price=6899,
        uploadedBy='Royal Studio',
        createdAt=CATALOG_TIMESTAMP,
        updatedAt=CATALOG_TIMESTAMP,
    ),
    GarmentItem(
        id='demo-dhaka-set',
        userId='sample-user',
        name='Dhaka Festival Ensemble',
        category='DRESS',
        imageUrl='/clothes/dhaka_set.png',
        thumbnailUrl='/clothes/dhaka_set.png',
        modelUrl=None,
        fileType='2D',
        isCustomDesign=False,
        designData=None,
        brand='AR TryOn Nepal',
        price=5199,
        uploadedBy='Festival Fashion',
        createdAt=CATALOG_TIMESTAMP,
        updatedAt=CATALOG_TIMESTAMP,
    ),
    GarmentItem(
        id='demo-oxford-shirt',
        userId='sample-user',
        name='Midnight Oxford Shirt',
        category='TOP',
        imageUrl='/clothes/oxford_shirt.png',
        thumbnailUrl='/clothes/oxford_shirt.png',
        modelUrl=None,
        fileType='2D',
        isCustomDesign=False,
        designData=None,
        brand='AR TryOn Nepal',
        price=2199,
        uploadedBy='Modern Wear',
        createdAt=CATALOG_TIMESTAMP,
        updatedAt=CATALOG_TIMESTAMP,
    ),
    GarmentItem(
        id='demo-field-jacket',
        userId='sample-user',
        name='Peakline Field Jacket',
        category='OUTERWEAR',
        imageUrl='/clothes/field_jacket.png',
        thumbnailUrl='/clothes/field_jacket.png',
        modelUrl=None,
        fileType='2D',
        isCustomDesign=False,
        designData=None,
        brand='AR TryOn Nepal',
        price=5899,
        uploadedBy='Peakline',
        createdAt=CATALOG_TIMESTAMP,
        updatedAt=CATALOG_TIMESTAMP,
    ),
]


def _get_uploads_dir() -> str:
    uploads_dir = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'uploads')
    os.makedirs(uploads_dir, exist_ok=True)
    return uploads_dir


def serialize_garments() -> list[dict[str, object]]:
    return [garment.model_dump() for garment in COMMUNITY_GARMENTS]


def get_garment_by_id(garment_id: str) -> GarmentItem:
    garment = next((item for item in COMMUNITY_GARMENTS if item.id == garment_id), None)
    if garment is None:
        raise HTTPException(status_code=404, detail='Garment not found')
    return garment


@router.get('/')
def list_garments() -> dict[str, list[dict[str, object]]]:
    """Return all community garments (newest first)."""
    return {'items': list(reversed(serialize_garments()))}


@router.get('/{garment_id}')
def garment_detail(garment_id: str) -> dict[str, object]:
    return get_garment_by_id(garment_id).model_dump()


@router.post('/')
async def upload_2d_garment(
    image: UploadFile = File(...),
    name: str = Form(...),
    category: str = Form(...),
    uploadedBy: str = Form(default='Anonymous'),
    brand: str = Form(default=''),
    price: str = Form(default=''),
) -> dict[str, object]:
    """Upload a 2D clothing image (PNG/JPG/WEBP)."""
    uploads_dir = _get_uploads_dir()

    ext = os.path.splitext(image.filename or '')[1].lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f'Invalid file type. Allowed: {ALLOWED_IMAGE_EXTENSIONS}')

    new_filename = f"{uuid4()}{ext}"
    file_path = os.path.join(uploads_dir, new_filename)

    with open(file_path, 'wb') as buffer:
        shutil.copyfileobj(image.file, buffer)

    image_url = f'/uploads/{new_filename}'

    new_garment = GarmentItem(
        id=f'garment-2d-{uuid4()}',
        userId='community-user',
        name=name,
        category=category.upper(),
        imageUrl=image_url,
        thumbnailUrl=image_url,
        modelUrl=None,
        fileType='2D',
        isCustomDesign=True,
        designData=None,
        brand=brand or None,
        price=float(price) if price else None,
        uploadedBy=uploadedBy or 'Anonymous',
        createdAt=datetime.now(timezone.utc).isoformat(),
        updatedAt=datetime.now(timezone.utc).isoformat(),
    )

    COMMUNITY_GARMENTS.append(new_garment)
    return new_garment.model_dump()


@router.post('/upload-3d')
async def upload_3d_garment(
    model: UploadFile = File(...),
    image: UploadFile = File(...),
    name: str = Form(...),
    category: str = Form(...),
    uploadedBy: str = Form(default='Anonymous'),
    brand: str = Form(default=''),
    price: str = Form(default=''),
) -> dict[str, object]:
    """Upload a 3D clothing model (.glb) with a preview image thumbnail."""
    uploads_dir = _get_uploads_dir()

    # Validate 3D model file
    model_ext = os.path.splitext(model.filename or '')[1].lower()
    if model_ext not in ALLOWED_MODEL_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f'Invalid model type. Allowed: {ALLOWED_MODEL_EXTENSIONS}')

    # Validate thumbnail image
    img_ext = os.path.splitext(image.filename or '')[1].lower()
    if img_ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f'Invalid thumbnail type. Allowed: {ALLOWED_IMAGE_EXTENSIONS}')

    # Save model file
    model_filename = f"{uuid4()}{model_ext}"
    model_path = os.path.join(uploads_dir, model_filename)
    with open(model_path, 'wb') as buffer:
        shutil.copyfileobj(model.file, buffer)

    # Save thumbnail
    img_filename = f"{uuid4()}{img_ext}"
    img_path = os.path.join(uploads_dir, img_filename)
    with open(img_path, 'wb') as buffer:
        shutil.copyfileobj(image.file, buffer)

    model_url = f'/uploads/{model_filename}'
    image_url = f'/uploads/{img_filename}'

    new_garment = GarmentItem(
        id=f'garment-3d-{uuid4()}',
        userId='community-user',
        name=name,
        category=category.upper(),
        imageUrl=image_url,
        thumbnailUrl=image_url,
        modelUrl=model_url,
        fileType='3D',
        isCustomDesign=True,
        designData=None,
        brand=brand or None,
        price=float(price) if price else None,
        uploadedBy=uploadedBy or 'Anonymous',
        createdAt=datetime.now(timezone.utc).isoformat(),
        updatedAt=datetime.now(timezone.utc).isoformat(),
    )

    COMMUNITY_GARMENTS.append(new_garment)
    return new_garment.model_dump()


@router.delete('/{garment_id}')
def delete_garment(garment_id: str) -> dict[str, str]:
    """Remove a garment from the community store."""
    global COMMUNITY_GARMENTS
    original_len = len(COMMUNITY_GARMENTS)
    COMMUNITY_GARMENTS = [g for g in COMMUNITY_GARMENTS if g.id != garment_id]
    if len(COMMUNITY_GARMENTS) == original_len:
        raise HTTPException(status_code=404, detail='Garment not found')
    return {'status': 'deleted', 'id': garment_id}
