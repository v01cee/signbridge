from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.gesture import Gesture
from app.repositories.base import BaseRepository
from app.schemas.gesture import GestureCreate


class GestureRepository(BaseRepository[Gesture]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Gesture, session)

    async def create_gesture(self, data: GestureCreate) -> Gesture:
        gesture = Gesture(**data.model_dump())
        return await self.create(gesture)

    async def get_by_id(self, id: int) -> Gesture | None:
        result = await self.session.execute(
            select(Gesture).options(selectinload(Gesture.media)).where(Gesture.id == id)
        )
        return result.scalar_one_or_none()

    async def search(
        self,
        query: str | None = None,
        category_id: int | None = None,
        offset: int = 0,
        limit: int = 100,
    ) -> list[Gesture]:
        stmt = select(Gesture).options(selectinload(Gesture.media))
        if category_id is not None:
            stmt = stmt.where(Gesture.category_id == category_id)
        if query:
            stmt = stmt.where(Gesture.title.ilike(f"%{query}%"))
        stmt = stmt.offset(offset).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
