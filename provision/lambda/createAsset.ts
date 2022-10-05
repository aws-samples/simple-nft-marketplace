import * as lambda from "aws-lambda";
import * as AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import * as mysql from "mysql2/promise";

const useMysql = process.env.USE_MYSQL;
const tableName = process.env.TABLE_ASSET;
const ddb = new AWS.DynamoDB();

interface AssetMetadata {
  title: string;
  description: string;
  url: string;
}

exports.handler = async (
  event: lambda.APIGatewayProxyEvent
): Promise<lambda.APIGatewayProxyResult> => {
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

  if (useMysql == "1") {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
    });
    connection.connect();

    await connection.execute(
      "INSERT INTO " +
        tableName +
        " (`id`, `title`, `description`, `url`) VALUES ('" +
        key +
        "', '" +
        metadata.title +
        "', '" +
        metadata.description +
        "', '" +
        metadata.url +
        "')"
    );
  } else {
    await ddb.putItem(params).promise();
  }

  const assetMetadataUrl = `https://${event.requestContext.domainName}/${event.requestContext.stage}/assets/${key}`;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ assetMetadataUrl, key, ...metadata }),
  };
};
