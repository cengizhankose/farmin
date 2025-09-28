"use client";

import { useState, useEffect } from 'react';
import algosdk from 'algosdk';
import { useWallet } from '@txnlab/use-wallet-react';
import { useAlgodClient } from './transactions';
import { logger } from './logger';

interface MockYieldTransactionResult {
  txId: string;
  success: boolean;
  error?: string;
}

export function useMockYield() {
  const [isWalletReady, setIsWalletReady] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  const { activeAddress, signTransactions, activeWalletAccounts, activeWallet } = useWallet();

  const isConnected = activeWalletAccounts && activeWalletAccounts.length > 0;

  // Update wallet state based on context availability
  useEffect(() => {
    if (isConnected && activeAddress && activeWallet) {
      setIsWalletReady(true);
      setWalletError(null);
    } else if (!isConnected) {
      setIsWalletReady(false);
      setWalletError(null);
    }
  }, [isConnected, activeAddress, activeWallet]);

  const client = useAlgodClient();
  const [isLoading, setIsLoading] = useState(false);

  // Contract IDs from environment
  const routerAppId = process.env.NEXT_PUBLIC_ROUTER_APP_ID || '746521471';
  const mockYieldAppId = process.env.NEXT_PUBLIC_MOCK_YIELD_APP_ID || '746521428';

  // Method selectors for ARC-4 ABI calls
  const getMethodSelector = (method: string) => {
    const methods: Record<string, string> = {
      'routeDeposit': 'routeDeposit(uint64,uint64)',
      'routeWithdraw': 'routeWithdraw(uint64,uint64)',
      'deposit': 'deposit(uint64,uint64)',
      'withdraw': 'withdraw(uint64,uint64)',
      'setApy': 'setApy(uint64)',
    };

    // Create method signature for ARC-4
    const methodSignature = methods[method] || method;
    return new TextEncoder().encode(methodSignature);
  };

  const encodeArgs = (args: (number | bigint | Uint8Array)[]) => {
    return args.map(arg => {
      if (typeof arg === 'bigint' || typeof arg === 'number') {
        return algosdk.encodeUint64(BigInt(arg));
      }
      return arg;
    });
  };

  const routeDeposit = async (amount: number): Promise<MockYieldTransactionResult> => {
    if (!isWalletReady || walletError) {
      return { txId: '', success: false, error: 'Wallet system not ready. Please refresh the page.' };
    }

    if (!activeAddress) {
      console.log('No active address found, please connect your wallet first');
      return { txId: '', success: false, error: 'Wallet not connected. Please connect your TestNet wallet first using the wallet button in the top-right corner.' };
    }

    // Additional check for active wallet
    if (!activeWallet) {
      return { txId: '', success: false, error: 'Wallet not properly initialized. Please disconnect and reconnect your wallet.' };
    }

    setIsLoading(true);
    try {
      logger.info('mock-yield:deposit:start', { amount, address: activeAddress, walletId: activeWallet.id });

      const suggestedParams = await client.getTransactionParams().do();
      const amountMicroAlgos = amount * 1_000_000; // Convert ALGO to microALGOs

      // Create application call transaction for Router
      const appCallTxn = algosdk.makeApplicationNoOpTxnFromObject({
        sender: activeAddress,
        appIndex: parseInt(routerAppId),
        appArgs: [
          getMethodSelector('routeDeposit'),
          ...encodeArgs([parseInt(mockYieldAppId), amountMicroAlgos])
        ],
        suggestedParams,
        foreignApps: [parseInt(mockYieldAppId)],
      });

      // Create payment transaction
      const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: activeAddress,
        receiver: activeAddress, // Send to self (contract handles the actual transfer)
        amount: amountMicroAlgos,
        suggestedParams,
      });

      // Group transactions
      const txns = [appCallTxn, paymentTxn];
      algosdk.assignGroupID(txns);

      // Sign transactions with better error handling
      let signedTxns;
      try {
        signedTxns = await signTransactions(
          txns.map(txn => algosdk.encodeUnsignedTransaction(txn))
        );
      } catch (signError) {
        logger.error('mock-yield:deposit:sign:error', signError);
        return {
          txId: '',
          success: false,
          error: signError instanceof Error ? signError.message : 'Failed to sign transaction. Please make sure your wallet is properly connected and unlocked.'
        };
      }

      // Submit transaction
      const result = await client.sendRawTransaction(signedTxns as Uint8Array[]).do();
      const txId = result.txid;

      // Wait for confirmation
      await algosdk.waitForConfirmation(client, txId, 10);

      logger.info('mock-yield:deposit:success', { txId, amount });
      return { txId, success: true };
    } catch (error) {
      logger.error('mock-yield:deposit:error', error);
      return {
        txId: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const routeWithdraw = async (amount: number): Promise<MockYieldTransactionResult> => {
    if (!isWalletReady || walletError) {
      return { txId: '', success: false, error: 'Wallet system not ready. Please refresh the page.' };
    }

    if (!activeAddress) {
      console.log('No active address found, please connect your wallet first');
      return { txId: '', success: false, error: 'Wallet not connected. Please connect your TestNet wallet first using the wallet button in the top-right corner.' };
    }

    // Additional check for active wallet
    if (!activeWallet) {
      return { txId: '', success: false, error: 'Wallet not properly initialized. Please disconnect and reconnect your wallet.' };
    }

    setIsLoading(true);
    try {
      logger.info('mock-yield:withdraw:start', { amount, address: activeAddress, walletId: activeWallet.id });

      const suggestedParams = await client.getTransactionParams().do();
      const amountMicroAlgos = amount * 1_000_000; // Convert ALGO to microALGOs

      // Create application call transaction for Router
      const appCallTxn = algosdk.makeApplicationNoOpTxnFromObject({
        sender: activeAddress,
        appIndex: parseInt(routerAppId),
        appArgs: [
          getMethodSelector('routeWithdraw'),
          ...encodeArgs([parseInt(mockYieldAppId), amountMicroAlgos])
        ],
        suggestedParams,
        foreignApps: [parseInt(mockYieldAppId)],
      });

      // Sign transaction with better error handling
      let signedTxns;
      try {
        signedTxns = await signTransactions(
          [algosdk.encodeUnsignedTransaction(appCallTxn)]
        );
      } catch (signError) {
        logger.error('mock-yield:withdraw:sign:error', signError);
        return {
          txId: '',
          success: false,
          error: signError instanceof Error ? signError.message : 'Failed to sign transaction. Please make sure your wallet is properly connected and unlocked.'
        };
      }

      // Submit transaction
      const result = await client.sendRawTransaction(signedTxns as Uint8Array[]).do();
      const txId = result.txid;

      // Wait for confirmation
      await algosdk.waitForConfirmation(client, txId, 10);

      logger.info('mock-yield:withdraw:success', { txId, amount });
      return { txId, success: true };
    } catch (error) {
      logger.error('mock-yield:withdraw:error', error);
      return {
        txId: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const getBalance = async (): Promise<number> => {
    if (!activeAddress) return 0;

    try {
      const accountInfo = await client.accountInformation(activeAddress).do();
      return Number(accountInfo.amount) / 1_000_000; // Convert microALGOs to ALGO
    } catch (error) {
      logger.error('mock-yield:balance:error', error);
      return 0;
    }
  };

  return {
    routeDeposit,
    routeWithdraw,
    getBalance,
    isLoading,
    isWalletReady,
    walletError,
    routerAppId,
    mockYieldAppId,
  };
}