const hardhat = require('hardhat');

async function main () {
  const SimpleERC721 = await ethers.getContractFactory('SimpleERC721');
  const simpleERC721 = await SimpleERC721.deploy();
  await simpleERC721.deployed();

  console.log('Contract deployed at', simpleERC721.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
