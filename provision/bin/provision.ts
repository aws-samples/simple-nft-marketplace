#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ProvisionStack } from '../lib/provision-stack';
import { FrontendStack } from '../lib/frontend-stack';
import * as path from 'path';
import * as fs from 'fs';

const distPath = path.join(__dirname, '..', '..', 'marketplace', 'dist');

if (!fs.existsSync(distPath)) {
  console.log(`Create temp dist directory at ${distPath}`);
  fs.mkdirSync(distPath);
}

const app = new cdk.App();
new ProvisionStack(app, 'SimpleNftMarketplaceStack', {});
new FrontendStack(app, 'SimpleNftMarketplaceFrontendStack', {});
