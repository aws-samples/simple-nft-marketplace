import * as lambda from 'aws-lambda';
import * as path from 'path';
import * as AWS from 'aws-sdk';

const ambEndpoint = process.env.AMB_HTTP_ENDPOINT;
const contractAddress = process.env.CONTRACT_ADDRESS;
const SimpleERC721 = require(path.join(__dirname, 'contracts', 'SimpleERC721.json'));
const tableName = process.env.TABLE_PRIVATE_KEY;
const ddb = new AWS.DynamoDB();

exports.handler = async (event: lambda.APIGatewayProxyEvent): Promise<lambda.APIGatewayProxyResult> => {
  const username = event.requestContext.authorizer.claims['cognito:username'];
  const params = {
    TableName: tableName,
    Key: {
      id: { S: username },
    },
  };

  const res = await ddb.getItem(params).promise();
  const privateKey = res.Item.key.S;
  const AWSHttpProvider = require('@aws/web3-http-provider');
  const Web3 = require('web3');
  const web3 = new Web3(new AWSHttpProvider(ambEndpoint));
  const contract = new web3.eth.Contract(SimpleERC721.abi, contractAddress);
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);

  const tokenId = Number(event.pathParameters.id);
  const tokenUri = await contract.methods.tokenURI(tokenId).call();
  const owner = await contract.methods.ownerOf(tokenId).call();
  const marketplace = await contract.methods.marketplace(tokenId).call();

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      tokenId,
      tokenUri,
      owner,
      owned: account.address === owner,
      marketplace: {
        price: marketplace.price,
        listing: marketplace.listing,
        publisher: marketplace.publisher,
        royalty: marketplace.royalty,
      },
    }),
  };
}
