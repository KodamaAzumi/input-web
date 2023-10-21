'use strict';

const {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
} = require('@aws-sdk/client-dynamodb');
const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} = require('@aws-sdk/client-s3');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const { DateTime } = require('luxon');
	
const ALLOWED_ORIGINS = ['http://localhost:3000'];

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
  return s3Client.send(new PutObjectCommand({
    Body: body,
    Bucket: process.env.S3_BUCKET,
    ContentType: contentType,
    Key: key,
  }));
};

/**
 * getItem - DynamoDB からすでに投稿されている日記情報を取得する関数
 * @param {string} id - ユーザーの識別子
 * @param {string} timestamp - 日記の日付の文字列
 * @returns {Promise<QueryCommandOutput>} - DynamoDB から取得したアイテム
 */
const getItem = (id, timestamp) => {
  const queryCommand = new QueryCommand({
    ExpressionAttributeNames: {
      '#id': 'id',
      '#timestamp': 'timestamp',
    },
    ExpressionAttributeValues: {
      ':id': {
        S: id,
      },
      ':timestamp': {
        S: timestamp,
      },
    },
    KeyConditionExpression: '#id = :id AND #timestamp = :timestamp',
    Limit: 1,
    ProjectionExpression: 'version',
    TableName: process.env.DYNAMODB_TABLE,
  });

  return dynamoDBClient.send(queryCommand);
};

/**
 * @typedef {Object} DiaryEntity
 * @property {string} id - 日記の実態データの ID
 * @property {number} timestamp - UNIX タイムスタンプ
 */

/**
 * @typedef {Object} DiaryItem - 日記のアイテム
 * @property {Array<string>} entityIds - 日記の実態データのインデックス
 * @property {Object.<string, DiaryEntity>} entities - 日記の実態データ
 * @property {string} id - ユーザーの識別子
 * @property {string} timestamp - 日記の日付の文字列
 * @property {number} version - 日記が更新された回数
 */

/**
 * putItem - DynamoDB にアイテムを保存する関数
 * @param {DiaryItem} item - DynamoDB に保存するアイテム
 * @returns {Promise<PutItemCommandOutput>} - DynamoDB に保存したアイテム
 */
const putItem = (item) => {
  const putItemCommand = new PutItemCommand({
    Item: marshall(item),
    TableName: process.env.DYNAMODB_TABLE,
  });

  return dynamoDBClient.send(putItemCommand);
};

module.exports.create = async (event) => {
  const origin = event.headers.origin;
  const timestamp = DateTime.now().setZone('Asia/Tokyo').toFormat('yyyy-MM-dd');
  const { id, entityIds, entities } = JSON.parse(event.body);
  const valid = validate(JSON.parse(event.body));
  let version = 0;
  let headers = {
    'Access-Control-Allow-Origin': '*',
  };

  if (ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = true;
  }

  try {
    // クライアントから送られた値にバリデーションエラーがあればエラーを返して終了
    if (!valid) {
      throw validate.errors;
    }

    // バージョンの取得
    const response = await getItem(id, timestamp);

    if (response.Items.length > 0) {
      // 取得したデータを処理しやすいフォーマットに変換する
      const [unmarshalledItem] = response.Items.map((item) => unmarshall(item));
      // すでに日記が存在している場合は、バージョンを更新する
      version = unmarshalledItem.version + 1;
    }

    // 文字情報にバージョンを付与する処理
    const versionedEntityIds = entityIds.map((entityId) => {
      // 文字情報にバージョンが付与されていない場合は、バージョンを付与する
      if (!entityId.includes('v')) {
        const versionedEntityId = `${entityId}v${version}`;
        const entity = entities[entityId];

        // 画像を持つ文字情報かどうかの情報を付与
        entity.hasImage = entity.hasOwnProperty('image');

        // バージョンを付与した文字情報の実態を追加
        entities[versionedEntityId] = entity;

        // バージョンを付与した文字情報の実態を追加したので、元の文字情報は削除
        delete entities[entityId];

        return versionedEntityId;
      }

      // すでにバージョンが付与されている場合は、そのまま返す
      return entityId;
    });

    //画像を保存する手続きを行う
    const putObjectCommandOutputs = versionedEntityIds.map((entityId) => {
      const entity = entities[entityId];

      // 画像を持つ保存したことない文字列かどうかを判定（本来このAPIには不要だがPUTで流用するために記述）
      if (entityId.includes(`v${version}`) && entity.hasOwnProperty('image')) {
        const { image } = entity;
        const [_, contentType, extension, base64String] =
          image.match(base64RegExp);
        // 画像が保存されるパス
        const key = `${id}/${timestamp}/${entityId}.${extension}`;
        // リクエストボディに設定された画像データはBase64エンコードされているので、デコードする
        const body = Buffer.from(base64String, 'base64');
        // image キーはデータベースに保存する必要はないので削除
        delete entity.image;
        // 画像を保存する手続きを行う
        return putObject(body, contentType, key);
      }
    });

    // 保存する画像があれば、保存が完了してから次の処理に進む
    if (putObjectCommandOutputs.length > 0) {
      await Promise.all(putObjectCommandOutputs);
    }

    // DynamoDB をアイテムに保存する
    await putItem({
      entityIds: versionedEntityIds,
      entities,
      id,
      timestamp,
      version,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'OK' }),
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
