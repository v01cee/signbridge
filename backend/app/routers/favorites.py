from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_session, get_current_user
from app.models.favorite import Favorite
from app.models.gesture import Gesture
from app.schemas.favorite import FavoriteRead

router = APIRouter(prefix="/favorites", tags=["favorites"])


@router.get("/", response_model=list[FavoriteRead])
async def list_favorites(
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[FavoriteRead]:
    result = await session.execute(
        select(Favorite).where(Favorite.user_id == current_user.id)
    )
    return list(result.scalars().all())


@router.post("/", response_model=FavoriteRead, status_code=201)
async def add_favorite(
    gesture_id: int,
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> FavoriteRead:
    gesture = await session.get(Gesture, gesture_id)
    if not gesture:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gesture not found")

    existing = await session.execute(
        select(Favorite).where(
            Favorite.user_id == current_user.id,
            Favorite.gesture_id == gesture_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already in favorites")

    fav = Favorite(user_id=current_user.id, gesture_id=gesture_id)
    session.add(fav)
    await session.commit()
    await session.refresh(fav)
    return fav


@router.delete("/{gesture_id}", status_code=204)
async def remove_favorite(
    gesture_id: int,
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    result = await session.execute(
        select(Favorite).where(
            Favorite.user_id == current_user.id,
            Favorite.gesture_id == gesture_id,
        )
    )
    fav = result.scalar_one_or_none()
    if not fav:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not in favorites")
    await session.delete(fav)
    await session.commit()
