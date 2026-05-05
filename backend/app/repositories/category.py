from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category
from app.repositories.base import BaseRepository


class CategoryRepository(BaseRepository[Category]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Category, session)

    async def get_by_slug(self, slug: str) -> Category | None:
        result = await self.session.execute(select(Category).where(Category.slug == slug))
        return result.scalar_one_or_none()

    async def get_by_name(self, name: str) -> Category | None:
        result = await self.session.execute(select(Category).where(Category.name == name))
        return result.scalar_one_or_none()
