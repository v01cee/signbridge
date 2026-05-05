from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Media(Base):
    __tablename__ = "media"

    id: Mapped[int] = mapped_column(primary_key=True)
    gesture_id: Mapped[int] = mapped_column(ForeignKey("gestures.id", ondelete="CASCADE"), nullable=False)
    file_url: Mapped[str] = mapped_column(String(500), nullable=False)
    media_type: Mapped[str] = mapped_column(String(50), nullable=False)  # video, image, gif
    order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    gesture: Mapped["Gesture"] = relationship(back_populates="media")
