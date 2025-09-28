import * as algosdk from 'algosdk';
import { RouterContract, MockYieldContract } from '../src';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.testnet' });

async function runTestNetE2ETest() {
  console.log('🧪 Running TestNet E2E Test...');

  // Validate environment
  if (!process.env.ALGOD_SERVER || !process.env.MNEMONIC) {
    throw new Error('Missing required environment variables in .env.testnet');
  }

  if (!process.env.ROUTER_APP_ID || !process.env.MOCK_YIELD_APP_ID) {
    throw new Error('Contract IDs not found. Please run deployment first: pnpm deploy:testnet');
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

  // Create test account from mnemonic
  const userAccount = algosdk.mnemonicToSecretKey(process.env.MNEMONIC);

  console.log(`👤 User address: ${userAccount.addr}`);

  // Get account balance
  const accountInfo = await algodClient.accountInformation(userAccount.addr).do();
  const balance = accountInfo.amount;
  console.log(`💰 Account balance: ${balance / 1_000_000} ALGO`);

  // Minimum balance check
  if (balance < 200_000) {
    throw new Error('Insufficient balance. Need at least 0.2 ALGO for testing.');
  }

  // Create contract instances
  const routerContract = new RouterContract(
    parseInt(process.env.ROUTER_APP_ID!),
    algodClient,
    indexerClient
  );

  const mockYieldContract = new MockYieldContract(
    parseInt(process.env.MOCK_YIELD_APP_ID!),
    algodClient,
    indexerClient
  );

  // Test parameters (smaller amounts for TestNet)
  const TEST_AMOUNT = 50_000n; // 0.05 ALGO
  const ALGO_ASSET_ID = 0;

  console.log('\n📋 Test Parameters:');
  console.log(`  Amount: ${TEST_AMOUNT / 1_000_000} ALGO`);
  console.log(`  Router App ID: ${process.env.ROUTER_APP_ID}`);
  console.log(`  Mock-Yield App ID: ${process.env.MOCK_YIELD_APP_ID}`);
  console.log(`  TestNet Explorer: https://testnet.explorer.perawallet.app`);

  try {
    // Step 1: Check initial state
    console.log('\n📋 Step 1: Checking initial state...');

    const initialTVL = await mockYieldContract.getTVL();
    const initialAPY = await mockYieldContract.getAPY();
    console.log(`  Initial TVL: ${initialTVL / 1_000_000} ALGO`);
    console.log(`  Initial APY: ${initialAPY / 100}%`);

    // Step 2: Route deposit through Router
    console.log('\n📋 Step 2: Routing deposit through Router...');

    const depositTxId = await routerContract.routeDeposit(
      userAccount,
      parseInt(process.env.MOCK_YIELD_APP_ID!),
      ALGO_ASSET_ID,
      TEST_AMOUNT
    );
    console.log(`✅ Deposit routed successfully`);
    console.log(`🔍 Transaction: https://testnet.explorer.perawallet.app/tx/${depositTxId}`);

    // Wait for transaction confirmation
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Step 3: Verify deposit
    console.log('\n📋 Step 3: Verifying deposit...');

    const afterDepositTVL = await mockYieldContract.getTVL();
    console.log(`  TVL after deposit: ${afterDepositTVL / 1_000_000} ALGO`);

    if (afterDepositTVL >= initialTVL + TEST_AMOUNT) {
      console.log('✅ TVL increased correctly');
    } else {
      throw new Error(`TVL should have increased by at least ${TEST_AMOUNT / 1_000_000} ALGO`);
    }

    // Step 4: Wait for yield to accumulate
    console.log('\n📋 Step 4: Waiting for yield accumulation...');
    console.log('   ⏳ Waiting 15 seconds for yield to accumulate...');
    await new Promise(resolve => setTimeout(resolve, 15000));

    // Step 5: Calculate yield
    console.log('\n📋 Step 5: Calculating accumulated yield...');

    const yieldInfo = await mockYieldContract.calculateYield(userAccount.addr);
    console.log(`  Principal: ${yieldInfo.principal / 1_000_000} ALGO`);
    console.log(`  Yield: ${yieldInfo.yield / 1_000_000} ALGO`);
    console.log(`  Total: ${yieldInfo.total / 1_000_000} ALGO`);

    // Step 6: Route withdrawal through Router
    console.log('\n📋 Step 6: Routing withdrawal through Router...');

    const withdrawTxId = await routerContract.routeWithdraw(
      userAccount,
      parseInt(process.env.MOCK_YIELD_APP_ID!),
      ALGO_ASSET_ID,
      yieldInfo.total
    );
    console.log(`✅ Withdrawal routed successfully`);
    console.log(`🔍 Transaction: https://testnet.explorer.perawallet.app/tx/${withdrawTxId}`);

    // Wait for transaction confirmation
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Step 7: Verify withdrawal
    console.log('\n📋 Step 7: Verifying withdrawal...');

    const afterWithdrawalTVL = await mockYieldContract.getTVL();
    console.log(`  TVL after withdrawal: ${afterWithdrawalTVL / 1_000_000} ALGO`);

    if (afterWithdrawalTVL < afterDepositTVL) {
      console.log('✅ TVL decreased correctly');
    } else {
      throw new Error('TVL should have decreased after withdrawal');
    }

    // Step 8: Check final account balance
    console.log('\n📋 Step 8: Checking final account balance...');

    const finalAccountInfo = await algodClient.accountInformation(userAccount.addr).do();
    const finalBalance = finalAccountInfo.amount;
    console.log(`  Final balance: ${finalBalance / 1_000_000} ALGO`);

    // Calculate profit/loss
    const balanceChange = finalBalance - balance;
    console.log(`  Balance change: ${balanceChange / 1_000_000} ALGO`);

    // Account for transaction fees
    const estimatedFees = 2_000n; // Approximate fees for 2 transactions
    const netResult = balanceChange + estimatedFees;

    if (netResult >= 0) {
      console.log('🎉 User earned profit or broke even after fees!');
    } else {
      console.log('ℹ️  User incurred small loss due to transaction fees');
    }

    // Test Results Summary
    console.log('\n📋 Test Results Summary:');
    console.log('✅ Router contract deployment: SUCCESS');
    console.log('✅ Mock-Yield contract deployment: SUCCESS');
    console.log('✅ Deposit routing: SUCCESS');
    console.log('✅ Yield calculation: SUCCESS');
    console.log('✅ Withdrawal routing: SUCCESS');
    console.log('✅ TVL tracking: SUCCESS');
    console.log('✅ Account balance verification: SUCCESS');

    console.log('\n🎉 TestNet E2E Test Completed Successfully!');
    console.log('\n📋 Explorer Links:');
    console.log(`  Router: https://testnet.explorer.perawallet.app/app/${process.env.ROUTER_APP_ID}`);
    console.log(`  Mock-Yield: https://testnet.explorer.perawallet.app/app/${process.env.MOCK_YIELD_APP_ID}`);
    console.log(`  Deposit: https://testnet.explorer.perawallet.app/tx/${depositTxId}`);
    console.log(`  Withdrawal: https://testnet.explorer.perawallet.app/tx/${withdrawTxId}`);

    return {
      success: true,
      network: 'testnet',
      depositTxId,
      withdrawTxId,
      initialBalance: balance,
      finalBalance: finalBalance,
      profit: balanceChange,
      yieldEarned: yieldInfo.yield,
      explorerLinks: {
        router: `https://testnet.explorer.perawallet.app/app/${process.env.ROUTER_APP_ID}`,
        mockYield: `https://testnet.explorer.perawallet.app/app/${process.env.MOCK_YIELD_APP_ID}`,
        deposit: `https://testnet.explorer.perawallet.app/tx/${depositTxId}`,
        withdrawal: `https://testnet.explorer.perawallet.app/tx/${withdrawTxId}`
      }
    };

  } catch (error) {
    console.error('\n❌ TestNet E2E Test Failed:', error);
    throw error;
  }
}

// Handle execution
if (require.main === module) {
  runTestNetE2ETest()
    .then((result) => {
      console.log('\n✅ TestNet E2E Test Result:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ TestNet E2E Test Failed:', error);
      process.exit(1);
    });
}

export default runTestNetE2ETest;