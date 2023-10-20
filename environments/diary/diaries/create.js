'use strict';

const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} = require('@aws-sdk/client-s3');
const { marshall } = require('@aws-sdk/util-dynamodb');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const { DateTime } = require('luxon');

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
const ajv = new Ajv();

addFormats(ajv);

// 検証スキーマを定義
const schema = {
  properties: {
    entities: {
      patternProperties: {
        '^c\\d+i\\d+(v\\d+)?$': {
          properties: {
            image: {
              pattern: '^data:image\\/(jpeg|png);base64,[A-Za-z0-9+/=]+$',
              type: 'string',
            },
            timestamp: {
              minimum: 0,
              type: 'integer',
            },
            value: {
              maxLength: 1,
              minLength: 1,
              type: 'string',
            },
          },
          type: 'object',
        },
      },
      type: 'object',
    },
    entityIds: {
      items: {
        pattern: '^c\\d+i\\d+(v\\d+)?$',
        type: 'string',
      },
      minItems: 1,
      type: 'array',
    },
    id: {
      format: 'uuid',
      type: 'string',
    },
  },
  required: ['entities', 'entityIds', 'id'],
  type: 'object',
};

// バリデーション関数を作成
const validate = ajv.compile(schema);

module.exports.create = async (event) => {
  const timestamp = DateTime.now().setZone('Asia/Tokyo').toFormat('yyyy-MM-dd');
  const version = 0;
  const { id, entityIds, entities } = JSON.parse(event.body);

  const valid = validate(JSON.parse(event.body));

  if (!valid) {
    console.log(validate.errors);
  } else {
    console.log('Valid!');
  }
  
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
};
