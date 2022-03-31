import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as managedblockchain from 'aws-cdk-lib/aws-managedblockchain';

export class AmbStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const [firstAz] = Stack.of(this).availabilityZones;
    const region = Stack.of(this).region;

    const ambNode = new managedblockchain.CfnNode(this, 'Node', {
      networkId: 'n-ethereum-ropsten',
      nodeConfiguration: {
        availabilityZone: firstAz,
        instanceType: 'bc.t3.large',
      },
    });

    const ambHttpEndpoint = `https://${ambNode.attrNodeId}.ethereum.managedblockchain.${region}.amazonaws.com`;

    new CfnOutput(this, 'AmbHttpEndpoint', {
      value: ambHttpEndpoint,
      exportName: 'AmbHttpEndpoint',
    });

    new CfnOutput(this, 'DeployRegion', {
      value: region,
      exportName: 'DeployRegion',
    })
  }
}
