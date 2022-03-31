import { Stack, StackProps, CfnOutput, Duration, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as agw from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cfn from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';

interface ProvisionStackProps extends StackProps {
  ambHttpEndpoint: string;
  contractAddress: string;
}

export class ProvisionStack extends Stack {
  constructor(scope: Construct, id: string, props: ProvisionStackProps) {
    super(scope, id, props);
    let {
      ambHttpEndpoint,
      contractAddress,
    } = props;

    if (!ambHttpEndpoint) {
      throw new Error(`Environment variable AMB_HTTP_ENDPOINT is not set.
\`\`\`
export AMB_HTTP_ENDPOINT=https://<node id>.ethereum.managedblockchain.<region>.amazonaws.com
\`\`\`
`)
    }

    if (!contractAddress) {
      throw new Error(`Environment variable CONTRACT_ADDRESS is not set.
\`\`\`
export CONTRACT_ADDRESS=0x...
\`\`\`
`)
    }
    const assetBucket = new s3.Bucket(this, 'AssetBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.HEAD,
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
            s3.HttpMethods.DELETE,
          ],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
    });

    const distribution = new cfn.Distribution(this, 'AssetDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(assetBucket),
      },
      additionalBehaviors: {
        '/assets/*': {
          origin: new origins.S3Origin(assetBucket),
        },
      },
    });

    const userPool = new cognito.UserPool(this, 'UserPool', {
      selfSignUpEnabled: true,
      signInAliases: {
        username: true,
        email: true
      },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const client = userPool.addClient('WebClient', {
      userPoolClientName: 'webClient',
      idTokenValidity: Duration.days(1),
      accessTokenValidity: Duration.days(1),
      authFlows: {
        userPassword: true,
        userSrp: true,
        custom: true,
      },
    });

    const privateKeyTable = new dynamodb.Table(this, 'PrivateKeyTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
    });

    const assetTable = new dynamodb.Table(this, 'AssetTable', {
      partitionKey: { name: 'key', type: dynamodb.AttributeType.STRING },
    });

    const jobTable = new dynamodb.Table(this, 'JobTable', {
      partitionKey: { name: 'jobId', type: dynamodb.AttributeType.STRING },
    });

    const defaultFuncProps = {
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      timeout: Duration.minutes(15),
      tracing: lambda.Tracing.ACTIVE,
      bundling: {
        commandHooks: {
          afterBundling(inputDir: string, outputDir: string): string[] {
            return [
              `cp -r ${inputDir}/lambda/contracts ${outputDir}`,
            ]
          },
          beforeBundling(_inputDir: string, _outputDir: string): string[] {
            return [];
          },
          beforeInstall(_inputDir: string, _outputDir: string): string[] {
            return [];
          },
        },
      },
    };

    const defaultFuncEnvironments = {
      AMB_HTTP_ENDPOINT: ambHttpEndpoint,
      CONTRACT_ADDRESS: contractAddress,
      TABLE_PRIVATE_KEY: privateKeyTable.tableName,
      TABLE_ASSET: assetTable.tableName,
      TABLE_JOB: jobTable.tableName,
      ASSET_DOMAIN: distribution.distributionDomainName,
      BUCKET_NAME: assetBucket.bucketName,
    };

    const createAccount = new lambdaNodejs.NodejsFunction(this, 'CreateAccount', {
      ...defaultFuncProps,
      entry: './lambda/createAccount.ts',
      environment: {
        ...defaultFuncEnvironments,
      },
    });

    privateKeyTable.grantWriteData(createAccount);

    userPool.addTrigger(cognito.UserPoolOperation.POST_CONFIRMATION, createAccount);

    const getAccount = new lambdaNodejs.NodejsFunction(this, 'GetAccount', {
      ...defaultFuncProps,
      entry: './lambda/getAccount.ts',
      environment: {
        ...defaultFuncEnvironments,
      },
    });

    privateKeyTable.grantReadData(getAccount);

    const createItemJob = new lambdaNodejs.NodejsFunction(this, 'CreateItemJob', {
      ...defaultFuncProps,
      entry: './lambda/createItemJob.ts',
      environment: {
        ...defaultFuncEnvironments,
      },
    });

    privateKeyTable.grantReadData(createItemJob);
    jobTable.grantWriteData(createItemJob);

    const createItem = new lambdaNodejs.NodejsFunction(this, 'CreateItem', {
      ...defaultFuncProps,
      entry: './lambda/createItem.ts',
      environment: {
        CREATE_ITEM_JOB_NAME: createItemJob.functionName,
        ...defaultFuncEnvironments,
      },
    });

    jobTable.grantWriteData(createItem);
    createItemJob.grantInvoke(createItem);

    const transferJob = new lambdaNodejs.NodejsFunction(this, 'TransferJob', {
      ...defaultFuncProps,
      entry: './lambda/transferJob.ts',
      environment: {
        ...defaultFuncEnvironments,
      },
    });

    privateKeyTable.grantReadData(transferJob);
    jobTable.grantWriteData(transferJob);

    const transfer = new lambdaNodejs.NodejsFunction(this, 'Transfer', {
      ...defaultFuncProps,
      entry: './lambda/transfer.ts',
      environment: {
        TRANSFER_JOB_NAME: transferJob.functionName,
        ...defaultFuncEnvironments,
      },
    });

    jobTable.grantWriteData(transfer);
    transferJob.grantInvoke(transfer);

    const listOnMarketplaceJob = new lambdaNodejs.NodejsFunction(this, 'ListOnMarketplaceJob', {
      ...defaultFuncProps,
      entry: './lambda/listOnMarketplaceJob.ts',
      environment: {
        ...defaultFuncEnvironments,
      },
    });

    privateKeyTable.grantReadData(listOnMarketplaceJob);
    jobTable.grantWriteData(listOnMarketplaceJob);

    const listOnMarketplace = new lambdaNodejs.NodejsFunction(this, 'ListOnMarketplace', {
      ...defaultFuncProps,
      entry: './lambda/listOnMarketplace.ts',
      environment: {
        LIST_ON_MARKETPLACE_JOB_NAME: listOnMarketplaceJob.functionName,
        ...defaultFuncEnvironments,
      },
    });

    jobTable.grantWriteData(listOnMarketplace);
    listOnMarketplaceJob.grantInvoke(listOnMarketplace);

    const removeFromMarketplaceJob = new lambdaNodejs.NodejsFunction(this, 'RemoveFromMarketplaceJob', {
      ...defaultFuncProps,
      entry: './lambda/removeFromMarketplaceJob.ts',
      environment: {
        ...defaultFuncEnvironments,
      },
    });

    privateKeyTable.grantReadData(removeFromMarketplaceJob);
    jobTable.grantWriteData(removeFromMarketplaceJob);

    const removeFromMarketplace = new lambdaNodejs.NodejsFunction(this, 'RemoveFromMarketplace', {
      ...defaultFuncProps,
      entry: './lambda/removeFromMarketplace.ts',
      environment: {
        REMOVE_FROM_MARKETPLACE_JOB_NAME: removeFromMarketplaceJob.functionName,
        ...defaultFuncEnvironments,
      },
    });

    jobTable.grantWriteData(removeFromMarketplace);
    removeFromMarketplaceJob.grantInvoke(removeFromMarketplace);

    const purchaseJob = new lambdaNodejs.NodejsFunction(this, 'PurchaseJob', {
      ...defaultFuncProps,
      entry: './lambda/purchaseJob.ts',
      environment: {
        ...defaultFuncEnvironments,
      },
    });

    privateKeyTable.grantReadData(purchaseJob);
    jobTable.grantWriteData(purchaseJob);

    const purchase = new lambdaNodejs.NodejsFunction(this, 'Purchase', {
      ...defaultFuncProps,
      entry: './lambda/purchase.ts',
      environment: {
        PURCHASE_JOB_NAME: purchaseJob.functionName,
        ...defaultFuncEnvironments,
      },
    });

    jobTable.grantWriteData(purchase);
    purchaseJob.grantInvoke(purchase);

    const getItem = new lambdaNodejs.NodejsFunction(this, 'GetItem', {
      ...defaultFuncProps,
      entry: './lambda/getItem.ts',
      environment: {
        ...defaultFuncEnvironments,
      },
    });

    privateKeyTable.grantReadData(getItem);

    const createUploadUrl = new lambdaNodejs.NodejsFunction(this, 'CreateUploadUrl', {
      ...defaultFuncProps,
      entry: './lambda/createUploadUrl.ts',
      environment: {
        ...defaultFuncEnvironments,
      },
    });

    assetBucket.grantReadWrite(createUploadUrl);

    const createAsset = new lambdaNodejs.NodejsFunction(this, 'CreateAsset', {
      ...defaultFuncProps,
      entry: './lambda/createAsset.ts',
      environment: {
        ...defaultFuncEnvironments,
      },
    });

    assetTable.grantWriteData(createAsset);

    const getAsset = new lambdaNodejs.NodejsFunction(this, 'GetAsset', {
      ...defaultFuncProps,
      entry: './lambda/getAsset.ts',
      environment: {
        ...defaultFuncEnvironments,
      },
    });

    assetTable.grantReadData(getAsset);

    const getJob = new lambdaNodejs.NodejsFunction(this, 'GetJob', {
      ...defaultFuncProps,
      entry: './lambda/getJob.ts',
      environment: {
        ...defaultFuncEnvironments,
      },
    });

    jobTable.grantReadData(getJob);

    this.addAMBFullAccess(createAccount);
    this.addAMBFullAccess(getAccount);
    this.addAMBFullAccess(createItemJob);
    this.addAMBFullAccess(getItem);
    this.addAMBFullAccess(transferJob);
    this.addAMBFullAccess(listOnMarketplaceJob);
    this.addAMBFullAccess(removeFromMarketplaceJob);
    this.addAMBFullAccess(purchaseJob);

    const authorizer = new agw.CognitoUserPoolsAuthorizer(this, 'Authorizer', {
      cognitoUserPools: [userPool],
    });

    const api = new agw.RestApi(this, 'NftApi', {
      defaultCorsPreflightOptions: {
        allowOrigins: agw.Cors.ALL_ORIGINS,
        allowMethods: agw.Cors.ALL_METHODS
      }
    });

    const account = api.root.addResource('account');
    const upload = api.root.addResource('upload');
    const assets = api.root.addResource('assets');
    const assetsKey = assets.addResource('{key}');
    const item = api.root.addResource('item');
    const itemId = item.addResource('{id}');
    const itemIdList = itemId.addResource('list');
    const itemIdUnlist = itemId.addResource('unlist');
    const itemIdPurchase = itemId.addResource('purchase');
    const job = api.root.addResource('job');
    const jobId = job.addResource('{jobId}');

    this.defineAPIRoute('GET', account, getAccount, authorizer);
    this.defineAPIRoute('GET', upload, createUploadUrl, authorizer);
    this.defineAPIRoute('POST', assets, createAsset, authorizer);
    this.defineAPIRoute('GET', assetsKey, getAsset);
    this.defineAPIRoute('POST', item, createItem, authorizer);
    this.defineAPIRoute('GET', itemId, getItem, authorizer);
    this.defineAPIRoute('POST', itemId, transfer, authorizer);
    this.defineAPIRoute('POST', itemIdList, listOnMarketplace, authorizer);
    this.defineAPIRoute('POST', itemIdUnlist, removeFromMarketplace, authorizer);
    this.defineAPIRoute('POST', itemIdPurchase, purchase, authorizer);
    this.defineAPIRoute('GET', jobId, getJob, authorizer);

    api.addGatewayResponse('Api4xx', {
      type: agw.ResponseType.DEFAULT_4XX,
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
      },
    });

    api.addGatewayResponse('Api5xx', {
      type: agw.ResponseType.DEFAULT_5XX,
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
      },
    });

    new CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
      exportName: 'userPoolId',
    });

    new CfnOutput(this, 'UserPoolClientId', {
      value: client.userPoolClientId,
      exportName: 'userPoolClientId',
    });

    new CfnOutput(this, 'NftApiEndpoint', {
      value: api.url,
      exportName: 'nftApiEndpoint',
    });
  }

  private addAMBFullAccess(func: lambdaNodejs.NodejsFunction): void {
    func.role?.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        'AmazonManagedBlockchainFullAccess'
      ),
    );
  }

  private defineAPIRoute(
    method: string,
    resource: agw.Resource,
    integration: lambdaNodejs.NodejsFunction,
    authorizer: agw.CognitoUserPoolsAuthorizer | null = null,
  ): void {
    if (authorizer) {
      resource.addMethod(method, new agw.LambdaIntegration(integration), {
        authorizationType: agw.AuthorizationType.COGNITO,
        authorizer,
      });
    } else {
      resource.addMethod(method, new agw.LambdaIntegration(integration));
    }
  }
}
