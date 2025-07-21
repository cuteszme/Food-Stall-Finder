from .dynamodb_service import DynamoDBService

class MenuService:
    def __init__(self):
        self.dynamodb = DynamoDBService()
        self.table_name = "MenuItems"
    
    async def create_menu_item(self, food_stall_id, name, price, description, category, image_url):
        """Create a new menu item"""
        item_id = self.dynamodb.generate_id()
        
        menu_item = {
            "id": item_id,
            "food_stall_id": food_stall_id,
            "name": name,
            "price": float(price),
            "description": description,
            "category": category,
            "image_url": image_url,
            "created_at": self.dynamodb.get_timestamp(),
            "updated_at": self.dynamodb.get_timestamp()
        }
        
        await self.dynamodb.put_item(self.table_name, menu_item)
        return menu_item
    
    async def get_menu_item_by_id(self, item_id):
        """Get menu item by ID"""
        return await self.dynamodb.get_item(self.table_name, {"id": item_id})
    
    async def get_menu_items(self, food_stall_id):
        """Get all menu items for a specific food stall"""
        return await self.dynamodb.query(
            table_name=self.table_name,
            index_name="FoodStallIndex",
            KeyConditionExpression="food_stall_id = :food_stall_id",
            ExpressionAttributeValues={":food_stall_id": food_stall_id}
        )
    
    async def get_menu_items_by_category(self, food_stall_id, category):
        """Get menu items for a specific food stall and category"""
        return await self.dynamodb.query(
            table_name=self.table_name,
            index_name="CategoryIndex",
            KeyConditionExpression="food_stall_id = :food_stall_id AND category = :category",
            ExpressionAttributeValues={
                ":food_stall_id": food_stall_id,
                ":category": category
            }
        )
    
    async def update_menu_item(self, item_id, name=None, price=None, description=None, category=None, image_url=None):
        """Update menu item information"""
        update_expression_parts = []
        expression_attribute_values = {":updated_at": self.dynamodb.get_timestamp()}
        
        if name:
            update_expression_parts.append("name = :name")
            expression_attribute_values[":name"] = name
        
        if price is not None:
            update_expression_parts.append("price = :price")
            expression_attribute_values[":price"] = float(price)
        
        if description:
            update_expression_parts.append("description = :description")
            expression_attribute_values[":description"] = description
        
        if category:
            update_expression_parts.append("category = :category")
            expression_attribute_values[":category"] = category
        
        if image_url:
            update_expression_parts.append("image_url = :image_url")
            expression_attribute_values[":image_url"] = image_url
        
        # Add the updated_at timestamp
        update_expression_parts.append("updated_at = :updated_at")
        
        update_expression = "SET " + ", ".join(update_expression_parts)
        
        return await self.dynamodb.update_item(
            table_name=self.table_name,
            key={"id": item_id},
            update_expression=update_expression,
            expression_attribute_values=expression_attribute_values
        )
    
    async def delete_menu_item(self, item_id):
        """Delete a menu item"""
        return await self.dynamodb.delete_item(self.table_name, {"id": item_id})
    
    async def delete_menu_category(self, food_stall_id, category):
        """Delete all menu items in a specific category for a food stall"""
        items = await self.get_menu_items_by_category(food_stall_id, category)
        
        for item in items:
            await self.delete_menu_item(item["id"])
        
        return len(items)