import * as lambda from 'aws-lambda';
import * as AWS from 'aws-sdk';

const ambEndpoint = process.env.AMB_HTTP_ENDPOINT;
const tableName = process.env.TABLE_PRIVATE_KEY;
const ddb = new AWS.DynamoDB();

exports.handler = async (event: lambda.APIGatewayProxyEvent): Promise<lambda.APIGatewayProxyResult> => {
  const username = event.requestContext.authorizer.claims['cognito:username'];
  const params = {
    TableName: tableName,
    Key: {
      id: { S: username },
    },
  };

  const res = await ddb.getItem(params).promise();
  const privateKey = res.Item.key.S;

  const AWSHttpProvider = require('@aws/web3-http-provider');
  const Web3 = require('web3');
  const web3 = new Web3(new AWSHttpProvider(ambEndpoint));
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);

  const balanceEth = await web3.eth.getBalance(account.address);
  const balance = web3.utils.fromWei(balanceEth);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      address: account.address,
      privateKey: account.privateKey,
      balance,
    }),
  };
};
