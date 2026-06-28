from __future__ import annotations

from fastapi import APIRouter

router = APIRouter(prefix='/designs', tags=['designs'])


@router.get('/')
def list_designs() -> dict[str, list[dict[str, str]]]:
    return {'items': []}
