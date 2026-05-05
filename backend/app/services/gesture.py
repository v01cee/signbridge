from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.gesture import Gesture
from app.repositories.gesture import GestureRepository
from app.schemas.gesture import GestureCreate


class GestureService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = GestureRepository(session)

    async def create(self, data: GestureCreate) -> Gesture:
        return await self.repo.create_gesture(data)

    async def get_all(self, offset: int = 0, limit: int = 100) -> list[Gesture]:
        return await self.repo.get_all(offset=offset, limit=limit)

    async def search(
        self,
        query: str | None = None,
        category_id: int | None = None,
        offset: int = 0,
        limit: int = 100,
    ) -> list[Gesture]:
        return await self.repo.search(query=query, category_id=category_id, offset=offset, limit=limit)

    async def get_by_id(self, gesture_id: int) -> Gesture:
        gesture = await self.repo.get_by_id(gesture_id)
        if not gesture:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gesture not found")
        return gesture
