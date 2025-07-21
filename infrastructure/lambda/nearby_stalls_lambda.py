import json
import boto3
import os
import math
from decimal import Decimal

# DynamoDB configuration
dynamodb = boto3.resource('dynamodb')
food_stalls_table = dynamodb.Table(os.environ.get('FOOD_STALLS_TABLE', 'FoodStalls'))

def lambda_handler(event, context):
    try:
        # Get parameters from the event
        params = event.get('queryStringParameters', {})
        
        if not params:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing query parameters'})
            }
        
        latitude = float(params.get('latitude', 0))
        longitude = float(params.get('longitude', 0))
        radius = float(params.get('radius', 10))  # Default radius: 10km
        
        if latitude == 0 and longitude == 0:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Invalid location coordinates'})
            }
        
        # Get all food stalls from DynamoDB
        response = food_stalls_table.scan()
        food_stalls = response.get('Items', [])
        
        # Calculate distance for each food stall and filter by radius
        nearby_stalls = []
        for stall in food_stalls:
            stall_location = stall.get('location', {})
            stall_lat = float(stall_location.get('latitude', 0))
            stall_lng = float(stall_location.get('longitude', 0))
            
            if stall_lat and stall_lng:
                distance = calculate_distance(
                    latitude, longitude,
                    stall_lat, stall_lng
                )
                
                if distance <= radius:
                    # Convert Decimal objects to float for JSON serialization
                    stall = json_serialize(stall)
                    stall['distance'] = round(distance, 2)
                    nearby_stalls.append(stall)
        
        # Sort by distance
        nearby_stalls.sort(key=lambda x: x.get('distance', float('inf')))
        
        return {
            'statusCode': 200,
            'body': json.dumps({'food_stalls': nearby_stalls})
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate the distance between two points using Haversine formula (in kilometers)"""
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    
    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    r = 6371  # Radius of Earth in kilometers
    
    return c * r

def json_serialize(obj):
    """Helper function to convert Decimal objects to float for JSON serialization"""
    if isinstance(obj, dict):
        return {k: json_serialize(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [json_serialize(item) for item in obj]
    elif isinstance(obj, Decimal):
        return float(obj)
    else:
        return obj