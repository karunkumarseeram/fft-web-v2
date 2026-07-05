from pydantic import BaseModel
from typing import Optional
from uuid import UUID


class MemberBase(BaseModel):
    full_name: Optional[str]
    address: Optional[str]
    age: Optional[int]


class MemberCreate(MemberBase):
    pass


class MemberOut(MemberBase):
    id: UUID
    user_id: UUID

    class Config:
        from_attributes = True