import * as algosdk from 'algosdk';
import {
  RouterGlobalState,
  YEAR_BPS,
  ALGO_ASSET_ID
} from '../types';
import {
  MethodSelectors,
  getMethodSelector,
  encodeArgs,
  validateArc4Type
} from '../utils/abi';

/**
 * Router Contract - Routes deposits and withdrawals to yield-generating contracts
 */
export class RouterContract {
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
   * Create Router contract application
   */
  static async create(
    creator: algosdk.Account,
    algodClient: algosdk.Algodv2,
    suggestedParams: algosdk.SuggestedParams
  ): Promise<number> {
    // Approval program with Router logic
    const approvalProgram = `
#pragma version 9
// Router Contract Approval Program

// Simple approval program for testing
// Approves all transactions

// Global state keys for reference (not used in simple version)
// byte "admin"
// byte "paused"
// byte "per_txCap"
// byte "allowed_"

// Method selectors for reference (not used in simple version)
// byte "setAllowed(application,bool)void"
// byte "setPerTxCap(uint64)void"
// byte "pause(bool)void"
// byte "routeDeposit(application,asset,uint64)void"
// byte "routeWithdraw(application,asset,uint64)void"

// Just approve everything for now
int 1
`.trim();

    // Clear state program
    const clearProgram = `
#pragma version 9
// Router Contract Clear State Program
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
   * Set allowed status for a target application
   */
  async setAllowed(
    sender: algosdk.Account,
    targetAppId: number,
    allowed: boolean
  ): Promise<string> {
    const suggestedParams = await this.algodClient.getTransactionParams().do();

    const args = [
      getMethodSelector(MethodSelectors.SET_ALLOWED),
      encodeArgs([targetAppId, allowed])
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
   * Set per-transaction cap
   */
  async setPerTxCap(
    sender: algosdk.Account,
    cap: bigint
  ): Promise<string> {
    const suggestedParams = await this.algodClient.getTransactionParams().do();

    const args = [
      getMethodSelector(MethodSelectors.SET_PER_TX_CAP),
      encodeArgs([cap])
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
   * Pause/unpause contract
   */
  async pause(
    sender: algosdk.Account,
    paused: boolean
  ): Promise<string> {
    const suggestedParams = await this.algodClient.getTransactionParams().do();

    const args = [
      getMethodSelector(MethodSelectors.PAUSE),
      encodeArgs([paused])
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
   * Route deposit to target application
   */
  async routeDeposit(
    sender: algosdk.Account,
    targetAppId: number,
    assetId: number,
    amount: bigint
  ): Promise<string> {
    const suggestedParams = await this.algodClient.getTransactionParams().do();

    const args = [
      getMethodSelector(MethodSelectors.ROUTE_DEPOSIT),
      encodeArgs([targetAppId, assetId, amount])
    ];

    // Create transaction group
    const appCallTxn = algosdk.makeApplicationNoOpTxnFromObject({
      sender: sender.addr,
      appIndex: this.appIndex,
      appArgs: args,
      suggestedParams
    });

    let transactions: algosdk.Transaction[] = [appCallTxn];

    // Add asset transfer if not ALGO
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
    const txGroup = algosdk.assignGroupID(transactions);
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
   * Route withdrawal from target application
   */
  async routeWithdraw(
    sender: algosdk.Account,
    targetAppId: number,
    assetId: number,
    amount: bigint
  ): Promise<string> {
    const suggestedParams = await this.algodClient.getTransactionParams().do();

    const args = [
      getMethodSelector(MethodSelectors.ROUTE_WITHDRAW),
      encodeArgs([targetAppId, assetId, amount])
    ];

    const appCallTxn = algosdk.makeApplicationNoOpTxnFromObject({
      sender: sender.addr,
      appIndex: this.appIndex,
      appArgs: args,
      suggestedParams
    });

    const signedTxn = appCallTxn.signTxn(sender.sk);
    const txId = await this.algodClient.sendRawTransaction(signedTxn).do();

    await algosdk.waitForConfirmation(this.algodClient, txId.txid, 10);
    return txId.txid;
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
}