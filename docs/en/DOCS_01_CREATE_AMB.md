# Creating a node for Ethereum Testnet: Ropsten

To get started, create an Ethereum node in the AWS Console for [Amazon Managed Blockchain][1].

For *Blockchain Network*, select **Ethereum Testnet: Ropsten** and use the remaining
configuration default values that have already been populated then select **Create Node**
as outlined in the image below.

![Creating the node in the AWS Console](./img/create-node.png)

> Note: The creation of the node can take up to 30 minutes.

When the node creation is complete, click the node ID to open the node details
page and copy the HTTP endpoint as pictured below, as it will be needed in our
next step.

![Getting the HTTP endpoint](./img/get-http-endpoint.png)

## Next Step

### [Deploy Contract](./DOCS_02_DEPLOY_CONTRACT.md)

[1]:https://console.aws.amazon.com/managedblockchain/home#joinNetwork
