from .dynamodb_service import DynamoDBService
import uuid
import os
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserService:
    def __init__(self):
        self.dynamodb = DynamoDBService()
        self.table_name = "Users"
    
    async def get_user_by_id(self, user_id):
        """Get user by ID"""
        return await self.dynamodb.get_item(self.table_name, {"id": user_id})
    
    async def get_user_by_email(self, email):
        """Get user by email using secondary index"""
        users = await self.dynamodb.query(
            table_name=self.table_name,
            index_name="EmailIndex",
            KeyConditionExpression="email = :email",
            ExpressionAttributeValues={":email": email}
        )
        
        if users and len(users) > 0:
            return users[0]
        return None
    
    async def create_user(self, email, password, name, user_type):
        """Create a new user"""
        # Check if user_type is valid
        if user_type not in ["owner", "customer"]:
            raise ValueError("User type must be either 'owner' or 'customer'")
        
        # Generate user ID
        user_id = self.dynamodb.generate_id()
        
        # Hash the password
        hashed_password = pwd_context.hash(password)
        
        # Create user item
        user = {
            "id": user_id,
            "email": email,
            "password": hashed_password,
            "name": name,
            "user_type": user_type,
            "created_at": self.dynamodb.get_timestamp(),
            "updated_at": self.dynamodb.get_timestamp()
        }
        
        # Save user to DynamoDB
        await self.dynamodb.put_item(self.table_name, user)
        
        return user_id
    
    async def update_user(self, user_id, name=None, email=None, password=None):
        """Update user information"""
        update_expression_parts = []
        expression_attribute_values = {":updated_at": self.dynamodb.get_timestamp()}
        
        if name:
            update_expression_parts.append("name = :name")
            expression_attribute_values[":name"] = name
        
        if email:
            update_expression_parts.append("email = :email")
            expression_attribute_values[":email"] = email
        
        if password:
            hashed_password = pwd_context.hash(password)
            update_expression_parts.append("password = :password")
            expression_attribute_values[":password"] = hashed_password
        
        # Add the updated_at timestamp
        update_expression_parts.append("updated_at = :updated_at")
        
        update_expression = "SET " + ", ".join(update_expression_parts)
        
        return await self.dynamodb.update_item(
            table_name=self.table_name,
            key={"id": user_id},
            update_expression=update_expression,
            expression_attribute_values=expression_attribute_values
        )