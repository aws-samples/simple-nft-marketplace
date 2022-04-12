#!/usr/bin/env node
import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { ProvisionStack } from '../lib/provision-stack';
import { FrontendStack } from '../lib/frontend-stack';
import { AmbStack } from '../lib/amb-stack';
import * as path from 'path';
import * as fs from 'fs';

const distPath = path.join(__dirname, '..', '..', 'marketplace', 'dist');

if (!fs.existsSync(distPath)) {
  console.log(`Create temp dist directory at ${distPath}`);
  fs.mkdirSync(distPath);
}

const app = new App();

new AmbStack(app, 'SimpleNftMarketplaceBlockchainNode');

new ProvisionStack(app, 'SimpleNftMarketplaceStack', {
  ambHttpEndpoint: process.env.AMB_HTTP_ENDPOINT || '',
  contractAddress: process.env.CONTRACT_ADDRESS || '',
});


new FrontendStack(app, 'SimpleNftMarketplaceFrontendStack', {});
