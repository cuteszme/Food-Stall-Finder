from .dynamodb_service import DynamoDBService
from datetime import datetime
import math
import uuid

class FoodStallService:
    def __init__(self):
        self.dynamodb = DynamoDBService()
        self.table_name = "FoodStalls"
    
    async def create_food_stall(self, name, description, location, image_url, owner_id):
        """Create a new food stall"""
        stall_id = self.dynamodb.generate_id()
        
        food_stall = {
            "id": stall_id,
            "name": name,
            "description": description,
            "location": location,
            "image_url": image_url,
            "owner_id": owner_id,
            "average_rating": 0.0,
            "review_count": 0,
            "created_at": self.dynamodb.get_timestamp(),
            "updated_at": self.dynamodb.get_timestamp()
        }
        
        await self.dynamodb.put_item(self.table_name, food_stall)
        return food_stall
    
    async def get_food_stall_by_id(self, stall_id):
        """Get food stall by ID"""
        return await self.dynamodb.get_item(self.table_name, {"id": stall_id})
    
    async def get_food_stalls_by_owner(self, owner_id):
        """Get all food stalls owned by a specific user"""
        return await self.dynamodb.query(
            table_name=self.table_name,
            index_name="OwnerIndex",
            KeyConditionExpression="owner_id = :owner_id",
            ExpressionAttributeValues={":owner_id": owner_id}
        )
    
    async def get_all_food_stalls(self):
        """Get all food stalls"""
        return await self.dynamodb.scan(self.table_name)
    
    async def get_food_stalls_by_location(self, latitude, longitude, radius):
        """
        Get food stalls near a specific location
        
        This is a simplified approach that gets all stalls and filters them by distance.
        For a production app, consider using a geospatial database or service.
        """
        all_stalls = await self.get_all_food_stalls()
        nearby_stalls = []
        
        for stall in all_stalls:
            stall_lat = stall.get("location", {}).get("latitude")
            stall_lng = stall.get("location", {}).get("longitude")
            
            if stall_lat and stall_lng:
                distance = self._calculate_distance(
                    latitude, longitude, 
                    stall_lat, stall_lng
                )
                
                if distance <= radius:
                    # Add distance to stall for sorting
                    stall["distance"] = distance
                    nearby_stalls.append(stall)
        
        # Sort by distance
        nearby_stalls.sort(key=lambda x: x.get("distance", float('inf')))
        return nearby_stalls
    
    async def update_food_stall(self, stall_id, name=None, description=None, location=None, image_url=None):
        """Update food stall information"""
        update_expression_parts = []
        expression_attribute_values = {":updated_at": self.dynamodb.get_timestamp()}
        
        if name:
            update_expression_parts.append("name = :name")
            expression_attribute_values[":name"] = name
        
        if description:
            update_expression_parts.append("description = :description")
            expression_attribute_values[":description"] = description
        
        if location:
            update_expression_parts.append("location = :location")
            expression_attribute_values[":location"] = location
        
        if image_url:
            update_expression_parts.append("image_url = :image_url")
            expression_attribute_values[":image_url"] = image_url
        
        # Add the updated_at timestamp
        update_expression_parts.append("updated_at = :updated_at")
        
        update_expression = "SET " + ", ".join(update_expression_parts)
        
        return await self.dynamodb.update_item(
            table_name=self.table_name,
            key={"id": stall_id},
            update_expression=update_expression,
            expression_attribute_values=expression_attribute_values
        )
    
    async def delete_food_stall(self, stall_id):
        """Delete a food stall"""
        return await self.dynamodb.delete_item(self.table_name, {"id": stall_id})
    
    async def update_food_stall_rating(self, stall_id):
        """Update the average rating of a food stall based on its reviews"""
        # Get all reviews for the food stall
        from .review_service import ReviewService
        review_service = ReviewService()
        reviews = await review_service.get_reviews_by_stall(stall_id)
        
        if not reviews:
            # No reviews, set rating to 0
            await self.dynamodb.update_item(
                table_name=self.table_name,
                key={"id": stall_id},
                update_expression="SET average_rating = :rating, review_count = :count, updated_at = :updated_at",
                expression_attribute_values={
                    ":rating": 0.0,
                    ":count": 0,
                    ":updated_at": self.dynamodb.get_timestamp()
                }
            )
            return
        
        # Calculate average rating
        total_rating = sum(review.get("rating", 0) for review in reviews)
        average_rating = total_rating / len(reviews)
        
        # Update food stall with new rating
        await self.dynamodb.update_item(
            table_name=self.table_name,
            key={"id": stall_id},
            update_expression="SET average_rating = :rating, review_count = :count, updated_at = :updated_at",
            expression_attribute_values={
                ":rating": float(average_rating),
                ":count": len(reviews),
                ":updated_at": self.dynamodb.get_timestamp()
            }
        )
    
    def _calculate_distance(self, lat1, lon1, lat2, lon2):
        """
        Calculate the distance between two points on Earth
        using the Haversine formula (in kilometers)
        """
        # Convert decimal degrees to radians
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
        
        # Haversine formula
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        r = 6371  # Radius of Earth in kilometers
        
        return c * r