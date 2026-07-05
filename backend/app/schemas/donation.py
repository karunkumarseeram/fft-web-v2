from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime
from enum import Enum


class PaymentMethod(str, Enum):
    GPAY = "GPAY"
    PHONEPE = "PHONEPE"
    CASH = "CASH"
    CARD = "CARD"


class DonationBase(BaseModel):
    donor_name: str
    amount: float
    payment_method: Optional[PaymentMethod]
    transaction_id: Optional[str]


class DonationCreate(DonationBase):
    pass


class DonationOut(DonationBase):
    id: UUID
    user_id: Optional[UUID]
    status: str
    currency: str
    donated_at: datetime

    class Config:
        from_attributes = True