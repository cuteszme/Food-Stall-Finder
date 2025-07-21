const AWS = require('aws-sdk');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});

const s3 = new AWS.S3();

// Bucket names
const FOOD_STALLS_BUCKET = process.env.S3_BUCKET || 'food-stall-finder';

// Create S3 bucket
const createBucket = async (bucketName) => {
  const params = {
    Bucket: bucketName,
    ACL: 'public-read'
  };

  try {
    console.log(`Creating S3 bucket: ${bucketName}...`);
    await s3.createBucket(params).promise();
    
    // Enable CORS for the bucket
    const corsParams = {
      Bucket: bucketName,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE'],
            AllowedOrigins: ['*'],
            ExposeHeaders: ['ETag']
          }
        ]
      }
    };
    
    await s3.putBucketCors(corsParams).promise();
    console.log(`S3 bucket created successfully: ${bucketName}`);
    return true;
  } catch (error) {
    if (error.code === 'BucketAlreadyOwnedByYou') {
      console.log(`Bucket ${bucketName} already exists and is owned by you`);
      return true;
    }
    console.error(`Error creating S3 bucket ${bucketName}:`, error);
    return false;
  }
};

// Create bucket for food stall images
createBucket(FOOD_STALLS_BUCKET)
  .then(() => {
    console.log('S3 setup completed');
  })
  .catch((error) => {
    console.error('Error setting up S3:', error);
  });