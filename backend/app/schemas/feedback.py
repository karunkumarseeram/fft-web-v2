from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel

from app.models.chr_models import FeedbackCategory, FeedbackStatus

from app.models.chr_models import FeedbackCategory

# ================= CREATE =================
class FeedbackCreate(BaseModel):
    name: str
    email: str
    subject: str
    message: str
    rating: int

    category: Optional[FeedbackCategory] = FeedbackCategory.GENERAL

    is_anonymous: Optional[bool] = False

    page: Optional[str] = None
    browser: Optional[str] = None
    device: Optional[str] = None
    location: Optional[str] = None


# ================= UPDATE USER (optional) =================
class FeedbackUpdate(BaseModel):
    subject: Optional[str] = None
    message: Optional[str] = None
    rating: Optional[int] = None
    category: Optional[FeedbackCategory] = None


# ================= ADMIN REPLY =================
class FeedbackReply(BaseModel):
    admin_reply: str


# ================= STATUS UPDATE =================
class FeedbackStatusUpdate(BaseModel):
    status: FeedbackStatus


# ================= RESPONSE =================
class FeedbackResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID]

    name: str
    email: str
    subject: str
    message: str
    rating: int

    category: FeedbackCategory
    status: FeedbackStatus

    admin_reply: Optional[str]
    replied_at: Optional[datetime]

    is_anonymous: bool

    page: Optional[str]
    browser: Optional[str]
    device: Optional[str]
    location: Optional[str]

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ================= LIST RESPONSE =================
class FeedbackListResponse(BaseModel):
    items: List[FeedbackResponse]
    total: int