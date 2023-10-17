'use strict';

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} = require('@aws-sdk/client-s3');

const dynamoDBClientConfig = {};
const s3ClientConfig = {};

if (process.env.IS_OFFLINE) {
  dynamoDBClientConfig.region = 'localhost';
  dynamoDBClientConfig.endpoint = 'http://localhost:8000';

  s3ClientConfig.forcePathStyle = true;
  s3ClientConfig.credentials = {
    accessKeyId: 'S3RVER', // This specific key is required when working offline
    secretAccessKey: 'S3RVER',
  };
  s3ClientConfig.endpoint = 'http://localhost:4569';
}

const dynamoDBClient = new DynamoDBClient(dynamoDBClientConfig);
const s3Client = new S3Client(s3ClientConfig);

module.exports.hello = async (event) => {
  s3Client
    .send(
      new PutObjectCommand({
        Bucket: 'diary-dev',
        Key: '1234',
        Body: Buffer.from('abcd'),
      })
    )
    .then(() => console.log('ok'));

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
