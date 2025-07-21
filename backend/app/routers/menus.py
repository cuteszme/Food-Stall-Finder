from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from typing import List, Optional
from pydantic import BaseModel
import json
from ..services.auth_service import get_current_user
from ..services.menu_service import MenuService
from ..services.foodstall_service import FoodStallService
from ..services.s3_service import S3Service

router = APIRouter()
menu_service = MenuService()
foodstall_service = FoodStallService()
s3_service = S3Service()

class MenuItemBase(BaseModel):
    name: str
    price: float
    description: str
    category: str

class MenuItemCreate(MenuItemBase):
    pass

class MenuItem(MenuItemBase):
    id: str
    food_stall_id: str
    image_url: str

@router.post("/items/{stall_id}", response_model=MenuItem)
async def add_menu_item(
    stall_id: str,
    name: str = Form(...),
    price: float = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    image: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    # Verify ownership
    food_stall = await foodstall_service.get_food_stall_by_id(stall_id)
    if not food_stall:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Food stall not found"
        )
    
    if food_stall["owner_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to add menu items to this food stall"
        )
    
    # Upload image to S3
    image_url = await s3_service.upload_file(
        file=image,
        folder="menu_items",
        object_id=f"{stall_id}_{name.replace(' ', '_').lower()}"
    )
    
    # Create menu item
    menu_item = await menu_service.create_menu_item(
        food_stall_id=stall_id,
        name=name,
        price=price,
        description=description,
        category=category,
        image_url=image_url
    )
    
    return menu_item

@router.get("/items/{stall_id}", response_model=List[MenuItem])
async def get_menu_items(
    stall_id: str,
    category: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    # Verify food stall exists
    food_stall = await foodstall_service.get_food_stall_by_id(stall_id)
    if not food_stall:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Food stall not found"
        )
    
    # Get menu items
    if category:
        menu_items = await menu_service.get_menu_items_by_category(
            food_stall_id=stall_id,
            category=category
        )
    else:
        menu_items = await menu_service.get_menu_items(food_stall_id=stall_id)
    
    return menu_items

@router.put("/items/{item_id}", response_model=MenuItem)
async def update_menu_item(
    item_id: str,
    name: Optional[str] = Form(None),
    price: Optional[float] = Form(None),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_user)
):
    # Get menu item
    menu_item = await menu_service.get_menu_item_by_id(item_id)
    if not menu_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu item not found"
        )
    
    # Verify ownership
    food_stall = await foodstall_service.get_food_stall_by_id(menu_item["food_stall_id"])
    if food_stall["owner_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this menu item"
        )
    
    # Upload new image if provided
    image_url = None
    if image:
        image_url = await s3_service.upload_file(
            file=image,
            folder="menu_items",
            object_id=f"{menu_item['food_stall_id']}_{menu_item['name'].replace(' ', '_').lower()}"
        )
    
    # Update menu item
    updated_item = await menu_service.update_menu_item(
        item_id=item_id,
        name=name,
        price=price,
        description=description,
        category=category,
        image_url=image_url
    )
    
    return updated_item

@router.delete("/items/{item_id}")
async def delete_menu_item(
    item_id: str,
    current_user: dict = Depends(get_current_user)
):
    # Get menu item
    menu_item = await menu_service.get_menu_item_by_id(item_id)
    if not menu_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu item not found"
        )
    
    # Verify ownership
    food_stall = await foodstall_service.get_food_stall_by_id(menu_item["food_stall_id"])
    if food_stall["owner_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this menu item"
        )
    
    await menu_service.delete_menu_item(item_id)
    
    return {"message": "Menu item deleted successfully"}

@router.delete("/categories/{stall_id}/{category}")
async def delete_menu_category(
    stall_id: str,
    category: str,
    current_user: dict = Depends(get_current_user)
):
    # Verify ownership
    food_stall = await foodstall_service.get_food_stall_by_id(stall_id)
    if not food_stall:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Food stall not found"
        )
    
    if food_stall["owner_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete menu categories for this food stall"
        )
    
    # Delete all menu items in the category
    await menu_service.delete_menu_category(stall_id, category)
    
    return {"message": f"Category '{category}' deleted successfully"}