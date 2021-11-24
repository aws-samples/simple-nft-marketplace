# Deploy API

Deploy the API with the CDK code in the [`/provision`](/provision/) directory.

## CDK Pre-requisites

Please refer to the [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/api/latest/)
for the basics of CDK.

To deploy with CDK, you need a profile with AWS IAM permissions and Node.js.

### Installing AWS CDK

Execute the following command in the environment where Node.js can be executed
to install the AWS CDK CLI.

```bash
npm install -g aws-cdk
```

If `cdk --version` runs successfully, the installation is complete.

## Deploy Infrastructure

Switch to the [/provision](/provision) directory if you haven't already, then
run the following to install dependencies.

```bash
npm install
```

If you are new to CDK, you need to bootstrap. Please execute the following command.

```bash
cdk bootstrap
```

You will need to install the dependencies in the `provision/lambda` directory
as well. You can do this by running the following command.

```bash
cd lambda; npm install; cd -;
```

Then copy the compiled product of Contract (created in the previous section)
to `/lambda/contracts`. Run the following command.

```bash
cp ../contract/artifacts/contracts/SimpleERC721.sol/SimpleERC721.json lambda/contracts/.
```

Next, because our CDK project is written in Typescript, we must build it before we can
deploy it.  Build the CDK project by running the following command.

```bash
npm run build
```

The CDK project uses variables to populate the AMB Endpoint and Contract Address.
Therefore, before we can deploy the project, will set the required environment variables.
`AMB_HTTP_ENDPOINT` is the HTTP endpoint of the node we created in the previous
step [Creating a node for Ethereum Testnet: Ropsten][1] and `CONTRACT_ADDRESS` is
the address of the contract we deployed in [Deploy Contract][2].
Replace the values in the following command with the values saved from
previous steps and execute it.

```bash
export AMB_HTTP_ENDPOINT='https://<node id>.ethereum.managedblockchain.<region>.amazonaws.com'
export CONTRACT_ADDRESS='0x...'
```

Finally to deploy, execute the following command.

```bash
cdk deploy SimpleNftMarketplaceStack
```

After deployment is complete, you should see output values that look something like this.

```bash
> Outputs:
> SimpleNftMarketplaceStack.NftApiEndpoint8C6C6AD5 = https://********.execute-api.us-east-1.amazonaws.com/prod/
> SimpleNftMarketplaceStack.UserPoolClientId = 6en**************
> SimpleNftMarketplaceStack.UserPoolId = us-east-1_****
```

Save the output values for the API Gateway Endpoint, Cognito UserPool ID, and Client ID
as they will be needed in the upcoming steps.

## Next Step

### [Testing The Front End][3]

[1]:./DOCS_01_CREATE_AMB.md
[2]:./DOCS_02_DEPLOY_CONTRACT.md
[3]:./DOCS_04_FRONTEND.md
