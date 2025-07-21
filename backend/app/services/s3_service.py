import boto3
import os
from botocore.exceptions import ClientError
import uuid
import io

# S3 configuration
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_KEY")
S3_BUCKET = os.getenv("S3_BUCKET", "food-stall-finder")

class S3Service:
    def __init__(self):
        # Initialize S3 resource
        if AWS_ACCESS_KEY and AWS_SECRET_KEY:
            self.s3 = boto3.client(
                's3',
                region_name=AWS_REGION,
                aws_access_key_id=AWS_ACCESS_KEY,
                aws_secret_access_key=AWS_SECRET_KEY
            )
        else:
            # For local development with moto or when using IAM roles
            self.s3 = boto3.client('s3', region_name=AWS_REGION)
    
    async def upload_file(self, file, folder, object_id=None):
        """Upload a file to S3 bucket and return the URL"""
        if not object_id:
            object_id = str(uuid.uuid4())
        
        # Get file extension
        filename = file.filename
        ext = filename.split('.')[-1] if '.' in filename else ''
        
        # Create S3 key
        key = f"{folder}/{object_id}.{ext}" if ext else f"{folder}/{object_id}"
        
        try:
            # Read file content
            contents = await file.read()
            
            # Upload to S3
            self.s3.upload_fileobj(
                io.BytesIO(contents),
                S3_BUCKET,
                key,
                ExtraArgs={
                    'ContentType': file.content_type,
                    'ACL': 'public-read'  # Make the file publicly accessible
                }
            )
            
            # Generate URL
            url = f"https://{S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{key}"
            return url
        
        except ClientError as e:
            print(f"Error uploading file to S3: {e}")
            raise
        finally:
            # Reset file cursor
            await file.seek(0)
    
    async def delete_file(self, url):
        """Delete a file from S3 bucket by URL"""
        try:
            # Extract key from URL
            key = url.split(f"https://{S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/")[1]
            
            # Delete from S3
            self.s3.delete_object(
                Bucket=S3_BUCKET,
                Key=key
            )
            return True
        except ClientError as e:
            print(f"Error deleting file from S3: {e}")
            raise
        except Exception as e:
            print(f"Error extracting key from URL: {e}")
            return False