import * as lambda from 'aws-lambda';
import * as AWS from 'aws-sdk';

const ambEndpoint = process.env.AMB_HTTP_ENDPOINT;
const tableName = process.env.TABLE_PRIVATE_KEY;
const ddb = new AWS.DynamoDB();

exports.handler = async (event: lambda.CognitoUserPoolTriggerEvent): Promise<lambda.CognitoUserPoolTriggerEvent> => {
  const username = event.userName;
  const AWSHttpProvider = require('@aws/web3-http-provider');
  const Web3 = require('web3');
  const web3 = new Web3(new AWSHttpProvider(ambEndpoint));
  const account = web3.eth.accounts.create();

  const params = {
    TableName: tableName,
    Item: {
      id: { S: username },
      key: { S: account.privateKey },
    }
  };

  await ddb.putItem(params).promise();

  return event;
}
