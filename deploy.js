#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const execa = require('execa');
const AWS = require('aws-sdk');
const chalk = require('chalk');

let credentials = {};

const setAWSCredentials = async () => {
  try {
    const credentialProviderChain = new AWS.CredentialProviderChain();
    credentials = await credentialProviderChain.resolvePromise();
  } catch (e) {
    console.error('Failed to get AWS credentials');
    throw e;
  }
};

const SETTINGS = path.resolve(__dirname, 'deploy-settings.json');

const PATHS = {
  contract: path.resolve(__dirname, './contract'),
  provision: path.resolve(__dirname, './provision'),
  marketplace: path.resolve(__dirname, './marketplace'),
  stackOutputs: path.resolve(__dirname, './provision/stack-outputs.json'),
  marketplaceEnv: path.resolve(__dirname, './marketplace/.env.local'),
  lambdaContract: path.resolve(
    __dirname,
    './provision/lambda/contracts/SimpleERC721.json'
  ),
  compiledContract: path.resolve(
    __dirname,
    './contract/artifacts/contracts/SimpleERC721.sol/SimpleERC721.json'
  ),
};

const logProgress = (description, complete = false) => {
  let msg = '';
  complete
    ? (msg = `🙌 ${description} Complete `)
    : (msg = `⌛ ${description} \n${'-'.repeat(process.stdout.columns)}`);
  console.log(chalk.bgGreen.bold.white(msg));
};

const keypress = async () => {
  process.stdin.setRawMode(true);
  return new Promise(resolve =>
    process.stdin.once('data', () => {
      process.stdin.setRawMode(false);
      resolve();
    })
  );
};

/**
 * @param {string} command
 * @param {execa.Options<string>} options
 */
const commandWithPipe = (command, options = {}) => {
  const cmd = execa.command(command, options);
  cmd.stdout.pipe(process.stdout);
  cmd.stderr.pipe(process.stderr);
  return cmd;
};

const writeToSettings = async (key, value) => {
  await fs.ensureFile(SETTINGS);
  const settings = await fs.readJson(SETTINGS, { throws: false });
  await fs.writeJSON(SETTINGS, { ...settings, [key]: value });
};

const getFromSettings = async key => {
  try {
    await fs.ensureFile(SETTINGS);
    const settings = await fs.readJson(SETTINGS, { throws: false });
    return settings && settings[key];
  } catch (e) {
    console.error('Failed to read settings file');
    throw e;
  }
};

const getFromStackOutput = async (stack, key) => {
  try {
    await fs.ensureFile(PATHS.stackOutputs);
    const outputs = await fs.readJSON(PATHS.stackOutputs);
    return outputs[stack][key];
  } catch (e) {
    console.error('Failed to read from stack outputs');
    throw e;
  }
};

const copyStackOutputToSettings = async (stack, outputKey, settingsKey) => {
  const stackOutputValue = await getFromStackOutput(stack, outputKey);
  await writeToSettings(settingsKey, stackOutputValue);
};

const markAsComplete = async name => {
  await writeToSettings(name, true);
};

const checkBin = async ({ bin, install }) => {
  console.log(`Checking if ${bin} is installed`);
  try {
    await execa.command(`${bin} --version`);
    console.log(`${bin} found, skipping install`);
    return true;
  } catch (e) {
    console.log(`${bin} not found, installing with "${install}"`);
    await execa.command(install);
    return false;
  }
};

const checkDependencies = async () => {
  logProgress('Checking dependencies');
  await checkBin({ bin: 'cdk', install: 'npm install -g aws-cdk' });
  logProgress('Checking dependencies', true);
};

const compileContract = async () => {
  logProgress('Compile Contract');
  await commandWithPipe('npx hardhat compile', {
    cwd: PATHS.contract,
  });
  await fs.copy(PATHS.compiledContract, PATHS.lambdaContract, {
    overwrite: true,
  });
  logProgress('Compile Contract', true);
};

const createAccount = async () => {
  logProgress('Create Account');
  const account = commandWithPipe('npx hardhat account', {
    cwd: PATHS.contract,
  });
  const { stdout } = await account;
  const [address] = stdout.match(/(0x[a-fA-F0-9]{40})/);
  const [privateKey] = stdout.match(/(0x[a-fA-F0-9]{64})/);
  if (!address) throw new Error('Unable to parse ethereum address');
  if (!privateKey) throw new Error('Unable to parse ethereum private key');
  await writeToSettings('address', address);
  await writeToSettings('privateKey', privateKey);
  logProgress('Create Account', true);
};

const deployAmbNode = async () => {
  logProgress('Deploy Amazon Managed Blockchain Node');
  console.log(
    chalk.green.bold(
      'Press any key to begin deploying AMB node. NOTE: This can take up to 30 minutes.'
    )
  );
  await keypress();
  await commandWithPipe('npx cdk bootstrap', {
    cwd: PATHS.provision,
    env: {
      // Placeholder values to prevent synth from failing
      AMB_HTTP_ENDPOINT: 'placeholder',
      CONTRACT_ADDRESS: 'placeholder',
    },
  });
  await commandWithPipe(
    `npx cdk deploy SimpleNftMarketplaceBlockchainNode \
  --require-approval never \
  --outputs-file ${PATHS.stackOutputs} \
`,
    {
      cwd: PATHS.provision,
      env: {
        // Placeholder values to prevent synth from failing
        AMB_HTTP_ENDPOINT: 'placeholder',
        CONTRACT_ADDRESS: 'placeholder',
      },
    }
  );
  await copyStackOutputToSettings(
    'SimpleNftMarketplaceBlockchainNode',
    'AmbHttpEndpoint',
    'ambEndpoint'
  );
  await copyStackOutputToSettings(
    'SimpleNftMarketplaceBlockchainNode',
    'DeployRegion',
    'region'
  );
  logProgress('Deploy Amazon Managed Blockchain Node', true);
};

const deployApi = async () => {
  logProgress('Deploy API');
  const contractAddress = await getFromSettings('contractAddress');
  const endpoint = await getFromSettings('ambEndpoint');
  await commandWithPipe(
    `npx cdk deploy SimpleNftMarketplaceStack \
  --require-approval never \
  --outputs-file ${PATHS.stackOutputs}`,
    {
      cwd: PATHS.provision,
      env: {
        AMB_HTTP_ENDPOINT: endpoint,
        CONTRACT_ADDRESS: contractAddress,
      },
    }
  );
  await copyStackOutputToSettings(
    'SimpleNftMarketplaceStack',
    'UserPoolId',
    'userPoolId'
  );
  await copyStackOutputToSettings(
    'SimpleNftMarketplaceStack',
    'UserPoolClientId',
    'userPoolClientId'
  );
  await copyStackOutputToSettings(
    'SimpleNftMarketplaceStack',
    'NftApiEndpoint',
    'nftApiEndpoint'
  );
  logProgress('Deploy API', true);
};

const promptForEther = async () => {
  const address = await getFromSettings('address');
  console.log(
    chalk.green
      .bold(`Navigate to https://faucet.ropsten.be/ to add ETH to your address:
${address}
Then press any key to continue...`)
  );
  await keypress();
};

const waitForEther = async () => {
  const address = await getFromSettings('address');
  const endpoint = await getFromSettings('ambEndpoint');
  const region = await getFromSettings('region');
  await commandWithPipe('node scripts/wait-for-balance.js', {
    cwd: PATHS.contract,
    env: {
      AMB_HTTP_ENDPOINT: endpoint,
      AWS_ACCESS_KEY_ID: credentials.accessKeyId,
      AWS_DEFAULT_REGION: region,
      AWS_SECRET_ACCESS_KEY: credentials.secretAccessKey,
      CONTRACT_ADDRESS: address,
    },
  });
};

const deployContract = async () => {
  logProgress('Deploy Contract');
  const privateKey = await getFromSettings('privateKey');
  const endpoint = await getFromSettings('ambEndpoint');
  const region = await getFromSettings('region');
  const contract = commandWithPipe(
    'npx hardhat run --network amb scripts/deploy-amb.js',
    {
      cwd: PATHS.contract,
      env: {
        AMB_HTTP_ENDPOINT: endpoint,
        AWS_ACCESS_KEY_ID: credentials.accessKeyId,
        AWS_DEFAULT_REGION: region,
        AWS_SECRET_ACCESS_KEY: credentials.secretAccessKey,
        PRIVATE_KEY: privateKey,
      },
    }
  );
  const { stdout } = await contract;
  const [contractAddress] = stdout.match(/(0x[a-fA-F0-9]{40})/);
  if (!contractAddress) throw new Error('Unable to parse contract address');
  await writeToSettings('contractAddress', contractAddress);
  logProgress('Deploy Contract', true);
};

const writeFrontEndVars = async () => {
  logProgress('Write UI Configuration');
  const region = await getFromSettings('region');
  const apiEndpoint = await getFromSettings('nftApiEndpoint');
  const userPoolId = await getFromSettings('userPoolId');
  const webClientId = await getFromSettings('userPoolClientId');
  const envLocal = `
VUE_APP_AWS_REGION=${region}
VUE_APP_API_ENDPOINT=${apiEndpoint}
VUE_APP_USER_POOL_ID=${userPoolId}
VUE_APP_USER_POOL_WEB_CLIENT_ID=${webClientId}
`;

  await fs.writeFile(PATHS.marketplaceEnv, envLocal);
  logProgress('Write UI Configuration', true);
};

const buildFrontEnd = async () => {
  logProgress('Build UI');
  await commandWithPipe('npm run build', {
    cwd: PATHS.marketplace,
  });
  logProgress('Build UI', true);
};

const deployFrontEnd = async () => {
  logProgress('Deploy UI');
  const deploy = commandWithPipe(
    `npx cdk deploy SimpleNftMarketplaceFrontendStack \
    --require-approval never`,
    {
      cwd: PATHS.provision,
      env: {
        // Placeholder values to prevent synth from failing
        AMB_HTTP_ENDPOINT: 'placeholder',
        CONTRACT_ADDRESS: 'placeholder',
      },
    }
  );
  const { stderr } = await deploy;
  const [cfnEndpoint] = stderr.match(/(https:\/\/[a-zA-Z0-9]+.cloudfront.net)/);
  await writeToSettings('cfnEndpoint', cfnEndpoint);
  logProgress('Deploy UI', true);
};

const runOnce = async fn => {
  if (await getFromSettings(fn.name)) {
    console.log(`Skipping ${fn.name} since it has already been completed`);
  } else {
    await fn();
    await markAsComplete(fn.name);
  }
};

const run = async () => {
  // Set AWS Credentials
  await setAWSCredentials();
  // Check dependencies
  await runOnce(checkDependencies);
  // Create account
  await runOnce(createAccount);
  // Deploy AMB node
  await deployAmbNode();
  // Compile contract
  await runOnce(compileContract);
  // Prompt for Contract ETH
  await promptForEther();
  // Wait for ETH
  await waitForEther();
  // Deploy contract
  await runOnce(deployContract);
  // Deploy API
  await deployApi();
  // Write Front End Config
  await writeFrontEndVars();
  // Build Front End
  await buildFrontEnd();
  // Deploy Front End
  await deployFrontEnd();
};

run()
  .then(async () => {
    console.log(
      chalk.green(`
Success!

Your Simple NFT Marketplace has now been deployed and the UI can be accessed at
the following URL:

${await getFromSettings('cfnEndpoint')}

To mint and send your first NFT, you can start by creating an account on the UI
as listed in the docs starting from here:

https://github.com/aws-samples/simple-nft-marketplace/blob/main/docs/en/DOCS_04_FRONTEND.md#create-an-account
    `)
    );
    process.exit();
  })
  .catch(e => {
    console.error(e);
    throw e;
  });
