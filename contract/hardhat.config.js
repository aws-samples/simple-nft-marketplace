const AWSHttpProvider = require('@aws/web3-http-provider');
require('@nomiclabs/hardhat-ethers');
require('@nomiclabs/hardhat-web3');

extendEnvironment((hre) => {
  if (hre.network.name === 'amb') {
    const endpoint = process.env.AMB_HTTP_ENDPOINT;
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
