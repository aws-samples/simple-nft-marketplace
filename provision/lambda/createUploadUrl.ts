import * as lambda from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3({ signatureVersion: 'v4' });
const bucket = process.env.BUCKET_NAME;
const assetDomain = process.env.ASSET_DOMAIN;

exports.handler = async (_event: lambda.APIGatewayProxyEvent): Promise<lambda.APIGatewayProxyResult> => {
  const key = uuidv4();
  const params = { Bucket: bucket, Key: `assets/${key}` };
  const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
  const assetUrl = `https://${assetDomain}/assets/${key}`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ uploadUrl, assetUrl }),
  };
}
