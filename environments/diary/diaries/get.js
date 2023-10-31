'use strict';

const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ALLOWED_ORIGINS = ['http://localhost:3000'];

const dynamoDBClientConfig = {};

if (process.env.IS_OFFLINE) {
  dynamoDBClientConfig.region = 'localhost';
  dynamoDBClientConfig.endpoint = 'http://localhost:8000';
}

const dynamoDBClient = new DynamoDBClient(dynamoDBClientConfig);
const ajv = new Ajv();

addFormats(ajv);

// 検証スキーマを定義
const schema = {
  properties: {
    id: {
      format: 'uuid',
      type: 'string',
    },
    timestamp: {
      format: 'date-time',
      type: 'string',
    },
  },
  required: ['id', 'timestamp'],
  type: 'object',
};

// バリデーション関数を作成
const validate = ajv.compile(schema);

/**
 * getItem - DynamoDB からすでに投稿されている日記情報を取得する関数
 * @param {string} id - ユーザーの識別子
 * @param {string} timestamp - 日記の日付の文字列
 * @returns {Promise<QueryCommandOutput>} - DynamoDB から取得したアイテム
 */
const getItem = (id, timestamp) => {
  const getItemCommand = new GetItemCommand({
    Key: marshall({ id, timestamp }),
    TableName: process.env.DYNAMODB_TABLE,
  });

  return dynamoDBClient.send(getItemCommand);
};

module.exports.get = async (event) => {
  const origin = event.headers.origin;
  const { id, timestamp } = event.pathParameters;
  const valid = validate(event.pathParameters);
  let headers = {
    'Access-Control-Allow-Origin': '*',
  };

  if (ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = true;
  }

  try {
    if (!valid) {
      throw validate.errors;
    }

    const response = await getItem(id, timestamp);

    if (!response.hasOwnProperty('Item')) {
      return {
        statusCode: 200,
        body: JSON.stringify({status: 'ZERO_RESULTS'}),
      };
    }

    const item = unmarshall(response.Item);

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 'OK',
        ...item,
      }),
      headers,
    };
  } catch (error) {
    console.error(error);

    return {
      statusCode: 400,
      body: JSON.stringify({
        status: 'ERROR',
        error,
      }),
      headers,
    };
  }
};
