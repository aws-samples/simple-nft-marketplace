import * as lambda from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const tableName = process.env.TABLE_ASSET;
const ddb = new AWS.DynamoDB();

interface AssetMetadata {
  title: string;
  description: string;
  url: string;
}

exports.handler = async (event: lambda.APIGatewayProxyEvent): Promise<lambda.APIGatewayProxyResult> => {
  const key = uuidv4();
  const metadata: AssetMetadata = JSON.parse(event.body);
  const params = {
    TableName: tableName,
    Item: {
      key: { S: key },
      title: { S: metadata.title },
      description: { S: metadata.description },
      url: { S: metadata.url },
    },
  };

  await ddb.putItem(params).promise();

  const assetMetadataUrl = `https://${event.requestContext.domainName}/${event.requestContext.stage}/assets/${key}`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ assetMetadataUrl, key, ...metadata }),
  };
}
