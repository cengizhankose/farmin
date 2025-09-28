import * as algosdk from 'algosdk';
import {
  MockYieldGlobalState,
  MockYieldLocalState,
  YEAR_BPS,
  ALGO_ASSET_ID
} from '../types';
import {
  MethodSelectors,
  getMethodSelector,
  encodeArgs
} from '../utils/abi';

/**
 * Mock-Yield Contract - Simulates yield generation for testing
 */
export class MockYieldContract {
  private appIndex: number;
  private algodClient: algosdk.Algodv2;
  private indexerClient?: algosdk.Indexer;

  constructor(
    appIndex: number,
    algodClient: algosdk.Algodv2,
    indexerClient?: algosdk.Indexer
  ) {
    this.appIndex = appIndex;
    this.algodClient = algodClient;
    this.indexerClient = indexerClient;
  }

  /**
   * Create Mock-Yield contract application
   */
  static async create(
    creator: algosdk.Account,
    algodClient: algosdk.Algodv2,
    suggestedParams: algosdk.SuggestedParams
  ): Promise<number> {
    // Approval program with Mock-Yield logic
    const approvalProgram = `
#pragma version 9
// Mock-Yield Contract Approval Program

// For now, just approve everything
// Will implement proper state management in future versions
int 1
`.trim();

    // Clear state program
    const clearProgram = `
#pragma version 9
// Mock-Yield Contract Clear State Program
int 1
`.trim();

    const compilationResult = await algodClient.compile(approvalProgram).do();
    const approvalBytes = new Uint8Array(
      Buffer.from(compilationResult.result, 'base64')
    );

    const clearResult = await algodClient.compile(clearProgram).do();
    const clearBytes = new Uint8Array(
      Buffer.from(clearResult.result, 'base64')
    );

    const txn = algosdk.makeApplicationCreateTxnFromObject({
      sender: creator.addr,
      suggestedParams,
      approvalProgram: approvalBytes,
      clearProgram: clearBytes,
      numGlobalByteSlices: 1,
      numGlobalInts: 2,
      numLocalByteSlices: 0,
      numLocalInts: 2,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
    });

    const signedTxn = txn.signTxn(creator.sk);
    const txId = await algodClient.sendRawTransaction(signedTxn).do();

    // Wait for confirmation
    const confirmedTxn = await algosdk.waitForConfirmation(
      algodClient,
      txId.txid,
      10
    );

    return Number(confirmedTxn.applicationIndex!);
  }

  /**
   * Set APY in basis points (e.g., 500 = 5%)
   */
  async setApy(
    sender: algosdk.Account,
    apyBps: number
  ): Promise<string> {
    const suggestedParams = await this.algodClient.getTransactionParams().do();

    const args = [
      getMethodSelector(MethodSelectors.SET_APY),
      encodeArgs([apyBps])
    ];

    const txn = algosdk.makeApplicationNoOpTxnFromObject({
      sender: sender.addr,
      appIndex: this.appIndex,
      appArgs: args,
      suggestedParams
    });

    const signedTxn = txn.signTxn(sender.sk);
    const txId = await this.algodClient.sendRawTransaction(signedTxn).do();

    await algosdk.waitForConfirmation(this.algodClient, txId.txid, 10);
    return txId.txid;
  }

  /**
   * Deposit assets into yield contract
   */
  async deposit(
    sender: algosdk.Account,
    assetId: number,
    amount: bigint
  ): Promise<string> {
    const suggestedParams = await this.algodClient.getTransactionParams().do();

    const args = [
      getMethodSelector(MethodSelectors.DEPOSIT),
      encodeArgs([assetId, amount])
    ];

    // Create transaction group
    const appCallTxn = algosdk.makeApplicationNoOpTxnFromObject({
      sender: sender.addr,
      appIndex: this.appIndex,
      appArgs: args,
      suggestedParams,
      foreignAssets: assetId !== ALGO_ASSET_ID ? [assetId] : undefined
    });

    let transactions: algosdk.Transaction[] = [appCallTxn];

    // Add asset transfer
    if (assetId !== ALGO_ASSET_ID) {
      const assetTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        sender: sender.addr,
        receiver: sender.addr,
        closeRemainderTo: undefined,
        assetIndex: assetId,
        amount: Number(amount),
        suggestedParams
      });

      transactions.push(assetTxn);
    } else {
      const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: sender.addr,
        receiver: sender.addr,
        amount: Number(amount),
        suggestedParams
      });

      transactions.push(paymentTxn);
    }

    // Group transactions
    algosdk.assignGroupID(transactions);
    const signedTxns = transactions.map((txn, index) => {
      if (index === 0) {
        return txn.signTxn(sender.sk);
      }
      return txn.signTxn(sender.sk);
    });

    const txId = await this.algodClient.sendRawTransaction(signedTxns).do();
    await algosdk.waitForConfirmation(this.algodClient, txId.txid, 10);
    return txId.txid;
  }

  /**
   * Withdraw assets from yield contract
   */
  async withdraw(
    sender: algosdk.Account,
    assetId: number,
    amount: bigint
  ): Promise<string> {
    const suggestedParams = await this.algodClient.getTransactionParams().do();

    const args = [
      getMethodSelector(MethodSelectors.WITHDRAW),
      encodeArgs([assetId, amount])
    ];

    const appCallTxn = algosdk.makeApplicationNoOpTxnFromObject({
      sender: sender.addr,
      appIndex: this.appIndex,
      appArgs: args,
      suggestedParams,
      foreignAssets: assetId !== ALGO_ASSET_ID ? [assetId] : undefined
    });

    const signedTxn = appCallTxn.signTxn(sender.sk);
    const txId = await this.algodClient.sendRawTransaction(signedTxn).do();

    await algosdk.waitForConfirmation(this.algodClient, txId.txid, 10);
    return txId.txid;
  }

  /**
   * Calculate yield for a user
   */
  async calculateYield(
    userAddress: string
  ): Promise<{ principal: bigint; yield: bigint; total: bigint }> {
    if (!this.indexerClient) {
      throw new Error('Indexer client required for yield calculation');
    }

    // Get local state for user
    const accountInfo = await this.algodClient.accountInformation(userAddress).do();
    const appsLocalState = accountInfo.appsLocalState || [];

    const userState = appsLocalState.find((app: any) => app.id === this.appIndex);
    if (!userState) {
      return { principal: 0n, yield: 0n, total: 0n };
    }

    // Extract deposit amount and timestamp from TealKeyValue array
    const amountEntry = userState.keyValue?.find((entry: any) =>
      Buffer.from(entry.key, 'base64').toString() === 'amount'
    );
    const depositTsEntry = userState.keyValue?.find((entry: any) =>
      Buffer.from(entry.key, 'base64').toString() === 'deposit_ts'
    );

    const amount = BigInt(amountEntry?.value?.uint || 0);
    const depositTs = BigInt(depositTsEntry?.value?.uint || 0);

    if (amount === 0n || depositTs === 0n) {
      return { principal: amount, yield: 0n, total: amount };
    }

    // Get current APY
    const apyBps = BigInt(await this.getGlobalState(MockYieldGlobalState.APY_BPS) || 0);

    // Calculate time elapsed
    const currentTime = BigInt(Math.floor(Date.now() / 1000));
    const timeElapsed = currentTime - depositTs;

    // Calculate yield: (amount * apyBps * timeElapsed) / (YEAR_BPS)
    const yieldAmount = (amount * apyBps * timeElapsed) / YEAR_BPS;

    return {
      principal: amount,
      yield: yieldAmount,
      total: amount + yieldAmount
    };
  }

  /**
   * Get global state value
   */
  async getGlobalState(key: string): Promise<any> {
    if (!this.indexerClient) {
      throw new Error('Indexer client required for global state access');
    }

    const appInfo = await this.indexerClient
      .lookupApplications(this.appIndex)
      .includeAll(true)
      .do();

    const globalState = appInfo.application?.params?.globalState || [];
    const stateEntry = globalState.find((entry: any) =>
      Buffer.from(entry.key, 'base64').toString() === key
    );

    if (!stateEntry) {
      return undefined;
    }

    if (stateEntry.value.type === 1) {
      return stateEntry.value.bytes;
    } else {
      return stateEntry.value.uint;
    }
  }

  /**
   * Get TVL (Total Value Locked)
   */
  async getTVL(): Promise<bigint> {
    const tvl = await this.getGlobalState(MockYieldGlobalState.TVL);
    return BigInt(tvl || 0);
  }

  /**
   * Get APY in basis points
   */
  async getAPY(): Promise<number> {
    const apyBps = await this.getGlobalState(MockYieldGlobalState.APY_BPS);
    return Number(apyBps || 0);
  }
}