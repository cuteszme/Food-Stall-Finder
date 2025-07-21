from .dynamodb_service import DynamoDBService

class ReviewService:
    def __init__(self):
        self.dynamodb = DynamoDBService()
        self.table_name = "Reviews"
    
    async def create_review(self, food_stall_id, user_id, user_name, rating, comment):
        """Create a new review"""
        review_id = self.dynamodb.generate_id()
        
        review = {
            "id": review_id,
            "food_stall_id": food_stall_id,
            "user_id": user_id,
            "user_name": user_name,
            "rating": int(rating),
            "comment": comment,
            "created_at": self.dynamodb.get_timestamp(),
            "updated_at": self.dynamodb.get_timestamp()
        }
        
        await self.dynamodb.put_item(self.table_name, review)
        return review
    
    async def get_review_by_id(self, review_id):
        """Get review by ID"""
        return await self.dynamodb.get_item(self.table_name, {"id": review_id})
    
    async def get_reviews_by_stall(self, food_stall_id):
        """Get all reviews for a specific food stall"""
        return await self.dynamodb.query(
            table_name=self.table_name,
            index_name="FoodStallIndex",
            KeyConditionExpression="food_stall_id = :food_stall_id",
            ExpressionAttributeValues={":food_stall_id": food_stall_id}
        )
    
    async def get_user_review(self, stall_id, user_id):
        """Get a user's review for a specific food stall"""
        reviews = await self.dynamodb.query(
            table_name=self.table_name,
            index_name="UserReviewIndex",
            KeyConditionExpression="food_stall_id = :food_stall_id AND user_id = :user_id",
            ExpressionAttributeValues={
                ":food_stall_id": stall_id,
                ":user_id": user_id
            }
        )
        
        if reviews and len(reviews) > 0:
            return reviews[0]
        return None
    
    async def update_review(self, review_id, rating=None, comment=None):
        """Update a review"""
        update_expression_parts = []
        expression_attribute_values = {":updated_at": self.dynamodb.get_timestamp()}
        
        if rating is not None:
            update_expression_parts.append("rating = :rating")
            expression_attribute_values[":rating"] = int(rating)
        
        if comment is not None:
            update_expression_parts.append("comment = :comment")
            expression_attribute_values[":comment"] = comment
        
        # Add the updated_at timestamp
        update_expression_parts.append("updated_at = :updated_at")
        
        update_expression = "SET " + ", ".join(update_expression_parts)
        
        return await self.dynamodb.update_item(
            table_name=self.table_name,
            key={"id": review_id},
            update_expression=update_expression,
            expression_attribute_values=expression_attribute_values
        )
    
    async def delete_review(self, review_id):
        """Delete a review"""
        return await self.dynamodb.delete_item(self.table_name, {"id": review_id})