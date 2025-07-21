from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: str

class ReviewCreate(ReviewBase):
    pass

class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = None

class Review(ReviewBase):
    id: str
    food_stall_id: str
    user_id: str
    user_name: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True