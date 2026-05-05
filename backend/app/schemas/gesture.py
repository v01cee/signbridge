from datetime import datetime

from pydantic import BaseModel

from app.schemas.media import MediaRead


class GestureBase(BaseModel):
    title: str
    description: str | None = None
    category_id: int | None = None


class GestureCreate(GestureBase):
    pass


class GestureUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category_id: int | None = None


class GestureRead(GestureBase):
    id: int
    created_at: datetime
    updated_at: datetime
    media: list[MediaRead] = []

    model_config = {"from_attributes": True}
