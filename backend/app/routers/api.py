from fastapi import APIRouter

from app.routers import auth, categories, gesture, users, favorites, progress, media

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(categories.router)
api_router.include_router(gesture.router)
api_router.include_router(favorites.router)
api_router.include_router(progress.router)
api_router.include_router(media.router)
