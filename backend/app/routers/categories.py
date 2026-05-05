from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_session
from app.models.user import User
from app.models.category import Category
from app.repositories.category import CategoryRepository
from app.schemas.category import CategoryCreate, CategoryRead

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("/", response_model=list[CategoryRead])
async def list_categories(session: AsyncSession = Depends(get_session)) -> list[CategoryRead]:
    repo = CategoryRepository(session)
    return await repo.get_all()


@router.post("/", response_model=CategoryRead, status_code=201)
async def create_category(
    data: CategoryCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> CategoryRead:
    if not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Superuser only")

    repo = CategoryRepository(session)
    if await repo.get_by_slug(data.slug):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Slug already exists")

    category = Category(**data.model_dump())
    return await repo.create(category)
