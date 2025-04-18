from typing import List, Optional
from pydantic import EmailStr, Field
from datetime import datetime
from app.schemas import BaseSchema


class UserBase(BaseSchema):
    email: EmailStr
    username: str
    is_active: bool = True


class UserCreate(UserBase):
    password: str
    full_name: Optional[str] = None


class UserUpdate(BaseSchema):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None


class UserInDB(UserBase):
    id: str
    hashed_password: Optional[str] = None
    full_name: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    households: List[str] = []


class User(UserBase):
    id: str
    full_name: Optional[str] = None
    created_at: Optional[datetime] = None
    households: List[str] = []

    class Config:
        orm_mode = True
