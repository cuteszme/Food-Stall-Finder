from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class MenuItemBase(BaseModel):
    name: str
    price: float = Field(..., gt=0)
    description: str
    category: str

class MenuItemCreate(MenuItemBase):
    pass

class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    description: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None

class MenuItem(MenuItemBase):
    id: str
    food_stall_id: str
    image_url: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True