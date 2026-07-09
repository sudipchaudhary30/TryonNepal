from __future__ import annotations

import os
import shutil
import traceback
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Request
from fastapi.responses import JSONResponse

from app.models.garment import Garment, GarmentCategory
from app.utils.logger import logger

router = APIRouter(prefix='/garments', tags=['garments'])

ALLOWED_IMAGE_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.webp'}
ALLOWED_MODEL_EXTENSIONS = {'.glb', '.gltf'}

# Demo garments to seed on startup
DEMO_GARMENTS_DATA = [
    {
        'name': 'Himalayan Kurta',
        'category': GarmentCategory.TRADITIONAL,
        'image_url': '/clothes/himalayan_kurta.png',
        'thumbnail_url': '/clothes/himalayan_kurta.png',
        'brand': 'AR TryOn Nepal',
        'price': 2499,
        'uploaded_by': 'Heritage Collection',
    },
    {
        'name': 'Daura Suruwal Heritage',
        'category': GarmentCategory.TRADITIONAL,
        'image_url': '/clothes/daura_suruwal.png',
        'thumbnail_url': '/clothes/daura_suruwal.png',
        'brand': 'AR TryOn Nepal',
        'price': 4299,
        'uploaded_by': 'Nepal Culture',
    },
    {
        'name': 'Kathmandu Sherwani Elite',
        'category': GarmentCategory.TRADITIONAL,
        'image_url': '/clothes/sherwani.png',
        'thumbnail_url': '/clothes/sherwani.png',
        'brand': 'AR TryOn Nepal',
        'price': 6899,
        'uploaded_by': 'Royal Studio',
    },
    {
        'name': 'Dhaka Festival Ensemble',
        'category': GarmentCategory.DRESS,
        'image_url': '/clothes/dhaka_set.png',
        'thumbnail_url': '/clothes/dhaka_set.png',
        'brand': 'AR TryOn Nepal',
        'price': 5199,
        'uploaded_by': 'Festival Fashion',
    },
    {
        'name': 'Midnight Oxford Shirt',
        'category': GarmentCategory.TOP,
        'image_url': '/clothes/oxford_shirt.png',
        'thumbnail_url': '/clothes/oxford_shirt.png',
        'brand': 'AR TryOn Nepal',
        'price': 2199,
        'uploaded_by': 'Modern Wear',
    },
    {
        'name': 'Peakline Field Jacket',
        'category': GarmentCategory.OUTERWEAR,
        'image_url': '/clothes/field_jacket.png',
        'thumbnail_url': '/clothes/field_jacket.png',
        'brand': 'AR TryOn Nepal',
        'price': 5899,
        'uploaded_by': 'Peakline',
    },
]


def _get_uploads_dir() -> str:
    uploads_dir = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'uploads')
    os.makedirs(uploads_dir, exist_ok=True)
    return uploads_dir


async def seed_demo_garments() -> None:
    """Seed demo garments into MongoDB on startup (only if empty)."""
    try:
        # Check if garments already exist
        existing = await Garment.find_many(limit=1).to_list()
        if len(existing) > 0:
            logger.info('Garment catalog already populated')
            return

        logger.info('Seeding demo garments into MongoDB...')
        for item in DEMO_GARMENTS_DATA:
            garment = Garment(
                user_id='demo-user',
                name=item['name'],
                category=item['category'],
                image_url=item['image_url'],
                thumbnail_url=item['thumbnail_url'],
                brand=item.get('brand'),
                price=item.get('price'),
                uploaded_by=item.get('uploaded_by', 'Anonymous'),
                is_custom_design=False,
            )
            await garment.insert()
        
        logger.info('Seeded %d demo garments', len(DEMO_GARMENTS_DATA))
    except Exception as e:
        logger.warning('Failed to seed demo garments: %s | Traceback: %s', e, traceback.format_exc())


async def get_garment_by_id(garment_id: str) -> Garment:
    """Fetch garment by MongoDB object ID."""
    from bson import ObjectId
    try:
        garment = await Garment.get(ObjectId(garment_id))
        if garment is None:
            raise HTTPException(status_code=404, detail='Garment not found')
        return garment
    except Exception:
        raise HTTPException(status_code=404, detail='Garment not found')


@router.get('/')
async def list_garments() -> dict[str, list[dict[str, object]]]:
    """Return all garments from MongoDB (newest first) or demo data if unavailable."""
    try:
        garments = await Garment.find_many().sort('created_at', -1).to_list()
        return {'items': [garment.to_dict() for garment in garments]}
    except Exception as e:
        logger.error('Error fetching garments: %s | Traceback: %s', e, traceback.format_exc())
        # Fallback to demo garments if MongoDB fails
        demo_items = [
            {
                'id': str(i),
                'name': item['name'],
                'category': item['category'],
                'imageUrl': item['image_url'],
                'thumbnailUrl': item['thumbnail_url'],
                'brand': item.get('brand'),
                'price': item.get('price'),
                'uploadedBy': item.get('uploaded_by', 'Anonymous'),
                'isCustomDesign': False,
                'userId': 'demo-user',
            }
            for i, item in enumerate(DEMO_GARMENTS_DATA)
        ]
        return {'items': demo_items}


@router.get('/{garment_id}')
async def garment_detail(garment_id: str) -> dict[str, object]:
    """Get a single garment by ID."""
    try:
        garment = await get_garment_by_id(garment_id)
        return garment.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        logger.error('Error fetching garment %s: %s', garment_id, e)
        raise HTTPException(status_code=404, detail='Garment not found')


@router.post('/')
async def upload_2d_garment(
    request: Request,
    image: UploadFile = File(...),
    name: str = Form(...),
    category: str = Form(...),
    uploadedBy: str = Form(default='Anonymous'),
    brand: str = Form(default=''),
    price: str = Form(default=''),
) -> dict[str, object]:
    """Upload a 2D clothing image (PNG/JPG/WEBP)."""
    try:
        uploads_dir = _get_uploads_dir()

        ext = os.path.splitext(image.filename or '')[1].lower()
        if ext not in ALLOWED_IMAGE_EXTENSIONS:
            raise HTTPException(status_code=400, detail=f'Invalid file type. Allowed: {ALLOWED_IMAGE_EXTENSIONS}')

        new_filename = f"{uuid4()}{ext}"
        file_path = os.path.join(uploads_dir, new_filename)

        with open(file_path, 'wb') as buffer:
            shutil.copyfileobj(image.file, buffer)

        image_url = f'/uploads/{new_filename}'
        
        # Get userId from request (from auth header if available, otherwise use user-specific ID)
        user_id = getattr(request.state, 'user_id', None) or f'anon-{uuid4()}'

        # Create and insert into MongoDB
        new_garment = Garment(
            user_id=user_id,
            name=name,
            category=GarmentCategory(category.upper()),
            image_url=image_url,
            thumbnail_url=image_url,
            model_url=None,
            file_type='2D',
            is_custom_design=True,
            brand=brand or None,
            price=float(price) if price else None,
            uploaded_by=uploadedBy or 'Anonymous',
        )
        
        await new_garment.insert()
        return new_garment.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        error_detail = f'{str(e)} | {traceback.format_exc()}'
        logger.error('Error uploading 2D garment: %s', error_detail)
        raise HTTPException(status_code=500, detail='Upload failed. Check server logs.')


@router.post('/upload-3d')
async def upload_3d_garment(
    request: Request,
    model: UploadFile = File(...),
    image: UploadFile = File(...),
    name: str = Form(...),
    category: str = Form(...),
    uploadedBy: str = Form(default='Anonymous'),
    brand: str = Form(default=''),
    price: str = Form(default=''),
) -> dict[str, object]:
    """Upload a 3D clothing model (.glb) with a preview image thumbnail."""
    try:
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
        
        # Get userId from request (from auth header if available, otherwise use user-specific ID)
        user_id = getattr(request.state, 'user_id', None) or f'anon-{uuid4()}'

        # Create and insert into MongoDB
        new_garment = Garment(
            user_id=user_id,
            name=name,
            category=GarmentCategory(category.upper()),
            image_url=image_url,
            thumbnail_url=image_url,
            model_url=model_url,
            file_type='3D',
            is_custom_design=True,
            brand=brand or None,
            price=float(price) if price else None,
            uploaded_by=uploadedBy or 'Anonymous',
        )
        
        await new_garment.insert()
        return new_garment.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        error_detail = f'{str(e)} | {traceback.format_exc()}'
        logger.error('Error uploading 3D garment: %s', error_detail)
        raise HTTPException(status_code=500, detail='3D Upload failed. Check server logs.')


@router.delete('/{garment_id}')
async def delete_garment(garment_id: str) -> dict[str, str]:
    """Remove a garment from MongoDB."""
    try:
        garment = await get_garment_by_id(garment_id)
        await garment.delete()
        return {'status': 'deleted', 'id': garment_id}
    except HTTPException:
        raise
    except Exception as e:
        error_detail = f'{str(e)} | {traceback.format_exc()}'
        logger.error('Error deleting garment %s: %s', garment_id, error_detail)
        raise HTTPException(status_code=500, detail='Delete failed. Check server logs.')

