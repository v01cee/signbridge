import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import Base, engine
from app.routers.api import api_router

app = FastAPI(title=settings.APP_NAME, debug=settings.DEBUG)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "/app/uploads"


@app.on_event("startup")
async def on_startup() -> None:
    # Создаём все таблицы если их нет
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # Создаём папку для загрузок
    os.makedirs(UPLOAD_DIR, exist_ok=True)


app.include_router(api_router)

# Раздаём загруженные файлы
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.get("/health")
async def health_check() -> dict:
    return {"status": "ok"}
