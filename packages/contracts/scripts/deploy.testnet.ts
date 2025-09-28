import * as algosdk from 'algosdk';
import { RouterContract, MockYieldContract } from '../src';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.testnet' });

async function deployToTestnet() {
  console.log('🚀 Deploying contracts to TestNet...');

  // Validate environment
  if (!process.env.ALGOD_SERVER || !process.env.MNEMONIC) {
    throw new Error('Missing required environment variables in .env.testnet');
  }

  // Initialize Algorand client
  const algodClient = new algosdk.Algodv2(
    process.env.ALGOD_TOKEN || '',
    process.env.ALGOD_SERVER,
    process.env.ALGOD_PORT
  );

  const indexerClient = new algosdk.Indexer(
    '',
    'https://testnet-idx.algonode.cloud',
    443
  );

  // Create creator account from mnemonic
  const creator = algosdk.mnemonicToSecretKey(process.env.MNEMONIC);

  console.log(`📝 Creator address: ${creator.addr}`);

  // Check account balance
  const accountInfo = await algodClient.accountInformation(creator.addr).do();
  const balance = accountInfo.amount;
  console.log(`💰 Account balance: ${Number(balance) / 1_000_000} ALGO`);

  if (balance < 1_000_000) {
    throw new Error('Insufficient balance. Need at least 1 ALGO for deployment.');
  }

  // Get suggested parameters
  const suggestedParams = await algodClient.getTransactionParams().do();

  // Step 1: Deploy Mock-Yield contract (if not already deployed)
  let mockYieldAppId = parseInt(process.env.MOCK_YIELD_APP_ID || '');
  if (!mockYieldAppId) {
    console.log('\n📋 Step 1: Deploying Mock-Yield contract...');
    mockYieldAppId = await MockYieldContract.create(
      creator,
      algodClient,
      suggestedParams
    );
    console.log(`✅ Mock-Yield contract deployed with App ID: ${mockYieldAppId}`);
    console.log(`🔍 TestNet Explorer: https://testnet.explorer.perawallet.app/app/${mockYieldAppId}`);
  } else {
    console.log(`\n📋 Step 1: Using existing Mock-Yield contract with App ID: ${mockYieldAppId}`);
  }

  // Step 2: Deploy Router contract (if not already deployed)
  let routerAppId = parseInt(process.env.ROUTER_APP_ID || '');
  if (!routerAppId) {
    console.log('\n📋 Step 2: Deploying Router contract...');
    const routerSuggestedParams = await algodClient.getTransactionParams().do();
    routerAppId = await RouterContract.create(
      creator,
      algodClient,
      routerSuggestedParams
    );
    console.log(`✅ Router contract deployed with App ID: ${routerAppId}`);
    console.log(`🔍 TestNet Explorer: https://testnet.explorer.perawallet.app/app/${routerAppId}`);
  } else {
    console.log(`\n📋 Step 2: Using existing Router contract with App ID: ${routerAppId}`);
  }

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
  const allowTxId = await routerContract.setAllowed(creator, mockYieldAppId, true);
  console.log('✅ Mock-Yield contract is now allowed in Router');
  console.log(`🔍 Transaction: https://testnet.explorer.perawallet.app/tx/${allowTxId}`);

  // Step 5: Set per-transaction cap (1 ALGO)
  console.log('\n📋 Step 4: Setting per-transaction cap...');
  const capTxId = await routerContract.setPerTxCap(creator, 1_000_000n); // 1 ALGO
  console.log('✅ Per-transaction cap set to 1 ALGO');
  console.log(`🔍 Transaction: https://testnet.explorer.perawallet.app/tx/${capTxId}`);

  // Step 6: Set Mock-Yield APY to 5% (500 basis points)
  console.log('\n📋 Step 5: Setting Mock-Yield APY...');
  const apyTxId = await mockYieldContract.setApy(creator, 500); // 5%
  console.log('✅ Mock-Yield APY set to 5%');
  console.log(`🔍 Transaction: https://testnet.explorer.perawallet.app/tx/${apyTxId}`);

  // Save deployment results
  const deploymentResult = {
    network: 'testnet',
    creator: creator.addr,
    mockYieldAppId,
    routerAppId,
    explorerLinks: {
      mockYield: `https://testnet.explorer.perawallet.app/app/${mockYieldAppId}`,
      router: `https://testnet.explorer.perawallet.app/app/${routerAppId}`,
      allowTx: `https://testnet.explorer.perawallet.app/tx/${allowTxId}`,
      capTx: `https://testnet.explorer.perawallet.app/tx/${capTxId}`,
      apyTx: `https://testnet.explorer.perawallet.app/tx/${apyTxId}`
    },
    timestamp: new Date().toISOString()
  };

  console.log('\n📋 Deployment Summary:');
  console.log(JSON.stringify(deploymentResult, null, 2));

  // Update .env.testnet with deployed contract IDs
  const fs = require('fs');
  const envContent = fs.readFileSync('.env.testnet', 'utf8');
  const updatedEnvContent = envContent
    .replace(/ROUTER_APP_ID=.*/, `ROUTER_APP_ID=${routerAppId}`)
    .replace(/MOCK_YIELD_APP_ID=.*/, `MOCK_YIELD_APP_ID=${mockYieldAppId}`);

  fs.writeFileSync('.env.testnet', updatedEnvContent);
  console.log('\n✅ Updated .env.testnet with deployed contract IDs');

  console.log('\n🎉 TestNet deployment completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Run the E2E test: pnpm e2e:testnet');
  console.log('2. Verify contracts on TestNet explorer');
  console.log('3. Test with actual ALGO transfers');

  return deploymentResult;
}

// Handle execution
if (require.main === module) {
  deployToTestnet()
    .then((result) => {
      console.log('\n✅ Deployment successful:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Deployment failed:', error);
      process.exit(1);
    });
}

export default deployToTestnet;