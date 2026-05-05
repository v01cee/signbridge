from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "SignBridge API"
    DEBUG: bool = False

    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "signbridge"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "postgres"

    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 дней

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    class Config:
        env_file = ".env"


settings = Settings()
