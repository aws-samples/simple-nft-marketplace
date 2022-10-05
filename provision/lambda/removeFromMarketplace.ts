import * as lambda from "aws-lambda";
import * as AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import * as mysql from "mysql2/promise";

const useMysql = process.env.USE_MYSQL;
const removeFromMarketplaceJobName =
  process.env.REMOVE_FROM_MARKETPLACE_JOB_NAME;
const tableName = process.env.TABLE_JOB;
const ddb = new AWS.DynamoDB();
const lambdaFunction = new AWS.Lambda();

exports.handler = async (
  event: lambda.APIGatewayProxyEvent
): Promise<lambda.APIGatewayProxyResult> => {
  const tokenId = event.pathParameters.id;
  const username = event.requestContext.authorizer.claims["cognito:username"];
  const jobId = uuidv4();

  const paramsJobStatus = {
    TableName: tableName,
    Item: {
      jobId: { S: jobId },
      status: { S: "RUNNING" },
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
        " (`id`, `status`) VALUES ('" +
        jobId +
        "', 'RUNNING')"
    );
  } else {
    await ddb.putItem(paramsJobStatus).promise();
  }

  await lambdaFunction
    .invoke({
      FunctionName: removeFromMarketplaceJobName,
      InvocationType: "Event",
      Payload: JSON.stringify({
        jobId,
        username,
        tokenId,
      }),
    })
    .promise();

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ jobId }),
  };
};
