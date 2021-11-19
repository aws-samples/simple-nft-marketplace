# Deploy Contract

Next we will deploy the contract written in Solidity to Ethereum Testnet Ropsten.

**Perform all of the following steps in the `/contract` directory**

## Contract Overview

We will be deploying the contract with the filename of `SimpleERC721`. As the
name implies, `SimpleERC721` conforms to ERC721, an interface that can issue NFT
tokens. The implementation inherits [ERC721 from openzeppelin][1], but some have
their own implementations. The implementation content can be found [here][2].

## Compile Contract

After making sure our current working directory is [/contract/](/contract/),
we will start by installing the dependencies.

```bash
npm install
```

Then we will compile the contract using [hardhat](https://hardhat.org/).

```bash
npx hardhat compile
```

After compiling, you should see directories `contract/artifacts` and `contract/cache`.

## Verify build locally (optional)

The following steps utilize two terminal sessions, both running in the `/contract`
directory. We will refer to the terminal sessions as *"Terminal A"* and *"Terminal B"*
for the purpose of this step.

> Note: If you would like to skip this step, proceed to [Deploy to Ethereum Ropsten](#).

First, start the local JSON-RPC server by running the following commands in Terminal A.

```bash
npx hardhat node
```

Then run the following command in Terminal B to deploy the compiled `SimpleERC721`
to your local environment.

```bash
npx hardhat run --network localhost scripts/deploy.js
```

If successfull, you should see the following output in Terminal B where `0x...`
is the address where the contract was deployed. Copy this address, as we will
need it for the next step.

```bash
> Contract deployed at 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

Next, we will use the hardhat interactive console to issue an NFT token to the `SimpleERC721`
contract.

Run the following command in Terminal B to start the hardhat interactive console.

```bash
npx hardhat console --network localhost
```

Once the console is running, paste the following code line by line into Terminal B
and replace `<contract address>` with the address of the deployed contract we copied
in the previous step.

```js
const SimpleERC721 = await ethers.getContractFactory('SimpleERC721');
const contract = await SimpleERC721.attach('<contract address>');
await contract.newItem('dummy');
```

You have now issued a new NFT token. Normally, the `'dummy'` value would be in
URI format, but for verification purposes it is just a string.

The contract manages a unique ID value named tokenId internally. The tokenId is
incremented each time an NFT is issued and has a one-to-one association with the
NFT's URI. You can read from the Transaction log which tokenId was assigned, but
for this demonstration we will just pull by the tokenId of 1, since we know
only 1 has been created.

In Terminal B where we have our hardhat interactive console running, we will
retrieve the token by ID by running the following.

```js
await contract.tokenURI(1);
```

The console will output `'dummy'` since that was the value we set in the previous
step. You can now exit both Terminal A and Terminal B processes by pressing `Ctrl + C`
twice.

## Deploy to Ethereum Ropsten via Amazon Managed Blockchain

First, set the Amazon Managed Blockchain HTTP endpoint to an environment variable
in your terminal by running the following command. Replacing `<my-endpoint>` with
the endpoint copied from the instructions in the previous page of
[Creating a node for Ethereum Testnet Ropsten](./DOCS_01_CREATE_AMB.md).

```bash
export AMB_HTTP_ENDPOINT='<my-endpoint>'
```

Next, create an account for the owner to deploy the contract by executing the
following command.

```bash
npx hardhat account
```

The `Address` in the output is the address needed to send the token, and the
`PrivateKey` is the private key needed to sign the Transaction. `Address` is
generated from `PrivateKey`, so it has a one-to-one relationship. Be sure to
post this `Address` and `PrivateKey` somewhere as you will need them in subsequent
steps.

> Note: In a real world application, extreme caution should be taken with storing
> the `PrivateKey` to avoid any unauthorized access.

To deploy our contract, we have to pay the cost of gas in Ethereum. Therefore,
we need to deposit Ethereum on the `Address` we created above. There are several
services that distribute Ethereum on the Ropsten network for testing purposes.

Search google for `Ropsten Ethereum Faucet` and use a faucet to deposit Ethereum
to the `Address` we just created.

After the deposit is complete, run the following command to ste up an account to
deploy the contract.

Replace `<0x...>` with the contents of `PrivateKey` from the previous step.

```bash
export PRIVATE_KEY='<0x...>'
```

Next, set up AWS IAM permissions to connect to the Amazon Managed Blockchain if
you don't have access already. If you want to create a new IAM user, attach the
`AmazonManagedBLockchainFullAccess` policy. Set your AWS Access Key ID and AWS
Secret Access Key in your environment variables as follows: Each `<...>` needs
to be replaced with the appropriate value.

```bash
export AWS_ACCESS_KEY_ID='<...>'
export AWS_SECRET_ACCESS_KEY='<...>'
```

**IMPORTANT**: These access key environment variables must currently be set until
[aws-web3-http-provider/5](https://github.com/awslabs/aws-web3-http-provider/issues/5)
has been implemented.

Finally, run the following command to deploy `SimpleERC721` to Ethereum Ropsten
via Amazon Managed Blockchain.

```bash
npx hardhat run --network amb scripts/deploy-amb.js
```

> Note: Deployment time may take a while depending on network congestion

If deployed successfully, you will see an output similar to the following.

```bash
> Contract deployed at 0x...
```

Copy the contract address from the output and save it somewhere as you will need
it in subsequent steps.

> Note: The `Address` and `PrivateKey` of the account that deployed the contract
> will have owner priveleges on the contract and is normally a very important
> account when used in production.

## Next Step

### [Deploy API][3]

[1]:https://docs.openzeppelin.com/contracts/3.x/erc721
[2]:/contract/contracts/SimpleERC721.sol
[3]:./DOCS_03_DEPLOY_API.md
