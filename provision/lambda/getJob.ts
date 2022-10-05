import * as lambda from "aws-lambda";
import * as AWS from "aws-sdk";
import * as mysql from "mysql2/promise";

const useMysql = process.env.USE_MYSQL;
const tableName = process.env.TABLE_JOB;
const ddb = new AWS.DynamoDB();

exports.handler = async (
  event: lambda.APIGatewayProxyEvent
): Promise<lambda.APIGatewayProxyResult> => {
  const jobId = event.pathParameters.jobId;
  const params = {
    TableName: tableName,
    Key: {
      jobId: { S: jobId },
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

    const rows = await connection.query(
      "SELECT id, status, result from " +
        tableName +
        " where id='" +
        jobId +
        "'"
    );

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        jobId: rows[0][0],
        status: rows[0][1],
        result: rows[0][2] ? rows[0][2] : null,
      }),
    };
  } else {
    const res = await ddb.getItem(params).promise();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        jobId: res.Item.jobId.S,
        status: res.Item.status.S,
        result: res.Item.result ? res.Item.result.S : null,
      }),
    };
  }
};
