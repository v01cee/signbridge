from datetime import datetime

from pydantic import BaseModel


class LearningProgressBase(BaseModel):
    user_id: int
    gesture_id: int
    score: int = 0
    attempts: int = 0


class LearningProgressCreate(LearningProgressBase):
    pass


class LearningProgressRead(LearningProgressBase):
    id: int
    last_practiced_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}
