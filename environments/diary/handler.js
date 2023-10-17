'use strict';

const AWS = require('aws-sdk');
const options = {};

if (process.env.IS_OFFLINE) {
  options.region = 'localhost';
  options.endpoint = 'http://localhost:8000';
}

const documentClient = new AWS.DynamoDB.DocumentClient(options);

module.exports.hello = async (event) => {
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
