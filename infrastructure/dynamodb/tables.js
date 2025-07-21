const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Check if credentials are available
if (!process.env.AWS_ACCESS_KEY || !process.env.AWS_SECRET_KEY) {
  console.error('AWS credentials not found in environment variables!');
  console.error('Please make sure your .env file contains AWS_ACCESS_KEY and AWS_SECRET_KEY');
  process.exit(1);
}

// Configure AWS SDK with credentials from .env
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  // Disable EC2 metadata service fallback
  maxRetries: 0,
  httpOptions: {
    timeout: 5000, // 5 seconds
    connectTimeout: 5000
  }
});

const dynamodb = new AWS.DynamoDB();

// Users Table
const createUsersTable = async () => {
  const params = {
    TableName: 'Users',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'email', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'EmailIndex',
        KeySchema: [
          { AttributeName: 'email', KeyType: 'HASH' }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  };

  try {
    await dynamodb.createTable(params).promise();
    console.log('Users table created successfully');
  } catch (error) {
    if (error.code === 'ResourceInUseException') {
      console.log('Users table already exists');
    } else {
      console.error('Error creating Users table:', error);
    }
  }
};

// Food Stalls Table
const createFoodStallsTable = async () => {
  const params = {
    TableName: 'FoodStalls',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'owner_id', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'OwnerIndex',
        KeySchema: [
          { AttributeName: 'owner_id', KeyType: 'HASH' }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  };

  try {
    await dynamodb.createTable(params).promise();
    console.log('FoodStalls table created successfully');
  } catch (error) {
    if (error.code === 'ResourceInUseException') {
      console.log('FoodStalls table already exists');
    } else {
      console.error('Error creating FoodStalls table:', error);
    }
  }
};

// Menu Items Table
const createMenuItemsTable = async () => {
  const params = {
    TableName: 'MenuItems',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'food_stall_id', AttributeType: 'S' },
      { AttributeName: 'category', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'FoodStallIndex',
        KeySchema: [
          { AttributeName: 'food_stall_id', KeyType: 'HASH' }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      },
      {
        IndexName: 'CategoryIndex',
        KeySchema: [
          { AttributeName: 'food_stall_id', KeyType: 'HASH' },
          { AttributeName: 'category', KeyType: 'RANGE' }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  };

  try {
    await dynamodb.createTable(params).promise();
    console.log('MenuItems table created successfully');
  } catch (error) {
    if (error.code === 'ResourceInUseException') {
      console.log('MenuItems table already exists');
    } else {
      console.error('Error creating MenuItems table:', error);
    }
  }
};

// Reviews Table
const createReviewsTable = async () => {
  const params = {
    TableName: 'Reviews',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'food_stall_id', AttributeType: 'S' },
      { AttributeName: 'user_id', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'FoodStallIndex',
        KeySchema: [
          { AttributeName: 'food_stall_id', KeyType: 'HASH' }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      },
      {
        IndexName: 'UserReviewIndex',
        KeySchema: [
          { AttributeName: 'food_stall_id', KeyType: 'HASH' },
          { AttributeName: 'user_id', KeyType: 'RANGE' }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  };

  try {
    await dynamodb.createTable(params).promise();
    console.log('Reviews table created successfully');
  } catch (error) {
    if (error.code === 'ResourceInUseException') {
      console.log('Reviews table already exists');
    } else {
      console.error('Error creating Reviews table:', error);
    }
  }
};

// Create all tables
const createAllTables = async () => {
  console.log('Creating DynamoDB tables with credentials from .env file...');
  console.log(`Using region: ${AWS.config.region}`);
  
  try {
    await createUsersTable();
    await createFoodStallsTable();
    await createMenuItemsTable();
    await createReviewsTable();
    console.log('All tables created or already exist');
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }
};

createAllTables();