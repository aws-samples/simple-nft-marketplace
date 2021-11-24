const AWSHttpProvider = require('@aws/web3-http-provider');
const Web3 = require('web3');
const web3 = new Web3(new AWSHttpProvider(process.env.AMB_HTTP_ENDPOINT));

const contractAddress = process.env.CONTRACT_ADDRESS;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  let balance = 0;
  console.log(`Checking ETH balance for address ${contractAddress}`);
  while (balance === 0) {
    const delay = 5 * 1000;
    const balanceEth = await web3.eth.getBalance(contractAddress);
    balance = +web3.utils.fromWei(balanceEth);
    if (balance === 0) {
      console.log(
        `ETH balance for ${contractAddress} is 0. Sleeping for ${
          delay / 1000
        } seconds before checking again`
      );
      await sleep(delay);
    } else {
      console.log(
        `ETH balance for ${contractAddress} is ${balance}. We now have enough ETH to continue!`
      );
    }
  }
})();
