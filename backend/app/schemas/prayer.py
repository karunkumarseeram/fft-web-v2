from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

class PrayerRequestCreate(BaseModel):
    name: Optional[str]
    request: str
    is_anonymous: Optional[bool] = False


class PrayerRequestOut(BaseModel):
    id: uuid.UUID
    name: Optional[str]
    request: str
    is_approved: bool
    created_at: datetime

    class Config:
        from_attributes = True