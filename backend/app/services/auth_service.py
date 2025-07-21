from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
import jwt
import os
from .user_service import UserService

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

class AuthService:
    def __init__(self):
        self.user_service = UserService()
    
    def verify_password(self, plain_password, hashed_password):
        return pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password):
        return pwd_context.hash(password)
    
    async def authenticate_user(self, email: str, password: str):
        user = await self.user_service.get_user_by_email(email)
        if not user:
            return False
        if not self.verify_password(password, user["password"]):
            return False
        return user
    
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        user_type: str = payload.get("user_type")
        if user_id is None or user_type is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    user_service = UserService()
    user = await user_service.get_user_by_id(user_id)
    if user is None:
        raise credentials_exception
    
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "user_type": user["user_type"]
    }