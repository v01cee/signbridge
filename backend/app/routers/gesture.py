from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_session
from app.schemas.gesture import GestureCreate, GestureRead
from app.services.gesture import GestureService

router = APIRouter(prefix="/gestures", tags=["gestures"])


@router.post("/", response_model=GestureRead, status_code=201)
async def create_gesture(
    data: GestureCreate,
    session: AsyncSession = Depends(get_session),
) -> GestureRead:
    service = GestureService(session)
    return await service.create(data)


@router.get("/", response_model=list[GestureRead])
async def list_gestures(
    q: str | None = None,
    category_id: int | None = None,
    offset: int = 0,
    limit: int = 100,
    session: AsyncSession = Depends(get_session),
) -> list[GestureRead]:
    service = GestureService(session)
    return await service.search(query=q, category_id=category_id, offset=offset, limit=limit)


@router.get("/{gesture_id}", response_model=GestureRead)
async def get_gesture(
    gesture_id: int,
    session: AsyncSession = Depends(get_session),
) -> GestureRead:
    service = GestureService(session)
    return await service.get_by_id(gesture_id)
