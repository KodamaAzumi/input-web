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
// base64 にマッチする正規表現
const base64RegExp = /^data:(.+\/(.+));base64,(.*)$/;

/**
 * putObject
 */
const putObject = (body, contentType, key) => {
  console.log(key);
  return s3Client.send(new PutObjectCommand({
    Body: body,
    Bucket: process.env.S3_BUCKET,
    ContentType: contentType,
    Key: key,
  }));
};

module.exports.create = async (event) => {
  const timestamp = DateTime.now().setZone('Asia/Tokyo').toFormat('yyyy-MM-dd');
  const version = 0;
  const { id, entityIds, entities } = JSON.parse(event.body);

  const valid = validate(JSON.parse(event.body));

  // クライアントから送られた値にバリデーションエラーがあればエラーを返す
  if (!valid) {
    return {
      statusCode: 400,
      body: JSON.stringify(validate.errors),
    };
  }

  // バージョンの取得

  //画像を保存する手続きを行う
  const putObjectCommandOutputs = entityIds.map((entityId) => {
    // 画像を保存したことない文字列かどうかを判定（本来このAPIには不要だがPUTで流用するために記述）
    const entity = entities[entityId];

    if (!entityId.includes('v') && entity.hasOwnProperty('image')) {
      const { image } = entity;
      const [_, contentType, extension, base64String] =
        image.match(base64RegExp);
      // 画像が保存されるパス
      const key = `${id}/${timestamp}/${entityId}.${extension}`;
      // リクエストボディに設定された画像データはBase64エンコードされているので、デコードする
      const body = Buffer.from(base64String, 'base64');
      // 画像を保存する手続きを行う
      return putObject(body, contentType, key);
    }
  });

  // 保存する画像があれば、保存が完了してから次の処理に進む
  if (putObjectCommandOutputs.length > 0) {
    await Promise.all(putObjectCommandOutputs);
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
