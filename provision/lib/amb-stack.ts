import * as cdk from '@aws-cdk/core';
import * as managedblockchain from '@aws-cdk/aws-managedblockchain';

export class AmbStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const [firstAz] = cdk.Stack.of(this).availabilityZones;
    const region = cdk.Stack.of(this).region;

    const ambNode = new managedblockchain.CfnNode(this, 'Node', {
      networkId: 'n-ethereum-ropsten',
      nodeConfiguration: {
        availabilityZone: firstAz,
        instanceType: 'bc.t3.large',
      },
    });

    const ambHttpEndpoint = `https://${ambNode.attrNodeId}.ethereum.managedblockchain.${region}.amazonaws.com`;

    new cdk.CfnOutput(this, 'AmbHttpEndpoint', {
      value: ambHttpEndpoint,
      exportName: 'AmbHttpEndpoint',
    });

    new cdk.CfnOutput(this, 'DeployRegion', {
      value: region,
      exportName: 'DeployRegion',
    })
  }
}
