from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime
from enum import Enum


class RoleEnum(str, Enum):
    ADMIN = "ADMIN"
    PASTOR = "PASTOR"
    MEMBER = "MEMBER"


# 🔹 Base
class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None


# 🔹 Create (Signup)
class UserCreate(UserBase):
    password: str


# 🔹 Login (OTP)
class UserLogin(BaseModel):
    email: EmailStr


# 🔹 Response
class UserOut(UserBase):
    id: UUID
    role: RoleEnum
    is_active: bool
    is_approved: bool
    created_at: datetime
    last_login: Optional[datetime] = None      # ✅ Added
    last_login_ip: Optional[str] = None        # ✅ Added

    class Config:
        from_attributes = True