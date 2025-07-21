from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class Location(BaseModel):
    latitude: float
    longitude: float
    address: str

class FoodStallBase(BaseModel):
    name: str
    description: str
    location: Location

class FoodStallCreate(FoodStallBase):
    pass

class FoodStallUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[Location] = None
    image_url: Optional[str] = None

class FoodStall(FoodStallBase):
    id: str
    owner_id: str
    image_url: str
    average_rating: float = 0.0
    review_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True