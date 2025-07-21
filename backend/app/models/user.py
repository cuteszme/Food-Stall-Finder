from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str
    user_type: str = Field(..., description="Either 'owner' or 'customer'")

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    password: Optional[str] = None

class UserInDB(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime
    password: str  # Hashed password

class User(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True