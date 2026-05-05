from datetime import datetime

from pydantic import BaseModel


class MediaBase(BaseModel):
    gesture_id: int
    file_url: str
    media_type: str
    order: int = 0


class MediaCreate(MediaBase):
    pass


class MediaRead(MediaBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
