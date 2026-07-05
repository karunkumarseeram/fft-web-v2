import uuid
import enum
from datetime import datetime

from sqlalchemy import (
    Column,
    String,
    Float,
    DateTime,
    ForeignKey,
    Boolean,
    Enum,
    Integer
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


# ================= BASE MODEL =================
class BaseModel:
    __abstract__ = True  # ✅ IMPORTANT

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    is_deleted = Column(Boolean, default=False)  # ✅ Soft delete


# ================= ENUMS =================
class RoleEnum(str, enum.Enum):
    ADMIN = "ADMIN"
    PASTOR = "PASTOR"
    MEMBER = "MEMBER"


class PaymentMethod(str, enum.Enum):
    GPAY = "GPAY"
    PHONEPE = "PHONEPE"
    CASH = "CASH"
    CARD = "CARD"


# ================= USERS =================
class User(Base, BaseModel):
    __tablename__ = "users"

    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String)

    hashed_password = Column(String, nullable=False)  # ✅ FIXED

    role = Column(Enum(RoleEnum), default=RoleEnum.MEMBER)

    is_active = Column(Boolean, default=True)
    is_approved = Column(Boolean, default=False)

    last_login = Column(DateTime(timezone=True), nullable=True)
    last_login_ip = Column(String)
    token_version = Column(Integer, default=0, nullable=False)

    # ✅ Relationships
    donations = relationship("Donation", back_populates="user")
    members = relationship("Member", back_populates="user")
    prayer_requests = relationship("PrayerRequest", back_populates="user")
    feedbacks = relationship("Feedback",back_populates="user",cascade="all, delete-orphan")

# ================= MEMBERS =================
class Member(Base, BaseModel):
    __tablename__ = "members"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    full_name = Column(String)
    address = Column(String)
    age = Column(Integer)  # ✅ FIXED

    user = relationship("User", back_populates="members")


# ================= EVENTS =================
class Event(Base, BaseModel):
    __tablename__ = "events"

    title = Column(String, nullable=False)
    description = Column(String)

    event_date = Column(DateTime(timezone=True), default=datetime.utcnow)
    location = Column(String)

    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))


# ================= EVENT ATTENDANCE =================
class EventAttendance(Base, BaseModel):
    __tablename__ = "event_attendance"

    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id"), nullable=False)
    member_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    checked_in_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    check_in_time = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    # Relationships
    event = relationship("Event", backref="attendance")
    member = relationship("User", foreign_keys=[member_id], backref="event_attendance")
    checked_in_by_user = relationship("User", foreign_keys=[checked_in_by], backref="checked_in_attendance")


# ================= DONATIONS =================
class Donation(Base, BaseModel):
    __tablename__ = "donations"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    donor_name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)

    payment_method = Column(Enum(PaymentMethod))
    transaction_id = Column(String)

    status = Column(String, default="SUCCESS")  # ✅ NEW

    location = Column(String)
    ip_address = Column(String)

    currency = Column(String, default="INR")

    donated_at = Column(DateTime(timezone=True), default=datetime.utcnow, index=True)

    # ✅ Relationship
    user = relationship("User", back_populates="donations")


# ================= VERSES =================
class Verse(Base, BaseModel):
    __tablename__ = "verses"

    title = Column(String)
    content = Column(String, nullable=False)

    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))


# ================= BIBLE VERSES =================
class BibleVerse(Base, BaseModel):
    __tablename__ = "bible_verses"

    book = Column(String, nullable=False, index=True)
    chapter = Column(Integer, nullable=False)
    verse_number = Column(Integer, nullable=False)

    text_en = Column(String, nullable=False)  # English text
    text_te = Column(String)  # Telugu text (optional)

    is_daily = Column(Boolean, default=False)
    verse_date = Column(DateTime(timezone=True))

    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    # Index for efficient queries
    __table_args__ = (
        {"schema": "public"},
    )


# ================= PRAYER REQUESTS =================
class PrayerRequest(Base, BaseModel):
    __tablename__ = "prayer_requests"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    name = Column(String)
    request = Column(String, nullable=False)

    is_approved = Column(Boolean, default=False)

    # ✅ Relationship
    user = relationship("User", back_populates="prayer_requests")


# ================= ADMIN ACTION LOG =================
class AdminActionLog(Base, BaseModel):
    __tablename__ = "admin_action_logs"

    admin_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    target_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    action = Column(String)

    location = Column(String)
    ip_address = Column(String)


# ================= OTP TABLE =================
class OTP(Base, BaseModel):
    __tablename__ = "otps"

    email = Column(String, index=True)
    otp = Column(String, nullable=False)

    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False)

# ================= PASSWORD RESET TOKEN =================
class PasswordResetToken(Base, BaseModel):
    __tablename__ = "password_reset_tokens"

    email = Column(String, index=True, nullable=False)
    token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
class FeedbackCategory(str, enum.Enum):
    GENERAL = "GENERAL"
    BUG = "BUG"
    SUGGESTION = "SUGGESTION"
    COMPLAINT = "COMPLAINT"
    APPRECIATION = "APPRECIATION"


class FeedbackStatus(str, enum.Enum):
    PENDING = "PENDING"
    REVIEWED = "REVIEWED"
    RESOLVED = "RESOLVED"


class Feedback(Base, BaseModel):
    __tablename__ = "feedback"

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )

    name = Column(String, nullable=False)

    email = Column(
        String,
        nullable=False,
        index=True,
    )

    subject = Column(
        String,
        nullable=False,
    )

    message = Column(
        String,
        nullable=False,
    )

    rating = Column(
        Integer,
        nullable=False,
    )

    category = Column(
        Enum(FeedbackCategory),
        default=FeedbackCategory.GENERAL,
        nullable=False,
    )

    status = Column(
        Enum(FeedbackStatus),
        default=FeedbackStatus.PENDING,
        nullable=False,
    )

    admin_reply = Column(String)

    replied_at = Column(DateTime(timezone=True))

    is_anonymous = Column(
        Boolean,
        default=False,
    )

    page = Column(String)

    browser = Column(String)

    device = Column(String)

    location = Column(String)

    ip_address = Column(String)

    user = relationship(
        "User",
        back_populates="feedbacks",
    )