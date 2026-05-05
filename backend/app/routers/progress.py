from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_session, get_current_user
from app.models.learning_progress import LearningProgress
from app.models.gesture import Gesture
from app.schemas.learning_progress import LearningProgressRead

router = APIRouter(prefix="/progress", tags=["progress"])


@router.get("/", response_model=list[LearningProgressRead])
async def list_progress(
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[LearningProgressRead]:
    result = await session.execute(
        select(LearningProgress).where(LearningProgress.user_id == current_user.id)
    )
    return list(result.scalars().all())


@router.get("/{gesture_id}", response_model=LearningProgressRead)
async def get_gesture_progress(
    gesture_id: int,
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> LearningProgressRead:
    result = await session.execute(
        select(LearningProgress).where(
            LearningProgress.user_id == current_user.id,
            LearningProgress.gesture_id == gesture_id,
        )
    )
    prog = result.scalar_one_or_none()
    if not prog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No progress found")
    return prog


@router.post("/{gesture_id}", response_model=LearningProgressRead)
async def record_practice(
    gesture_id: int,
    score: int = 0,
    current_user=Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> LearningProgressRead:
    gesture = await session.get(Gesture, gesture_id)
    if not gesture:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gesture not found")

    result = await session.execute(
        select(LearningProgress).where(
            LearningProgress.user_id == current_user.id,
            LearningProgress.gesture_id == gesture_id,
        )
    )
    prog = result.scalar_one_or_none()

    if prog:
        prog.attempts += 1
        prog.score = max(prog.score, score)
        prog.last_practiced_at = datetime.utcnow()
    else:
        prog = LearningProgress(
            user_id=current_user.id,
            gesture_id=gesture_id,
            score=score,
            attempts=1,
            last_practiced_at=datetime.utcnow(),
        )
        session.add(prog)

    await session.commit()
    await session.refresh(prog)
    return prog
