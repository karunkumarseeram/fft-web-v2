from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    event_date: Optional[datetime]


class EventCreate(EventBase):
    pass


class EventOut(EventBase):
    id: UUID
    created_by: Optional[UUID]

    class Config:
        from_attributes = True