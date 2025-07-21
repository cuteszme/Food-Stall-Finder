from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional
import jwt
from ..services.user_service import UserService
from ..services.auth_service import AuthService

router = APIRouter()
auth_service = AuthService()
user_service = UserService()

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    user_type: str

class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    user_type: str  # "owner" or "customer"

@router.post("/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user already exists
    existing_user = await user_service.get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user_id = await user_service.create_user(
        email=user_data.email,
        password=user_data.password,
        name=user_data.name,
        user_type=user_data.user_type
    )
    
    # Generate token
    access_token = auth_service.create_access_token(
        data={"sub": user_id, "user_type": user_data.user_type}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user_id,
        "user_type": user_data.user_type
    }

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await auth_service.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth_service.create_access_token(
        data={"sub": user["id"], "user_type": user["user_type"]}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user["id"],
        "user_type": user["user_type"]
    }