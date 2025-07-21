from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from typing import List, Optional
from pydantic import BaseModel
import json
from ..services.auth_service import get_current_user
from ..services.foodstall_service import FoodStallService
from ..services.s3_service import S3Service

router = APIRouter()
foodstall_service = FoodStallService()
s3_service = S3Service()

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

class FoodStall(FoodStallBase):
    id: str
    owner_id: str
    image_url: str
    created_at: str
    updated_at: str
    average_rating: float = 0.0
    review_count: int = 0

@router.post("/", response_model=FoodStall)
async def create_food_stall(
    name: str = Form(...),
    description: str = Form(...),
    location_data: str = Form(...),  # JSON string containing location data
    image: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    # Verify user is an owner
    if current_user["user_type"] != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owners can create food stalls"
        )
    
    # Parse location data
    try:
        location = json.loads(location_data)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid location data format"
        )
    
    # Upload image to S3
    image_url = await s3_service.upload_file(
        file=image,
        folder="food_stalls",
        object_id=f"{current_user['id']}_{name.replace(' ', '_').lower()}"
    )
    
    # Create food stall
    food_stall = await foodstall_service.create_food_stall(
        name=name,
        description=description,
        location=location,
        image_url=image_url,
        owner_id=current_user["id"]
    )
    
    return food_stall

@router.get("/", response_model=List[FoodStall])
async def get_food_stalls(
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    radius: Optional[float] = None,  # in kilometers
    current_user: dict = Depends(get_current_user)
):
    # If location is provided, filter by proximity
    if latitude and longitude and radius:
        food_stalls = await foodstall_service.get_food_stalls_by_location(
            latitude=latitude,
            longitude=longitude,
            radius=radius
        )
    else:
        food_stalls = await foodstall_service.get_all_food_stalls()
    
    return food_stalls

@router.get("/{stall_id}", response_model=FoodStall)
async def get_food_stall(
    stall_id: str,
    current_user: dict = Depends(get_current_user)
):
    food_stall = await foodstall_service.get_food_stall_by_id(stall_id)
    if not food_stall:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Food stall not found"
        )
    
    return food_stall

@router.put("/{stall_id}", response_model=FoodStall)
async def update_food_stall(
    stall_id: str,
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    location_data: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
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
            detail="You don't have permission to update this food stall"
        )
    
    # Parse location data if provided
    location = None
    if location_data:
        try:
            location = json.loads(location_data)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid location data format"
            )
    
    # Upload new image if provided
    image_url = None
    if image:
        image_url = await s3_service.upload_file(
            file=image,
            folder="food_stalls",
            object_id=f"{current_user['id']}_{food_stall['name'].replace(' ', '_').lower()}"
        )
    
    # Update food stall
    updated_stall = await foodstall_service.update_food_stall(
        stall_id=stall_id,
        name=name,
        description=description,
        location=location,
        image_url=image_url
    )
    
    return updated_stall

@router.delete("/{stall_id}")
async def delete_food_stall(
    stall_id: str,
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
            detail="You don't have permission to delete this food stall"
        )
    
    await foodstall_service.delete_food_stall(stall_id)
    
    return {"message": "Food stall deleted successfully"}