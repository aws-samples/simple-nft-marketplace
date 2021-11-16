import * as lambda from 'aws-lambda';
import * as AWS from 'aws-sdk';

const tableName = process.env.TABLE_JOB;
const ddb = new AWS.DynamoDB();

exports.handler = async (event: lambda.APIGatewayProxyEvent): Promise<lambda.APIGatewayProxyResult> => {
  const jobId = event.pathParameters.jobId;
  const params = {
    TableName: tableName,
    Key: {
      jobId: { S: jobId },
    },
  };
  const res = await ddb.getItem(params).promise();

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      jobId: res.Item.jobId.S,
      status: res.Item.status.S,
      result: res.Item.result ? res.Item.result.S : null,
    }),
  };
}
