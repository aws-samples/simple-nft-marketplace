# Front End Deployment (optional)

In this step we will deploy the front end using our CDK application. This step
assumes that the CDK pre-requisites from [Deploy API][1] have already been completed.

Perform all of the following steps in the [/marketplace](/marketplace) and
[/provision](/provision) directories.

## Front End Build

To build the front end, run the following command in the `/marketplace` directory.

```bash
npm run build
```

If the `/marketplace/dist` directory is created, it was succesful.

## Front End Deployment

Next we will deploy `/marketplace/dist` to S3 using CDK, making the content
accessible from CloudFront.

Switch to the `/provision` directory and run the following command.

```bash
cdk deploy SimpleNftMarketplaceFrontendStack
```

Deployment is now complete. If you access the CloudFront endpoint from the CDK
outputs in the terminal and the page loads without errors, it was successful.

[1]:./DOCS_03_DEPLOY_API.md
