import * as lambda from 'aws-lambda';
import * as AWS from 'aws-sdk';

const tableName = process.env.TABLE_ASSET;
const ddb = new AWS.DynamoDB();

exports.handler = async (event: lambda.APIGatewayProxyEvent): Promise<lambda.APIGatewayProxyResult> => {
  const key = event.pathParameters.key;
  const params = {
    TableName: tableName,
    Key: {
      key: { S: key },
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
      title: res.Item.title.S,
      description: res.Item.description.S,
      url: res.Item.url.S,
    }),
  };
}
