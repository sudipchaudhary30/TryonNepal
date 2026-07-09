from __future__ import annotations

import os
import shutil
import traceback
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Request
from pymongo import MongoClient
from bson import ObjectId

from app.config import get_settings
from app.utils.logger import logger

router = APIRouter(prefix='/garments', tags=['garments'])

ALLOWED_IMAGE_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.webp'}
ALLOWED_MODEL_EXTENSIONS = {'.glb', '.gltf'}

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
CLOTHES_ASSET_DIR = os.path.join(PROJECT_ROOT, 'frontend', 'public', 'clothes')
CLOTHES_UPLOADS_DIR = os.path.join(CLOTHES_ASSET_DIR, 'uploads')
FALLBACK_GARMENTS: list[dict[str, object]] = []


def get_garment_asset_dir() -> str:
    """Return the shared directory where garment images/models should be stored."""
    os.makedirs(CLOTHES_UPLOADS_DIR, exist_ok=True)
    return CLOTHES_UPLOADS_DIR


def get_garment_asset_url(filename: str) -> str:
    """Return the public URL used by the frontend for uploaded garment assets."""
    return f'/clothes/uploads/{filename}'


def resolve_garment_asset_path(asset_url: str | None) -> str | None:
    """Resolve a garment asset URL to a filesystem path under the public clothes directory."""
    if not asset_url:
        return None

    normalized = asset_url.strip()
    if normalized.startswith('/clothes/'):
        relative_path = normalized.lstrip('/')
        return os.path.join(PROJECT_ROOT, 'frontend', 'public', relative_path)

    if normalized.startswith('/uploads/'):
        legacy_path = normalized.lstrip('/')
        return os.path.join(PROJECT_ROOT, legacy_path)

    return os.path.join(PROJECT_ROOT, 'frontend', 'public', normalized.lstrip('/'))


# Demo garments to seed on startup
DEMO_GARMENTS_DATA = [
    {
        'name': 'Himalayan Kurta',
        'category': 'TRADITIONAL',
        'image_url': '/clothes/himalayan_kurta.png',
        'thumbnail_url': '/clothes/himalayan_kurta.png',
        'brand': 'AR TryOn Nepal',
        'price': 2499,
        'uploaded_by': 'Heritage Collection',
    },
    {
        'name': 'Daura Suruwal Heritage',
        'category': 'TRADITIONAL',
        'image_url': '/clothes/daura_suruwal.png',
        'thumbnail_url': '/clothes/daura_suruwal.png',
        'brand': 'AR TryOn Nepal',
        'price': 4299,
        'uploaded_by': 'Nepal Culture',
    },
    {
        'name': 'Kathmandu Sherwani Elite',
        'category': 'TRADITIONAL',
        'image_url': '/clothes/sherwani.png',
        'thumbnail_url': '/clothes/sherwani.png',
        'brand': 'AR TryOn Nepal',
        'price': 6899,
        'uploaded_by': 'Royal Studio',
    },
    {
        'name': 'Dhaka Festival Ensemble',
        'category': 'DRESS',
        'image_url': '/clothes/dhaka_set.png',
        'thumbnail_url': '/clothes/dhaka_set.png',
        'brand': 'AR TryOn Nepal',
        'price': 5199,
        'uploaded_by': 'Festival Fashion',
    },
    {
        'name': 'Midnight Oxford Shirt',
        'category': 'TOP',
        'image_url': '/clothes/oxford_shirt.png',
        'thumbnail_url': '/clothes/oxford_shirt.png',
        'brand': 'AR TryOn Nepal',
        'price': 2199,
        'uploaded_by': 'Modern Wear',
    },
    {
        'name': 'Peakline Field Jacket',
        'category': 'OUTERWEAR',
        'image_url': '/clothes/field_jacket.png',
        'thumbnail_url': '/clothes/field_jacket.png',
        'brand': 'AR TryOn Nepal',
        'price': 5899,
        'uploaded_by': 'Peakline',
    },
]


def _get_uploads_dir() -> str:
    return get_garment_asset_dir()


def _get_garments_collection():
    """Get MongoDB garments collection using PyMongo."""
    try:
        settings = get_settings()
        client = MongoClient(settings.mongodb_url)
        db = client[settings.mongodb_db_name]
        return db['garments']
    except Exception as e:
        logger.error('Failed to get garments collection: %s', e)
        return None


def _garment_to_dict(garment: dict) -> dict[str, object]:
    """Convert a garment document to the API response format."""
    garment_id = garment.get('_id') or garment.get('id')
    return {
        'id': str(garment_id) if garment_id is not None else '',
        'userId': garment.get('user_id', 'anonymous'),
        'name': garment.get('name', ''),
        'category': garment.get('category', ''),
        'imageUrl': garment.get('image_url', ''),
        'thumbnailUrl': garment.get('thumbnail_url', ''),
        'modelUrl': garment.get('model_url'),
        'fileType': garment.get('file_type', '2D'),
        'isCustomDesign': garment.get('is_custom_design', False),
        'brand': garment.get('brand'),
        'price': garment.get('price'),
        'uploadedBy': garment.get('uploaded_by', 'Anonymous'),
        'createdAt': garment.get('created_at', datetime.now(timezone.utc).isoformat()),
    }


def _get_fallback_garments() -> list[dict[str, object]]:
    return sorted(
        FALLBACK_GARMENTS,
        key=lambda item: item.get('created_at') or datetime.now(timezone.utc),
        reverse=True,
    )


def _find_fallback_garment(garment_id: str) -> dict[str, object] | None:
    for garment in _get_fallback_garments():
        if str(garment.get('_id') or garment.get('id') or '') == garment_id:
            return garment
    return None


async def get_garment_by_id(garment_id: str) -> dict[str, object]:
    """Fetch garment by MongoDB object ID (for use in other routes like tryon)."""
    try:
        collection = _get_garments_collection()
        if collection is not None:
            try:
                garment = collection.find_one({'_id': ObjectId(garment_id)})
            except Exception:
                garment = None
            if garment:
                return _garment_to_dict(garment)

        fallback_garment = _find_fallback_garment(garment_id)
        if fallback_garment:
            return _garment_to_dict(fallback_garment)

        raise HTTPException(status_code=404, detail='Garment not found')
    except Exception as e:
        logger.error('Error fetching garment %s: %s', garment_id, e)
        raise HTTPException(status_code=404, detail='Garment not found')


async def seed_demo_garments() -> None:
    """Seed demo garments into MongoDB on startup (only if empty)."""
    try:
        collection = _get_garments_collection()
        if collection is None:
            logger.warning('Cannot seed: no database connection')
            return
        
        # Check if garments exist
        count = collection.count_documents({})
        if count > 0:
            logger.info('Garment catalog already populated (%d items)', count)
            return
        
        logger.info('Seeding %d demo garments to MongoDB...', len(DEMO_GARMENTS_DATA))
        
        demo_docs = []
        for item in DEMO_GARMENTS_DATA:
            demo_docs.append({
                'user_id': 'demo-user',
                'name': item['name'],
                'category': item['category'],
                'image_url': item['image_url'],
                'thumbnail_url': item['thumbnail_url'],
                'model_url': None,
                'file_type': '2D',
                'is_custom_design': False,
                'brand': item.get('brand'),
                'price': item.get('price'),
                'uploaded_by': item.get('uploaded_by', 'Anonymous'),
                'created_at': datetime.now(timezone.utc),
                'updated_at': datetime.now(timezone.utc),
            })
        
        result = collection.insert_many(demo_docs)
        logger.info('Seeded %d demo garments successfully', len(result.inserted_ids))
        
    except Exception as e:
        logger.warning('Failed to seed demo garments: %s | %s', e, traceback.format_exc())


@router.get('/')
async def list_garments() -> dict[str, list[dict[str, object]]]:
    """Return all garments from MongoDB (newest first) or demo data if unavailable."""
    try:
        collection = _get_garments_collection()
        if collection is not None:
            garments = list(collection.find().sort('created_at', -1))
            items = [_garment_to_dict(g) for g in garments]
        else:
            items = []

        fallback_items = [_garment_to_dict(g) for g in _get_fallback_garments()]
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
        return {'items': fallback_items + items + demo_items}
        
    except Exception as e:
        logger.error('Error fetching garments: %s | %s', e, traceback.format_exc())
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
        return {'items': _get_fallback_garments() + demo_items}


@router.get('/{garment_id}')
async def garment_detail(garment_id: str) -> dict[str, object]:
    """Get a single garment by ID."""
    try:
        collection = _get_garments_collection()
        if collection is None:
            raise HTTPException(status_code=404, detail='Garment not found')
        
        garment = collection.find_one({'_id': ObjectId(garment_id)})
        if not garment:
            raise HTTPException(status_code=404, detail='Garment not found')
        
        return _garment_to_dict(garment)
        
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

        image_url = get_garment_asset_url(new_filename)
        user_id = getattr(request.state, 'user_id', None) or f'anon-{uuid4()}'

        doc = {
            'user_id': user_id,
            'name': name,
            'category': category.upper(),
            'image_url': image_url,
            'thumbnail_url': image_url,
            'model_url': None,
            'file_type': '2D',
            'is_custom_design': True,
            'brand': brand or None,
            'price': float(price) if price else None,
            'uploaded_by': uploadedBy or 'Anonymous',
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc),
        }

        collection = _get_garments_collection()
        if collection is not None:
            try:
                result = collection.insert_one(doc)
                doc['_id'] = result.inserted_id
                logger.info('Uploaded 2D garment: %s (ID: %s)', name, result.inserted_id)
            except Exception as db_error:
                logger.warning('Mongo insert failed for uploaded garment; using fallback storage: %s', db_error)
                doc['_id'] = str(uuid4())
                FALLBACK_GARMENTS.append(doc)
        else:
            doc['_id'] = str(uuid4())
            FALLBACK_GARMENTS.append(doc)
            logger.info('Stored 2D garment locally in fallback registry: %s', name)

        return _garment_to_dict(doc)
        
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

        # Validate image
        img_ext = os.path.splitext(image.filename or '')[1].lower()
        if img_ext not in ALLOWED_IMAGE_EXTENSIONS:
            raise HTTPException(status_code=400, detail=f'Invalid image type. Allowed: {ALLOWED_IMAGE_EXTENSIONS}')

        # Validate model
        model_ext = os.path.splitext(model.filename or '')[1].lower()
        if model_ext not in ALLOWED_MODEL_EXTENSIONS:
            raise HTTPException(status_code=400, detail=f'Invalid model type. Allowed: {ALLOWED_MODEL_EXTENSIONS}')

        # Save image
        img_filename = f"{uuid4()}{img_ext}"
        img_path = os.path.join(uploads_dir, img_filename)
        with open(img_path, 'wb') as buffer:
            shutil.copyfileobj(image.file, buffer)

        # Save model
        model_filename = f"{uuid4()}{model_ext}"
        model_path = os.path.join(uploads_dir, model_filename)
        with open(model_path, 'wb') as buffer:
            shutil.copyfileobj(model.file, buffer)

        image_url = get_garment_asset_url(img_filename)
        model_url = get_garment_asset_url(model_filename)
        user_id = getattr(request.state, 'user_id', None) or f'anon-{uuid4()}'

        doc = {
            'user_id': user_id,
            'name': name,
            'category': category.upper(),
            'image_url': image_url,
            'thumbnail_url': image_url,
            'model_url': model_url,
            'file_type': '3D',
            'is_custom_design': True,
            'brand': brand or None,
            'price': float(price) if price else None,
            'uploaded_by': uploadedBy or 'Anonymous',
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc),
        }

        collection = _get_garments_collection()
        if collection is not None:
            try:
                result = collection.insert_one(doc)
                doc['_id'] = result.inserted_id
                logger.info('Uploaded 3D garment: %s (ID: %s)', name, result.inserted_id)
            except Exception as db_error:
                logger.warning('Mongo insert failed for 3D garment; using fallback storage: %s', db_error)
                doc['_id'] = str(uuid4())
                FALLBACK_GARMENTS.append(doc)
        else:
            doc['_id'] = str(uuid4())
            FALLBACK_GARMENTS.append(doc)
            logger.info('Stored 3D garment locally in fallback registry: %s', name)

        return _garment_to_dict(doc)
        
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
        collection = _get_garments_collection()
        if collection is None:
            raise HTTPException(status_code=404, detail='Garment not found')
        
        result = collection.delete_one({'_id': ObjectId(garment_id)})
        
        if result.deleted_count == 0:
            fallback_garment = _find_fallback_garment(garment_id)
            if fallback_garment is None:
                raise HTTPException(status_code=404, detail='Garment not found')
            FALLBACK_GARMENTS[:] = [g for g in FALLBACK_GARMENTS if str(g.get('_id') or g.get('id') or '') != garment_id]
        else:
            FALLBACK_GARMENTS[:] = [g for g in FALLBACK_GARMENTS if str(g.get('_id') or g.get('id') or '') != garment_id]
        
        logger.info('Deleted garment: %s', garment_id)
        return {'status': 'deleted', 'id': garment_id}
        
    except HTTPException:
        raise
    except Exception as e:
        error_detail = f'{str(e)} | {traceback.format_exc()}'
        logger.error('Error deleting garment: %s', error_detail)
        raise HTTPException(status_code=500, detail='Delete failed. Check server logs.')
