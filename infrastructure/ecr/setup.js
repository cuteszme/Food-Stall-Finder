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

const ecr = new AWS.ECR();

// Repository names
const API_REPOSITORY_NAME = 'food-stall-finder-api';

// Create ECR repository
const createRepository = async (repositoryName) => {
  const params = {
    repositoryName: repositoryName
  };

  try {
    console.log(`Creating ECR repository: ${repositoryName}...`);
    const data = await ecr.createRepository(params).promise();
    console.log(`ECR repository created successfully: ${repositoryName}`);
    return data.repository.repositoryUri;
  } catch (error) {
    if (error.code === 'RepositoryAlreadyExistsException') {
      console.log(`Repository ${repositoryName} already exists`);
      
      // Get repository URI
      const describeParams = {
        repositoryNames: [repositoryName]
      };
      const describeData = await ecr.describeRepositories(describeParams).promise();
      return describeData.repositories[0].repositoryUri;
    }
    console.error(`Error creating ECR repository ${repositoryName}:`, error);
    throw error;
  }
};

// Create repository for API
createRepository(API_REPOSITORY_NAME)
  .then((repositoryUri) => {
    console.log(`ECR setup completed. Repository URI: ${repositoryUri}`);
    console.log('\nTo push your Docker image to ECR:');
    console.log(`1. aws ecr get-login-password --region ${process.env.AWS_REGION || 'us-east-1'} | docker login --username AWS --password-stdin ${repositoryUri.split('/')[0]}`);
    console.log(`2. docker tag food-stall-finder-api:latest ${repositoryUri}:latest`);
    console.log(`3. docker push ${repositoryUri}:latest`);
  })
  .catch((error) => {
    console.error('Error setting up ECR:', error);
  });