'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Wallet, ArrowDownRight, ArrowUpRight, CheckCircle } from 'lucide-react';
import { useMockYield } from '@/wallet/useMockYield';
import { useWallet } from '@txnlab/use-wallet-react';
import { Opportunity } from '@shared/core';

interface RouterTabProps {
  opportunity: Opportunity;
}

export function RouterTab({ opportunity }: RouterTabProps) {
  const [amount, setAmount] = useState(1000);
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [balance, setBalance] = useState<number>(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [txResult, setTxResult] = useState<{ success: boolean; message: string; txId?: string } | null>(null);

  const { routeDeposit, routeWithdraw, isLoading: isTxLoading } = useMockYield();
  const { activeAddress, isConnected } = useWallet();

  // Check if this is the TestNet Mock-Yield opportunity
  const isTestNetMockYield = opportunity.id === 'testnet-mock-yield-algo' &&
                           process.env.NEXT_PUBLIC_MOCK_YIELD_APP_ID;

  // Fetch wallet balance when connected
  useEffect(() => {
    if (isConnected && activeAddress && isTestNetMockYield) {
      const fetchBalance = async () => {
        try {
          const client = (await import('@/wallet')).useAlgodClient();
          const algodClient = client();
          const accountInfo = await algodClient.accountInformation(activeAddress).do();
          setBalance(accountInfo.amount / 1_000_000); // Convert to ALGO
        } catch (error) {
          console.error('Failed to fetch balance:', error);
        }
      };
      fetchBalance();
    }
  }, [isConnected, activeAddress, isTestNetMockYield]);

  const handleDeposit = async () => {
    if (!isConnected) {
      setTxResult({ success: false, message: 'Please connect your wallet first' });
      return;
    }

    try {
      setTxResult(null);
      const result = await routeDeposit(amount);

      if (result.success) {
        setTxResult({
          success: true,
          message: `Successfully deposited ${amount} ALGO!`,
          txId: result.txId
        });
        setShowSuccess(true);

        // Refresh balance
        const client = (await import('@/wallet')).useAlgodClient();
        const algodClient = client();
        const accountInfo = await algodClient.accountInformation(activeAddress!).do();
        setBalance(accountInfo.amount / 1_000_000);

        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setTxResult({ success: false, message: result.error || 'Deposit failed' });
      }
    } catch (error) {
      setTxResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  };

  const handleWithdraw = async () => {
    if (!isConnected) {
      setTxResult({ success: false, message: 'Please connect your wallet first' });
      return;
    }

    try {
      setTxResult(null);
      const result = await routeWithdraw(amount);

      if (result.success) {
        setTxResult({
          success: true,
          message: `Successfully withdrew ${amount} ALGO!`,
          txId: result.txId
        });
        setShowSuccess(true);

        // Refresh balance
        const client = (await import('@/wallet')).useAlgodClient();
        const algodClient = client();
        const accountInfo = await algodClient.accountInformation(activeAddress!).do();
        setBalance(accountInfo.amount / 1_000_000);

        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setTxResult({ success: false, message: result.error || 'Withdrawal failed' });
      }
    } catch (error) {
      setTxResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  };

  if (!isTestNetMockYield) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Router functionality is only available for TestNet Mock-Yield opportunity.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Router Info */}
      <div className="rounded-lg bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-500/30 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl">🔗</div>
          <div>
            <h3 className="text-lg font-semibold text-white">Router Interface</h3>
            <p className="text-sm text-blue-300">
              interact with {opportunity.protocol} through the Router contract
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-black/30 rounded-lg p-3">
            <div className="text-gray-400">Router App ID</div>
            <div className="text-white font-mono">{process.env.NEXT_PUBLIC_ROUTER_APP_ID}</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3">
            <div className="text-gray-400">Target App ID</div>
            <div className="text-white font-mono">{process.env.NEXT_PUBLIC_MOCK_YIELD_APP_ID}</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3">
            <div className="text-gray-400">Network</div>
            <div className="text-white">TestNet</div>
          </div>
        </div>
      </div>

      {/* Wallet Connection Status */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="text-blue-600" size={20} />
            <span className="text-sm font-medium text-blue-900">
              {isConnected ? `Connected: ${activeAddress?.slice(0, 4)}...${activeAddress?.slice(-4)}` : "Wallet Not Connected"}
            </span>
          </div>
          {isConnected && (
            <span className="text-sm text-blue-600 font-medium">
              Balance: {balance.toFixed(4)} ALGO
            </span>
          )}
        </div>
      </div>

      {/* Action Panel */}
      <div className="rounded-lg bg-white/5 border border-white/10 p-6">
        <div className="space-y-4">
          {/* Deposit/Withdrawal Tabs */}
          <div className="inline-flex rounded-lg bg-zinc-100 p-0.5 w-full">
            <button
              onClick={() => setActiveTab('deposit')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'deposit'
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-600"
              }`}
            >
              Deposit
            </button>
            <button
              onClick={() => setActiveTab('withdraw')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'withdraw'
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-600"
              }`}
            >
              Withdraw
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount (ALGO)
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min="0.1"
                max={balance}
                step="0.1"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter amount"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-400 text-sm">ALGO</span>
              </div>
            </div>
            {activeTab === 'withdraw' && (
              <p className="text-xs text-gray-400 mt-1">
                Available: {balance.toFixed(4)} ALGO
              </p>
            )}
          </div>

          {/* Action Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={activeTab === 'deposit' ? handleDeposit : handleWithdraw}
            disabled={isTxLoading || (activeTab === 'withdraw' && amount > balance)}
            className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              isTxLoading || (activeTab === 'withdraw' && amount > balance)
                ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                : !isConnected
                ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg"
            }`}
          >
            {isTxLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing...
              </>
            ) : !isConnected ? (
              <>
                <Wallet size={16} />
                Connect Wallet
              </>
            ) : (
              <>
                {activeTab === 'deposit' ? (
                  <>
                    Deposit {amount} ALGO
                    <ArrowDownRight size={16} />
                  </>
                ) : (
                  <>
                    Withdraw {amount} ALGO
                    <ArrowUpRight size={16} />
                  </>
                )}
              </>
            )}
          </motion.button>

          {/* Transaction Result */}
          {txResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-lg p-4 ${
                txResult.success
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {txResult.success ? (
                  <CheckCircle size={16} className="text-green-600" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                )}
                <span className="text-sm font-medium">
                  {txResult.message}
                </span>
              </div>
              {txResult.txId && (
                <div className="text-xs mt-2 font-mono">
                  Transaction ID: {txResult.txId}
                </div>
              )}
            </motion.div>
          )}

          {/* Success Animation */}
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700"
            >
              <CheckCircle size={16} />
              <span className="text-sm font-medium">
                Transaction completed successfully!
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}