import * as algosdk from 'algosdk';
import { RouterContract, MockYieldContract } from '../src';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.localnet' });

async function deployToLocalnet() {
  console.log('🚀 Deploying contracts to LocalNet...');

  // Validate environment
  if (!process.env.ALGOD_SERVER || !process.env.ALGOD_TOKEN || !process.env.MNEMONIC) {
    throw new Error('Missing required environment variables in .env.localnet');
  }

  // Initialize Algorand client
  const algodClient = new algosdk.Algodv2(
    process.env.ALGOD_TOKEN,
    process.env.ALGOD_SERVER,
    process.env.ALGOD_PORT
  );

  const indexerClient = new algosdk.Indexer(
    process.env.ALGOD_TOKEN,
    process.env.ALGOD_SERVER,
    process.env.ALGOD_PORT ? parseInt(process.env.ALGOD_PORT) + 1000 : undefined
  );

  // Create creator account from mnemonic
  const creator = algosdk.mnemonicToSecretKey(process.env.MNEMONIC);

  console.log(`📝 Creator address: ${creator.addr}`);

  // Get suggested parameters
  const suggestedParams = await algodClient.getTransactionParams().do();

  // Step 1: Deploy Mock-Yield contract
  console.log('\n📋 Step 1: Deploying Mock-Yield contract...');
  const mockYieldAppId = await MockYieldContract.create(
    creator,
    algodClient,
    suggestedParams
  );
  console.log(`✅ Mock-Yield contract deployed with App ID: ${mockYieldAppId}`);

  // Step 2: Deploy Router contract
  console.log('\n📋 Step 2: Deploying Router contract...');
  const routerParams = await algodClient.getTransactionParams().do();
  const routerAppId = await RouterContract.create(
    creator,
    algodClient,
    routerParams
  );
  console.log(`✅ Router contract deployed with App ID: ${routerAppId}`);

  // Step 3: Create contract instances
  const mockYieldContract = new MockYieldContract(
    mockYieldAppId,
    algodClient,
    indexerClient
  );

  const routerContract = new RouterContract(
    routerAppId,
    algodClient,
    indexerClient
  );

  // Step 4: Configure Router to allow Mock-Yield contract
  console.log('\n📋 Step 3: Configuring Router to allow Mock-Yield contract...');
  await routerContract.setAllowed(creator, mockYieldAppId, true);
  console.log('✅ Mock-Yield contract is now allowed in Router');

  // Step 5: Set per-transaction cap (1 ALGO)
  console.log('\n📋 Step 4: Setting per-transaction cap...');
  await routerContract.setPerTxCap(creator, 1_000_000n); // 1 ALGO
  console.log('✅ Per-transaction cap set to 1 ALGO');

  // Step 6: Set Mock-Yield APY to 5% (500 basis points)
  console.log('\n📋 Step 5: Setting Mock-Yield APY...');
  await mockYieldContract.setApy(creator, 500); // 5%
  console.log('✅ Mock-Yield APY set to 5%');

  // Save deployment results
  const deploymentResult = {
    network: 'localnet',
    creator: creator.addr,
    mockYieldAppId,
    routerAppId,
    timestamp: new Date().toISOString()
  };

  console.log('\n📋 Deployment Summary:');
  console.log(JSON.stringify(deploymentResult, null, 2));

  // Update .env.localnet with deployed contract IDs
  const fs = require('fs');
  const envContent = fs.readFileSync('.env.localnet', 'utf8');
  const updatedEnvContent = envContent
    .replace(/ROUTER_APP_ID=.*/, `ROUTER_APP_ID=${routerAppId}`)
    .replace(/MOCK_YIELD_APP_ID=.*/, `MOCK_YIELD_APP_ID=${mockYieldAppId}`);

  fs.writeFileSync('.env.localnet', updatedEnvContent);
  console.log('\n✅ Updated .env.localnet with deployed contract IDs');

  console.log('\n🎉 LocalNet deployment completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Run the E2E test: pnpm e2e:localnet');
  console.log('2. Check contract status in LocalNet explorer');

  return deploymentResult;
}

// Handle execution
if (require.main === module) {
  deployToLocalnet()
    .then((result) => {
      console.log('\n✅ Deployment successful:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Deployment failed:', error);
      process.exit(1);
    });
}

export default deployToLocalnet;