import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_session, get_current_user
from app.models.media import Media
from app.models.gesture import Gesture
from app.schemas.media import MediaRead

router = APIRouter(prefix="/gestures", tags=["media"])

UPLOAD_DIR = "/app/uploads"


@router.get("/{gesture_id}/media", response_model=list[MediaRead])
async def list_media(
    gesture_id: int,
    session: AsyncSession = Depends(get_session),
) -> list[MediaRead]:
    gesture = await session.get(Gesture, gesture_id)
    if not gesture:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gesture not found")
    result = await session.execute(
        select(Media).where(Media.gesture_id == gesture_id).order_by(Media.order)
    )
    return list(result.scalars().all())


@router.post("/{gesture_id}/media", response_model=MediaRead, status_code=201)
async def upload_media(
    gesture_id: int,
    file: UploadFile = File(...),
    order: int = 0,
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> MediaRead:
    gesture = await session.get(Gesture, gesture_id)
    if not gesture:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gesture not found")

    content_type = file.content_type or ""
    if content_type.startswith("video/"):
        media_type = "video"
    elif content_type.startswith("image/"):
        ext = os.path.splitext(file.filename or "")[1].lower()
        media_type = "gif" if ext == ".gif" else "image"
    else:
        raise HTTPException(status_code=400, detail="Only image and video files are allowed")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename or "file")[1]
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)

    media = Media(
        gesture_id=gesture_id,
        file_url=f"/uploads/{filename}",
        media_type=media_type,
        order=order,
    )
    session.add(media)
    await session.commit()
    await session.refresh(media)
    return media


@router.delete("/{gesture_id}/media/{media_id}", status_code=204)
async def delete_media(
    gesture_id: int,
    media_id: int,
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    result = await session.execute(
        select(Media).where(Media.id == media_id, Media.gesture_id == gesture_id)
    )
    media = result.scalar_one_or_none()
    if not media:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media not found")

    filepath = os.path.join(UPLOAD_DIR, os.path.basename(media.file_url))
    if os.path.exists(filepath):
        os.remove(filepath)

    await session.delete(media)
    await session.commit()
