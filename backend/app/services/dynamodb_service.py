import boto3
import os
import uuid
from datetime import datetime
from botocore.exceptions import ClientError

# DynamoDB configuration
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_KEY")

class DynamoDBService:
    def __init__(self):
        # Initialize DynamoDB resource
        if AWS_ACCESS_KEY and AWS_SECRET_KEY:
            self.dynamodb = boto3.resource(
                'dynamodb',
                region_name=AWS_REGION,
                aws_access_key_id=AWS_ACCESS_KEY,
                aws_secret_access_key=AWS_SECRET_KEY
            )
        else:
            # For local development with DynamoDB local or when using IAM roles
            self.dynamodb = boto3.resource('dynamodb', region_name=AWS_REGION)
    
    def generate_id(self):
        """Generate a unique ID for a new item"""
        return str(uuid.uuid4())
    
    def get_timestamp(self):
        """Get current timestamp in ISO format"""
        return datetime.utcnow().isoformat()
    
    def get_table(self, table_name):
        """Get DynamoDB table by name"""
        return self.dynamodb.Table(table_name)
    
    async def put_item(self, table_name, item):
        """Add or update an item in DynamoDB table"""
        table = self.get_table(table_name)
        try:
            response = table.put_item(Item=item)
            return response
        except ClientError as e:
            print(f"Error putting item to {table_name}: {e}")
            raise
    
    async def get_item(self, table_name, key):
        """Get an item from DynamoDB table by primary key"""
        table = self.get_table(table_name)
        try:
            response = table.get_item(Key=key)
            return response.get('Item')
        except ClientError as e:
            print(f"Error getting item from {table_name}: {e}")
            raise
    
    async def delete_item(self, table_name, key):
        """Delete an item from DynamoDB table by primary key"""
        table = self.get_table(table_name)
        try:
            response = table.delete_item(Key=key)
            return response
        except ClientError as e:
            print(f"Error deleting item from {table_name}: {e}")
            raise
    
    async def query(self, table_name, index_name=None, **kwargs):
        """Query items from DynamoDB table using specified conditions"""
        table = self.get_table(table_name)
        query_params = {k: v for k, v in kwargs.items() if v is not None}
        
        if index_name:
            query_params['IndexName'] = index_name
        
        try:
            response = table.query(**query_params)
            return response.get('Items', [])
        except ClientError as e:
            print(f"Error querying {table_name}: {e}")
            raise
    
    async def scan(self, table_name, **kwargs):
        """Scan all items from DynamoDB table with optional filters"""
        table = self.get_table(table_name)
        scan_params = {k: v for k, v in kwargs.items() if v is not None}
        
        try:
            response = table.scan(**scan_params)
            return response.get('Items', [])
        except ClientError as e:
            print(f"Error scanning {table_name}: {e}")
            raise
    
    async def update_item(self, table_name, key, update_expression, expression_attribute_values):
        """Update an item in DynamoDB table"""
        table = self.get_table(table_name)
        try:
            response = table.update_item(
                Key=key,
                UpdateExpression=update_expression,
                ExpressionAttributeValues=expression_attribute_values,
                ReturnValues="ALL_NEW"
            )
            return response.get('Attributes')
        except ClientError as e:
            print(f"Error updating item in {table_name}: {e}")
            raise