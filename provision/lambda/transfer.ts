import * as lambda from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const transferJobName = process.env.TRANSFER_JOB_NAME;
const tableName = process.env.TABLE_JOB;
const ddb = new AWS.DynamoDB();
const lambdaFunction = new AWS.Lambda();

interface Transfer {
  toAddress: string;
}

exports.handler = async (event: lambda.APIGatewayProxyEvent): Promise<lambda.APIGatewayProxyResult> => {
  const transfer: Transfer = JSON.parse(event.body);
  const tokenId = event.pathParameters.id;
  const username = event.requestContext.authorizer.claims['cognito:username'];
  const jobId = uuidv4();

  const paramsJobStatus = {
    TableName: tableName,
    Item: {
      jobId: { S: jobId },
      status: { S: 'RUNNING' },
    }
  };

  await ddb.putItem(paramsJobStatus).promise();
  await lambdaFunction.invoke({
    FunctionName: transferJobName,
    InvocationType: 'Event',
    Payload: JSON.stringify({
      jobId,
      username,
      toAddress: transfer.toAddress,
      tokenId,
    }),
  }).promise();

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ jobId }),
  };
};
