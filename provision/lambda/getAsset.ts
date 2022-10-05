import * as lambda from "aws-lambda";
import * as AWS from "aws-sdk";
import * as mysql from "mysql2/promise";

const useMysql = process.env.USE_MYSQL;
const tableName = process.env.TABLE_ASSET;
const ddb = new AWS.DynamoDB();

exports.handler = async (
  event: lambda.APIGatewayProxyEvent
): Promise<lambda.APIGatewayProxyResult> => {
  const key = event.pathParameters.key;
  const params = {
    TableName: tableName,
    Key: {
      key: { S: key },
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
      "SELECT id, title, description, url from " +
        tableName +
        " where id='" +
        key +
        "'"
    );

    console.log("row0: " + JSON.stringify(rows[0]));
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        title: JSON.parse(JSON.stringify(rows[0]))[0].title,
        description: JSON.parse(JSON.stringify(rows[0]))[0].description,
        url: JSON.parse(JSON.stringify(rows[0]))[0].url,
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
        title: res.Item.title.S,
        description: res.Item.description.S,
        url: res.Item.url.S,
      }),
    };
  }
};
