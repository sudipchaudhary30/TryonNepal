from __future__ import annotations

from fastapi import APIRouter

router = APIRouter(prefix='/users', tags=['users'])


@router.get('/me')
def me() -> dict[str, str]:
    return {'id': 'dev-user', 'email': 'dev@example.com'}
