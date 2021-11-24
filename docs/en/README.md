# Overview

All of the following documentation assumes that you are running on a UNIX based
environment. If you do not have a UNIX based command execution environment, you
can also use [AWS Cloud9](https://aws.amazon.com/cloud9/).

## Quick Start

### Install Dependencies

To get started run the following command **in the root of this repository** to
install the required dependencies.

```bash
npm install
```

### Set your AWS profile

The AWS profile currently active on your shell will be used to deploy the infrastructure,
if no profile is specified, the `default` profile will be used.

To specify a profile other than `default` to be used, run the following command
replacing `my-profile` with your profile name.

```bash
export AWS_PROFILE='my-profile'
```

### Run the deploy script

Run the deploy script and follow any prompts by running the following command.

```bash
./deploy.js
```

### Cleaning Up

> :warning: The peer node used in this example can cost as much as $0.174 per hour
> depending on your region. It is recommended to remove these resources once they
> are no longer being used.

To remove all of the resources created from this example, run the following command
from the root of the repository.

```bash
npm run cleanup
```

This will use CDK to remove the infrastructure we deployed, as well as remove the
`deploy-settings.json` file created by the deploy script.

## Step by Step Instructions

1. [Creating a node for Ethereum Testnet: Ropsten](./DOCS_01_CREATE_AMB.md)
2. [Deploy Contract](./DOCS_02_DEPLOY_CONTRACT.md)
3. [Deploy API](./DOCS_03_DEPLOY_API.md)
4. [Testing the Front End (local)](./DOCS_04_FRONTEND.md)
5. [Front End Deployment (optional)](./DOCS_05_DEPLOY_FRONTEND.md)

## Troubleshooting

See [Troubleshooting CDK Errors](./DOCS_06_TROUBLESHOOTING_CDK.md) for troubleshooting
details.
