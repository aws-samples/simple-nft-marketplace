const hardhat = require('hardhat');
const path = require('path');
const SimpleERC721 = require(path.join(__dirname, '..', 'artifacts', 'contracts', 'SimpleERC721.sol', 'SimpleERC721.json'));
const contract = new web3.eth.Contract(SimpleERC721.abi, { data: SimpleERC721.bytecode });

const privateKey = process.env.PRIVATE_KEY;
const account = web3.eth.accounts.privateKeyToAccount(privateKey);

(async () => {
  const tx = contract.deploy();
  const gas = await tx.estimateGas();
  const gasPrice = await web3.eth.getGasPrice();
  const createTransaction = await account.signTransaction(
    {
      data: tx.encodeABI(),
      gas,
      gasPrice,
    },
  );

  const createReceipt = await web3.eth.sendSignedTransaction(createTransaction.rawTransaction);
  console.log('Contract deployed at', createReceipt.contractAddress);
})();
