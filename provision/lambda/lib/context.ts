import * as path from "path";
import * as AWS from "aws-sdk";
import * as mysql from "mysql2/promise";

const useMysql = process.env.USE_MYSQL;
const ambEndpoint = process.env.AMB_HTTP_ENDPOINT;
const contractAddress = process.env.CONTRACT_ADDRESS;
const SimpleERC721 = require(path.join(
  __dirname,
  "contracts",
  "SimpleERC721.json"
));
const tableNamePrivateKey = process.env.TABLE_PRIVATE_KEY;
const tableNameJob = process.env.TABLE_JOB;
const ddb = new AWS.DynamoDB();
const AWSHttpProvider = require("@aws/web3-http-provider");
const Web3 = require("web3");
const web3 = new Web3(new AWSHttpProvider(ambEndpoint));

interface Context {
  ddb: AWS.DynamoDB;
  web3: any;
  contract: any;
  account: any;
  contractAddress: string;
  SimpleERC721: any;
}

export const getContext = async (username: string): Promise<Context> => {
  const paramsPrivateKey = {
    TableName: tableNamePrivateKey,
    Key: {
      id: { S: username },
    },
  };

  let privateKey;
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
      "SELECT id, `private_key` from " +
        tableNamePrivateKey +
        " where id='" +
        username +
        "'"
    );
    privateKey = JSON.parse(JSON.stringify(rows[0]))[0].private_key;
  } else {
    const res = await ddb.getItem(paramsPrivateKey).promise();
    privateKey = res.Item.key.S;
  }

  const contract = new web3.eth.Contract(SimpleERC721.abi, contractAddress);
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);

  return {
    ddb,
    web3,
    contract,
    account,
    contractAddress,
    SimpleERC721,
  };
};

export const finalizeJob = async (
  jobId: string,
  status: string,
  result: string
): Promise<void> => {
  const paramsJobStatus = {
    TableName: tableNameJob,
    Item: {
      jobId: { S: jobId },
      status: { S: status },
      result: { S: result },
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
      "update " +
        tableNameJob +
        " set status='" +
        status +
        "', result='" +
        result +
        "' where id='" +
        jobId +
        "'"
    );
  } else {
    await ddb.putItem(paramsJobStatus).promise();
  }
};
