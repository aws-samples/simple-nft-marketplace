const { expect } = require('chai');
const { BigNumber } = require('ethers');

describe('SimpleERC721', function () {
  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    SimpleERC721 = await ethers.getContractFactory('SimpleERC721');
    SimpleERC721Deployed = await SimpleERC721.deploy();
  });

  it('Mint new token', async function () {
    await SimpleERC721Deployed.newItem('https://dummy.com', 1);
    const tokenURI = await SimpleERC721Deployed.tokenURI(1);
    expect(tokenURI).to.equal('https://dummy.com');
  });

  it('List on marketplace', async function () {
    await SimpleERC721Deployed.newItem('https://dummy.com', 1);
    await SimpleERC721Deployed.listOnMarketplace(1, 100000000);

    const marketplace = await SimpleERC721Deployed.marketplace(1);
    expect(marketplace.listing).to.equal(true);
    expect(marketplace.price.eq(BigNumber.from(100000000))).to.equal(true);
    expect(marketplace.publisher).to.equal(owner.address);
    expect(marketplace.royalty.eq(BigNumber.from(1))).to.equal(true);
  });

  it('Remove from marketplace', async function () {
    await SimpleERC721Deployed.newItem('https://dummy.com', 1);
    await SimpleERC721Deployed.listOnMarketplace(1, 100000000);
    await SimpleERC721Deployed.removeFromMarketplace(1);

    const marketplace = await SimpleERC721Deployed.marketplace(1);
    expect(marketplace.listing).to.equal(false);
    expect(marketplace.publisher).to.equal(owner.address);
    expect(marketplace.royalty.eq(BigNumber.from(1))).to.equal(true);
  });

  it('Purchase', async function () {
    await SimpleERC721Deployed.newItem('https://dummy.com', 1);
    await SimpleERC721Deployed.listOnMarketplace(1, 100000000);

    await SimpleERC721Deployed.connect(addr1).purchase(1, {
      value: 100000000,
    });

    const marketplace = await SimpleERC721Deployed.marketplace(1);
    expect(marketplace.listing).to.equal(false);
    expect(marketplace.publisher).to.equal(owner.address);
    expect(marketplace.royalty.eq(BigNumber.from(1))).to.equal(true);

    const ownerOfToken = await SimpleERC721Deployed.ownerOf(1);
    expect(ownerOfToken).to.equal(addr1.address);
  });

  it('Calculate fee', async function () {
    await SimpleERC721Deployed.newItem('https://dummy.com', 1);
    await SimpleERC721Deployed.listOnMarketplace(1, 100000000);

    // addr1 buy the token
    await SimpleERC721Deployed.connect(addr1).purchase(1, {
      value: 100000000,
    });

    // addr1 list the token on the marketplace
    await SimpleERC721Deployed.connect(addr1).listOnMarketplace(1, 1000000000000);

    const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
    const addr1BalanceBefore = await ethers.provider.getBalance(addr1.address);
    const addr2BalanceBefore = await ethers.provider.getBalance(addr2.address);

    // addr2 buy the token
    await SimpleERC721Deployed.connect(addr2).purchase(1, {
      value: 1000000000000,
    });

    const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
    const addr1BalanceAfter = await ethers.provider.getBalance(addr1.address);
    const addr2BalanceAfter = await ethers.provider.getBalance(addr2.address);

    // +1% (fee)
    expect(ownerBalanceAfter.sub(ownerBalanceBefore).toNumber()).to.eq(10000000000);

    // +99% (earning)
    expect(addr1BalanceAfter.sub(addr1BalanceBefore).toNumber()).to.eq(990000000000);

    // -100% + gas (payment)
    expect(addr2BalanceAfter.sub(addr2BalanceBefore).toNumber()).to.lt(-1000000000000);
  });
});
