# Simple NFT Marketplace

This project provides sample code to build a simple NFT 
([Non-Fungible Token](https://aws.amazon.com/blockchain/nfts-explained/)) 
based marketplace with Amazon Managed Blockchain. 

NFTs are cryptoassets in which each token is unique, and therefore able to create a relationship, or contract,
between a specific unique token, and a specific asset - including physical asset, virtual asset and more.
This contract allows ownership of a digital asset to be proven.  For this reason, NFTs are also known as *deeds*.

While there are multiple standards for non-fungible tokens, this exercise will use
the Ethereum Blockchain network, and ERC721 standard for non-fungible tokens.

To be able to create the required contracts, we will:
1. Create a Node connected to a Blockchain network
2. Manually Generate, verify and deploy a contract.
3. Deploy an API to automate the process
4. Create a Front End that utilizes the API
5. Deploy the MarketPlace Front End

You will use the following tool set:
- Git, and your OS Command Line
- Node.js and npm
- the AWS CLI and AWS Console
- AWS CDK to deploy backend API ([/provision](/provision))
- Contract written in Solidity ([/contract](/contract))
- Marketplace web UI ([/marketplace](/marketplace))

This sample code is not a complete marketplace. Some critical features have not been implemented. It is just a sample of simple NFT creation/transfer using Amazon Managed Blockchain. There is no function to set prices or buy/sell tokens. The only thing implemented is the transfer between accounts. Do NOT use this codes in your production workloads.

## Architecture

![Architecture](/imgs/simple-nft-marketplace.png)

## Docs

- [Documentation (English)](/docs/en)
- [ドキュメント (日本語)](/docs/ja)

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.
