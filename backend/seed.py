"""
Seed script — inserts all demo garments into MongoDB (ar-tryon-nepal).

Run from the backend directory:
    python seed.py

Requires:
    pip install pymongo
"""
from __future__ import annotations

from datetime import datetime, timezone
from pymongo import MongoClient, UpdateOne

MONGO_URL = 'mongodb://127.0.0.1:27017'
DB_NAME = 'ar-tryon-nepal'

NOW = datetime.now(timezone.utc).isoformat()

GARMENTS = [
    {
        '_id': 'garment-kurta-001',
        'userId': 'sample-user',
        'name': 'Himalayan Kurta',
        'category': 'TOP',
        'imageUrl': '/clothes/himalayan_kurta.png',
        'thumbnailUrl': '/clothes/himalayan_kurta.png',
        'modelUrl': '/clothes/models/himalayan_kurta.glb',
        'isCustomDesign': False,
        'designData': None,
        'brand': 'Kathmandu Studio',
        'price': 2499,
        'createdAt': NOW,
        'updatedAt': NOW,
    },
    {
        '_id': 'garment-daura-suruwal-001',
        'userId': 'sample-user',
        'name': 'Daura Suruwal Heritage',
        'category': 'TRADITIONAL',
        'imageUrl': '/clothes/daura_suruwal.png',
        'thumbnailUrl': '/clothes/daura_suruwal.png',
        'modelUrl': '/clothes/models/daura_suruwal.glb',
        'isCustomDesign': False,
        'designData': None,
        'brand': 'DressMesh Heritage',
        'price': 4299,
        'createdAt': NOW,
        'updatedAt': NOW,
    },
    {
        '_id': 'garment-sherwani-001',
        'userId': 'sample-user',
        'name': 'Kathmandu Sherwani',
        'category': 'TRADITIONAL',
        'imageUrl': '/clothes/sherwani.png',
        'thumbnailUrl': '/clothes/sherwani.png',
        'modelUrl': '/clothes/models/sherwani.glb',
        'isCustomDesign': False,
        'designData': None,
        'brand': 'DressMesh Heritage',
        'price': 6899,
        'createdAt': NOW,
        'updatedAt': NOW,
    },
    {
        '_id': 'garment-dhaka-001',
        'userId': 'sample-user',
        'name': 'Dhaka Festival Set',
        'category': 'DRESS',
        'imageUrl': '/clothes/dhaka_set.png',
        'thumbnailUrl': '/clothes/dhaka_set.png',
        'modelUrl': '/clothes/models/dhaka_set.glb',
        'isCustomDesign': False,
        'designData': None,
        'brand': 'DressMesh Heritage',
        'price': 5199,
        'createdAt': NOW,
        'updatedAt': NOW,
    },
    {
        '_id': 'garment-shirt-001',
        'userId': 'sample-user',
        'name': 'Midnight Oxford Shirt',
        'category': 'TOP',
        'imageUrl': '/clothes/oxford_shirt.png',
        'thumbnailUrl': '/clothes/oxford_shirt.png',
        'modelUrl': '/clothes/models/oxford_shirt.glb',
        'isCustomDesign': False,
        'designData': None,
        'brand': 'Kathmandu Studio',
        'price': 2199,
        'createdAt': NOW,
        'updatedAt': NOW,
    },
    {
        '_id': 'garment-jacket-001',
        'userId': 'sample-user',
        'name': 'Peakline Field Jacket',
        'category': 'OUTERWEAR',
        'imageUrl': '/clothes/field_jacket.png',
        'thumbnailUrl': '/clothes/field_jacket.png',
        'modelUrl': '/clothes/models/field_jacket.glb',
        'isCustomDesign': False,
        'designData': None,
        'brand': 'Peakline',
        'price': 5899,
        'createdAt': NOW,
        'updatedAt': NOW,
    },
    {
        '_id': 'garment-hoodie-001',
        'userId': 'sample-user',
        'name': 'Urban Street Hoodie',
        'category': 'OUTERWEAR',
        'imageUrl': '/clothes/hoodie.svg',
        'thumbnailUrl': '/clothes/hoodie.svg',
        'modelUrl': '/clothes/models/hoodie.glb',
        'isCustomDesign': False,
        'designData': None,
        'brand': 'AR Tryon Nepal',
        'price': 3499,
        'createdAt': NOW,
        'updatedAt': NOW,
    },
]

SAMPLE_USER = {
    '_id': 'sample-user',
    'email': 'demo@artryon.com.np',
    'name': 'Demo User',
    'avatar_url': None,
    'age': None,
    'height_cm': None,
    'createdAt': NOW,
    'updatedAt': NOW,
}


def main() -> None:
    client = MongoClient(MONGO_URL)
    db = client[DB_NAME]

    # Upsert demo user
    db['users'].update_one(
        {'_id': SAMPLE_USER['_id']},
        {'$set': SAMPLE_USER},
        upsert=True,
    )
    print(f"[OK] Upserted user: {SAMPLE_USER['_id']}")

    # Upsert all garments (won't duplicate on re-run)
    ops = [
        UpdateOne({'_id': g['_id']}, {'$set': g}, upsert=True)
        for g in GARMENTS
    ]
    result = db['garments'].bulk_write(ops)
    print(f'[OK] Garments seeded: {result.upserted_count} inserted, {result.modified_count} updated')
    print(f'\nDatabase "{DB_NAME}" now has:')
    print(f'  users    : {db["users"].count_documents({})}')
    print(f'  garments : {db["garments"].count_documents({})}')
    client.close()


if __name__ == '__main__':
    main()
