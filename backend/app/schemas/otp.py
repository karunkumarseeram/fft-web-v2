from pydantic import BaseModel, EmailStr
from datetime import datetime


class OTPCreate(BaseModel):
    email: EmailStr
    otp: str
    expires_at: datetime