from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Gesture(Base):
    __tablename__ = "gestures"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    category_id: Mapped[int | None] = mapped_column(ForeignKey("categories.id", ondelete="SET NULL"))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    category: Mapped["Category"] = relationship(back_populates="gestures")
    media: Mapped[list["Media"]] = relationship(back_populates="gesture", cascade="all, delete-orphan")
    favorites: Mapped[list["Favorite"]] = relationship(back_populates="gesture")
    learning_progress: Mapped[list["LearningProgress"]] = relationship(back_populates="gesture")
