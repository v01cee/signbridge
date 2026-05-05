from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.user import UserCreate


class AuthService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = UserRepository(session)

    async def register(self, data: UserCreate) -> User:
        if await self.repo.get_by_email(data.email):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email уже зарегистрирован")
        if await self.repo.get_by_username(data.username):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Имя пользователя уже занято")

        user = User(
            email=data.email,
            username=data.username,
            hashed_password=hash_password(data.password),
        )
        return await self.repo.create(user)

    async def login(self, email: str, password: str) -> str:
        user = await self.repo.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверный email или пароль",
            )
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Аккаунт отключён")

        return create_access_token({"sub": str(user.id)})
