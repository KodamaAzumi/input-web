'use strict';

const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} = require('@aws-sdk/client-s3');
const { marshall } = require('@aws-sdk/util-dynamodb');

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

/**
 * parse
 */
// const parse = (body) => {
//   const params = Buffer.from(body, 'base64').toString();
//   const result = {};

//   console.log(JSON.stringify(body));
//   console.log(JSON.stringify(params));
  
//   // params.split(/\&/g).forEach((param) => {
//   //   const [key, value] = decodeURIComponent(param).split(/\=/);

//   //   try {
//   //     result[key] = JSON.parse(value);
//   //   } catch (e) {
//   //     result[key] = value;
//   //   }
//   // });

//   // return result;
// }

// let getParamsFromBase64EncodedPOSTParams = (input) => {
//   let output = {};
//   // Decode the base64
//   let decoded = atob(input);

//   // Split the params by "&"
//   let params = decoded.split('&');
//   // Turn the params into an object and url decode the values
//   params.forEach((keyAndValue) => {
//     let keyValueArray = keyAndValue.split('=');
//     let key = keyValueArray[0];
//     let value = keyValueArray[1];
//     output[key] = decodeURIComponent((value + '').replace(/\+/g, '%20'));;
//   });
//   return output;
// };

module.exports.create = async (event) => {
  const timestamp = new Date().getTime();
  const { id, entityIds, entities } = JSON.parse(event.body);
  
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
