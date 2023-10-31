'use strict';

const { DynamoDBClient, QueryCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const { DateTime } = require('luxon');

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
    }
  },
  required: ['id'],
  type: 'object',
};

// バリデーション関数を作成
const validate = ajv.compile(schema);

/**
 * getItems - DynamoDB からすでに投稿されている日記情報を取得する関数
 * @param {string} id - ユーザーの識別子
 * @param {string} beginTimestamp - 取得を開始する日記の日付の文字列
 * @param {string} endTimestamp - 取得を終了する日記の日付の文字列
 * @returns {Promise<QueryCommandOutput>} - DynamoDB から取得したアイテム
 */
const getItems = (id, beginTimestamp, endTimestamp) => {
  const queryCommand = new QueryCommand({
    ExpressionAttributeNames: {
      '#id': 'id',
      '#timestamp': 'timestamp',
    },
    ExpressionAttributeValues: {
      ':begin': {
        S: beginTimestamp,
      },
      ':end': {
        S: endTimestamp,
      },
      ':id': {
        S: id,
      },
    },
    KeyConditionExpression:
      '#id = :id AND ( #timestamp BETWEEN :begin AND :end )',
    ProjectionExpression: '#timestamp',
    TableName: process.env.DYNAMODB_TABLE,
  });

  return dynamoDBClient.send(queryCommand);
};

module.exports.list = async (event) => {
  const origin = event.headers.origin;
  const dateTime = DateTime.now().setZone('Asia/Tokyo');
  const beginTimestamp = dateTime.minus({ years: 1 }).toISO();
  const endTimestamp = dateTime.toISO();
  const { id } = event.pathParameters;
  const valid = validate({ id });
  const dates = [];
  const timestamps = {};
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

    const response = await getItems(id, beginTimestamp, endTimestamp);

    if (response.Items.length < 1) {
      return {
        statusCode: 200,
        body: JSON.stringify({ status: 'ZERO_RESULTS' }),
      };
    }

    // 取得したデータを処理しやすいフォーマットに変換する
    const items = response.Items.map((item) => unmarshall(item));
    
    items.map((item) => item.timestamp).forEach((timestamp) => {
      const date = timestamp.split('T')[0];
      
      if (!dates.includes(date)) {
        dates.push(date);
      }

      if (!timestamps[date]) {
        timestamps[date] = [];
      }
      
      timestamps[date].push(timestamp);
    });

    // 新しい順に並び替える
    dates.forEach((date) => {
      timestamps[date].sort().reverse();
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        dates,
        status: 'OK',
        timestamps,
        lastEvaluatedKey: response.LastEvaluatedKey,
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
