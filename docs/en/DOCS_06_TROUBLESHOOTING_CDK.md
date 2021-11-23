# Troubleshooting CDK Errors

## Environment variable CONTRACT_ADDRESS is not set

When running `cdk bootstrap` you receive an error `Environment variable CONTRACT_ADDRESS is not set.`

**Solution:**  CDK is trying to compile the existing stack (For which we have not yet
set the required export variables) before deploying the bootstrap stack.
try the following commands instead to create and directly deploy the bootstrap stack:

`cdk bootstrap --show-template > bootstrap-template.yaml`

`aws cloudformation create-stack --stack-name CDKToolkit --template-body file://bootstrap-template.yaml`

## AccessDenied when calling the CreateStack operation

When running `aws cloudformation create-stack..` command you receive an error
`An error occurred (AccessDenied) when calling the CreateStack operation:
User: arn:aws:iam:..`

**Solution:** The credentials for the IAM user that you are using to deploy do
not have sufficient privilege to deploy a stack with CloudFormation.

```json lines
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "cloudformation:CreateStack",
        "cloudformation:DeleteStack",
        "cloudformation:DescribeStacks",
        "cloudformation:CreateChangeSet",
        "cloudformation:DescribeChangeSet",
        "cloudformation:ExecuteChangeSet",
        "cloudformation:DescribeStackEvents",
        "cloudformation:DeleteChangeSet",
        "cloudformation:GetTemplate"
      ],
      "Resource": "*",
      "Effect": "Allow"
    },
    {
      "Condition": {
        "ForAnyValue:StringEquals": {
          "aws:CalledVia": [
            "cloudformation.amazonaws.com"
          ]
        }
      },
      "Action": "*",
      "Resource": "*",
      "Effect": "Allow"
    },
    {
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::cdktoolkit-stagingbucket-*",
        "arn:aws:s3:::Bucket*"
      ],
      "Effect": "Allow"
    },
  ]
}
```

## Is the docker daemon running? error

When running `cdk deploy SimpleNftMarketplaceStack` you receive the following errors:

`Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?`

`ERRO[0000] Can't add file /Users/kyleesc/git/simple-nft-marketplace/provision/node_modules/@aws-cdk/aws-lambda-nodejs/lib/bundling.js to tar: io: read/write on closed pipe`

`ERRO[0000] Can't close tar writer: io: read/write on closed pipe`

**Solution:** The bundler for the lambda used to create contracts for your marketplace relies on docker to assemble
the assets.  Make sure Docker is running in your environment prior to running the 'cdk deploy ..' command.
