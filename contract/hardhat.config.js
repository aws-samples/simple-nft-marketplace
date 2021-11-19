const AWSHttpProvider = require('@aws/web3-http-provider');
require('@nomiclabs/hardhat-ethers');
require('@nomiclabs/hardhat-web3');

const getAmbEndpoint = () => {
  if (!process.env.AMB_HTTP_ENDPOINT) {
    console.error(`Environment variable AMB_HTTP_ENDPOINT is not set.

Add the AMB_HTTP_ENDPOINT by running the following, replacing <node id> and <region>
with your AMB node ID and region, respectively.

\`\`\`
export AMB_HTTP_ENDPOINT=https://<node id>.ethereum.managedblockchain.<region>.amazonaws.com
\`\`\`
`)
  }
  // The AWS console copies the endpoint without the required https:// prefix
  if (!process.env.AMB_HTTP_ENDPOINT.startsWith('https://')) {
    // Add https:// prefix if it doesn't already exist
    console.debug('Adding https:// prefix to AMB_HTTP_ENDPOINT');
    return `https://${process.env.AMB_HTTP_ENDPOINT}`;
  } else {
    return process.env.AMB_HTTP_ENDPOINT;
  }
}


extendEnvironment((hre) => {
  if (hre.network.name === 'amb') {
    const endpoint = getAmbEndpoint();
    const Web3 = require('web3');
    hre.Web3 = Web3;
    hre.web3 = new Web3(new AWSHttpProvider(endpoint));
  }
});

task('account', 'Print address and private key of primary account', async (taskArgs, hre) => {
  const account = hre.web3.eth.accounts.create();
  console.log('Address', account.address);
  console.log('PrivateKey', account.privateKey);
});

module.exports = {
  solidity: "0.8.4",
  networks: {
    hardhat: {},
    amb: {
      url: process.env.AMB_HTTP_ENDPOINT || 'dummy',
    },
  },
};
