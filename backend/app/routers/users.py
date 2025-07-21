from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from ..services.auth_service import get_current_user
from ..services.user_service import UserService

router = APIRouter()
user_service = UserService()

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None

class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    user_type: str

@router.get("/me", response_model=UserProfile)
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    """Get current user's profile"""
    return {
        "id": current_user["id"],
        "name": current_user["name"],
        "email": current_user["email"],
        "user_type": current_user["user_type"]
    }

@router.put("/me", response_model=UserProfile)
async def update_user_profile(
    user_data: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update current user's profile"""
    # Check if email is being updated and if it's already taken
    if user_data.email and user_data.email != current_user["email"]:
        existing_user = await user_service.get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Update user profile
    updated_user = await user_service.update_user(
        user_id=current_user["id"],
        name=user_data.name,
        email=user_data.email,
        password=user_data.password
    )
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating user profile"
        )
    
    return {
        "id": updated_user["id"],
        "name": updated_user["name"],
        "email": updated_user["email"],
        "user_type": updated_user["user_type"]
    }