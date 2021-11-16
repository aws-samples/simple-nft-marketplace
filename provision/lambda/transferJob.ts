import * as path from 'path';
import * as AWS from 'aws-sdk';

const ambEndpoint = process.env.AMB_HTTP_ENDPOINT;
const contractAddress = process.env.CONTRACT_ADDRESS;
const SimpleERC721 = require(path.join(__dirname, 'contracts', 'SimpleERC721.json'));
const tableNamePrivateKey = process.env.TABLE_PRIVATE_KEY;
const tableNameJob = process.env.TABLE_JOB;
const ddb = new AWS.DynamoDB();

interface JobParams {
  jobId: string;
  username: string;
  toAddress: string;
  tokenId: number;
}

exports.handler = async (paramsJob: JobParams): Promise<void> => {
  try {
    const paramsPrivateKey = {
      TableName: tableNamePrivateKey,
      Key: {
        id: { S: paramsJob.username },
      },
    };

    const res = await ddb.getItem(paramsPrivateKey).promise();
    const privateKey = res.Item.key.S;
    const AWSHttpProvider = require('@aws/web3-http-provider');
    const Web3 = require('web3');
    const web3 = new Web3(new AWSHttpProvider(ambEndpoint));
    const contract = new web3.eth.Contract(SimpleERC721.abi, contractAddress);

    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    const tx = contract.methods.safeTransferFrom(account.address, paramsJob.toAddress, paramsJob.tokenId);
    const gas = await tx.estimateGas({ from: account.address });
    const signedTx = await account.signTransaction({
      to: contractAddress,
      data: tx.encodeABI(),
      gas,
    });

    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    const txHash = receipt.transactionHash;

    const paramsJobStatus = {
      TableName: tableNameJob,
      Item: {
        jobId: { S: paramsJob.jobId },
        status: { S: 'SUCCESS' },
        result: { S:  JSON.stringify({ txHash }) },
      }
    };

    await ddb.putItem(paramsJobStatus).promise();
  } catch (e) {
    console.error(e);
    const paramsJobStatus = {
      TableName: tableNameJob,
      Item: {
        jobId: { S: paramsJob.jobId },
        status: { S: 'ERROR' },
        result: { S:  JSON.stringify(e) },
      }
    };

    await ddb.putItem(paramsJobStatus).promise();
  }
};
