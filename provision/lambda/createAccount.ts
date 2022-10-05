import * as lambda from "aws-lambda";
import * as AWS from "aws-sdk";
import * as mysql from "mysql2/promise";

const useMysql = process.env.USE_MYSQL;
const ambEndpoint = process.env.AMB_HTTP_ENDPOINT;
const tableName = process.env.TABLE_PRIVATE_KEY;
const ddb = new AWS.DynamoDB();

exports.handler = async (
  event: lambda.CognitoUserPoolTriggerEvent
): Promise<lambda.CognitoUserPoolTriggerEvent> => {
  const username = event.userName;
  const AWSHttpProvider = require("@aws/web3-http-provider");
  const Web3 = require("web3");
  const web3 = new Web3(new AWSHttpProvider(ambEndpoint));
  const account = web3.eth.accounts.create();

  const params = {
    TableName: tableName,
    Item: {
      id: { S: username },
      key: { S: account.privateKey },
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
        " (`id`, `key`) VALUES ('" +
        username +
        "', '" +
        account.privateKey +
        "')"
    );
  } else {
    await ddb.putItem(params).promise();
  }

  return event;
};
