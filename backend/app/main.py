from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
import os
from .routers import auth, foodstalls, reviews, users, menus
from .services.auth_service import get_current_user

app = FastAPI(title="Food Stall Finder API")

# Configure CORS
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:19006",
    "https://foodstallfinder.com",
    "exp://192.168.56.1:19000",  # For Expo development
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if os.getenv("ENVIRONMENT") == "production" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, tags=["Authentication"], prefix="/auth")
app.include_router(users.router, tags=["Users"], prefix="/users")
app.include_router(
    foodstalls.router, 
    tags=["Food Stalls"], 
    prefix="/foodstalls"
)
app.include_router(
    reviews.router, 
    tags=["Reviews"], 
    prefix="/reviews"
)
app.include_router(
    menus.router, 
    tags=["Menus"], 
    prefix="/menus"
)

@app.get("/")
async def root():
    return {"message": "Welcome to Food Stall Finder API", "docs": "/docs"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": "2025-07-21T15:06:36", "user": "cuteszme"}

# Customize OpenAPI schema
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="Food Stall Finder API",
        version="1.0.0",
        description="API for finding and managing food stalls",
        routes=app.routes,
    )
    
    # Add security scheme for JWT authentication
    openapi_schema["components"]["securitySchemes"] = {
        "Bearer Auth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi