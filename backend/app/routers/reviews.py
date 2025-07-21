from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from ..services.auth_service import get_current_user
from ..services.review_service import ReviewService
from ..services.foodstall_service import FoodStallService

router = APIRouter()
review_service = ReviewService()
foodstall_service = FoodStallService()

class ReviewBase(BaseModel):
    rating: int  # 1-5
    comment: str

class ReviewCreate(ReviewBase):
    pass

class ReviewUpdate(BaseModel):
    rating: Optional[int] = None
    comment: Optional[str] = None

class Review(ReviewBase):
    id: str
    food_stall_id: str
    user_id: str
    user_name: str
    created_at: str
    updated_at: str

@router.post("/{stall_id}", response_model=Review)
async def create_review(
    stall_id: str,
    review: ReviewCreate,
    current_user: dict = Depends(get_current_user)
):
    # Verify food stall exists
    food_stall = await foodstall_service.get_food_stall_by_id(stall_id)
    if not food_stall:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Food stall not found"
        )
    
    # Verify user isn't the owner of the food stall
    if food_stall["owner_id"] == current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot review your own food stall"
        )
    
    # Check if user already reviewed this stall
    existing_review = await review_service.get_user_review(
        stall_id=stall_id,
        user_id=current_user["id"]
    )
    
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this food stall. Please edit your existing review."
        )
    
    # Validate rating
    if review.rating < 1 or review.rating > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating must be between 1 and 5"
        )
    
    # Create review
    new_review = await review_service.create_review(
        food_stall_id=stall_id,
        user_id=current_user["id"],
        user_name=current_user["name"],
        rating=review.rating,
        comment=review.comment
    )
    
    # Update food stall's average rating
    await foodstall_service.update_food_stall_rating(stall_id)
    
    return new_review

@router.get("/{stall_id}", response_model=List[Review])
async def get_reviews(
    stall_id: str,
    current_user: dict = Depends(get_current_user)
):
    # Verify food stall exists
    food_stall = await foodstall_service.get_food_stall_by_id(stall_id)
    if not food_stall:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Food stall not found"
        )
    
    # Get reviews
    reviews = await review_service.get_reviews_by_stall(stall_id)
    
    return reviews

@router.put("/{review_id}", response_model=Review)
async def update_review(
    review_id: str,
    review_update: ReviewUpdate,
    current_user: dict = Depends(get_current_user)
):
    # Get review
    review = await review_service.get_review_by_id(review_id)
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    # Verify ownership
    if review["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this review"
        )
    
    # Validate rating if provided
    if review_update.rating is not None and (review_update.rating < 1 or review_update.rating > 5):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating must be between 1 and 5"
        )
    
    # Update review
    updated_review = await review_service.update_review(
        review_id=review_id,
        rating=review_update.rating,
        comment=review_update.comment
    )
    
    # Update food stall's average rating
    await foodstall_service.update_food_stall_rating(review["food_stall_id"])
    
    return updated_review

@router.delete("/{review_id}")
async def delete_review(
    review_id: str,
    current_user: dict = Depends(get_current_user)
):
    # Get review
    review = await review_service.get_review_by_id(review_id)
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    # Verify ownership
    if review["user_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this review"
        )
    
    # Store food_stall_id before deleting the review
    stall_id = review["food_stall_id"]
    
    # Delete review
    await review_service.delete_review(review_id)
    
    # Update food stall's average rating
    await foodstall_service.update_food_stall_rating(stall_id)
    
    return {"message": "Review deleted successfully"}