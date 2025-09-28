"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
// Recharts components removed - Value Projection chart removed
import {
  Calculator,
  ArrowUpRight,
  Info,
  DollarSign,
  Calendar,
  Percent,
  CheckCircle,
  AlertCircle,
  ArrowDownRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useMockYield } from "@/wallet";
type Opportunity = {
  id: string;
  protocol: string;
  pair: string;
  chain: string;
  apr: number;
  apy: number;
  risk: "Low" | "Medium" | "High";
  tvlUsd: number;
  rewardToken: string;
  lastUpdated: string;
  originalUrl: string;
  summary: string;
};
import { colors } from "@/lib/colors";

interface DepositCalculatorProps {
  data: Opportunity;
  onAmountChange?: (amount: number) => void;
  onDaysChange?: (days: number) => void;
}

type CompoundFrequency =
  | "Daily"
  | "Weekly"
  | "Monthly"
  | "Quarterly"
  | "Annually";

export function DepositCalculator({
  data,
  onAmountChange,
  onDaysChange,
}: DepositCalculatorProps) {
  const [amount, setAmount] = useState(1000);
  const [days, setDays] = useState(90);
  const [compoundFrequency, setCompoundFrequency] =
    useState<CompoundFrequency>("Daily");
  const [isRouterMode, setIsRouterMode] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const [balance, setBalance] = useState<number>(0);

  // Notify parent of changes
  React.useEffect(() => {
    onAmountChange?.(amount);
  }, [amount, onAmountChange]);

  React.useEffect(() => {
    onDaysChange?.(days);
  }, [days, onDaysChange]);

  const {
    routeDeposit,
    routeWithdraw,
    isLoading: isTxLoading,
    isWalletReady,
    walletError,
  } = useMockYield();

  // Check if this is the TestNet Mock-Yield opportunity
  const isTestNetMockYield =
    data.id === "testnet-mock-yield-algo" &&
    data.protocol === "Mock Yield Protocol";

  // Check wallet status
  const [walletStatus, setWalletStatus] = useState<
    "checking" | "ready" | "error"
  >("checking");

  useEffect(() => {
    let isMounted = true;

    const checkWalletStatus = async () => {
      if (isWalletReady) {
        if (isMounted) setWalletStatus("ready");
      } else if (walletError) {
        if (isMounted) setWalletStatus("error");
      } else {
        // If wallet is not ready but no error, it means wallet is not connected
        if (isMounted) setWalletStatus("ready");
      }
    };

    checkWalletStatus();

    return () => {
      isMounted = false;
    };
  }, [isWalletReady, walletError]);

  // Always use Router mode for TestNet Mock-Yield
  useEffect(() => {
    if (isTestNetMockYield) {
      setIsRouterMode(true);
    }
  }, [isTestNetMockYield]);

  // Calculate returns
  const calculateReturns = () => {
    const dailyRate = data.apr / 365 / 100;
    const simpleReturn = amount * dailyRate * days;

    // Compound frequency to periods per year
    const periodsPerYear: Record<CompoundFrequency, number> = {
      Daily: 365,
      Weekly: 52,
      Monthly: 12,
      Quarterly: 4,
      Annually: 1,
    };

    const n = periodsPerYear[compoundFrequency];
    const compoundedAmount =
      amount * Math.pow(1 + data.apr / 100 / n, (n * days) / 365);
    const compoundReturn = compoundedAmount - amount;

    return {
      simple: simpleReturn,
      compound: compoundReturn,
      final: compoundedAmount,
      effectiveAPY: (((compoundedAmount / amount - 1) * 365) / days) * 100,
    };
  };

  const returns = calculateReturns();

  const handleDeposit = async () => {
    try {
      const result = await routeDeposit(amount);
      if (result.success) {
        toast.success("Deposit successful!", {
          description: `Deposited ${amount} ALGO to Mock Yield Protocol`,
        });

        // Add to portfolio history (implementation would go here)
        console.log("Adding to portfolio:", {
          id: data.id,
          protocol: data.protocol,
          pair: data.pair,
          apr: data.apr,
          amount,
          days,
          ts: Date.now(),
          chain: data.chain,
        });

        setShowSuccess(true);

        // Only redirect for non-TestNet opportunities
        if (!isTestNetMockYield) {
          setTimeout(() => {
            window.open(data.originalUrl, "_blank");
            toast.success("Redirected to protocol", {
              description: `${data.protocol} opened in a new tab. Position added to your portfolio.`,
            });
            setShowSuccess(false);
          }, 1500);
        } else {
          // For TestNet, just hide success after delay
          setTimeout(() => setShowSuccess(false), 2000);
        }
      } else {
        toast.error("Deposit failed", {
          description: result.error || "Transaction failed",
        });
      }
    } catch (error) {
      toast.error("Deposit failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleWithdraw = async () => {
    try {
      const result = await routeWithdraw(amount);
      if (result.success) {
        toast.success("Withdrawal successful!", {
          description: `Withdrew ${amount} ALGO from Mock Yield Protocol`,
        });

        // Add withdrawal to portfolio history (implementation would go here)
        console.log("Adding withdrawal to portfolio:", {
          id: data.id,
          protocol: data.protocol,
          pair: data.pair,
          apr: data.apr,
          amount: -amount, // Negative amount for withdrawal
          days,
          ts: Date.now(),
          chain: data.chain,
          type: "withdrawal",
        });

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1500);
      } else {
        toast.error("Withdrawal failed", {
          description: result.error || "Transaction failed",
        });
      }
    } catch (error) {
      toast.error("Withdrawal failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
      className="space-y-4"
    >
      {/* Main Calculator Card */}
      <div className="sticky top-24 rounded-3xl border border-black/5 bg-white p-5 md:p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calculator className="text-zinc-400" size={20} />
            <h4 className="font-display text-lg text-zinc-900">
              {isTestNetMockYield ? "TestNet Operations" : "Deposit Calculator"}
            </h4>
            {isTestNetMockYield && (
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                TestNet Demo
              </span>
            )}
          </div>

          {/* Mode Switcher - Only show for non-TestNet opportunities */}
          {!isTestNetMockYield && (
            <div className="inline-flex rounded-lg bg-zinc-100 p-0.5">
              <button
                onClick={() => setIsRouterMode(false)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  !isRouterMode
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-600"
                }`}
              >
                Protocol
              </button>
              <button
                onClick={() => setIsRouterMode(true)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  isRouterMode
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-600"
                }`}
              >
                Router
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Wallet Status for Demo */}
          {isTestNetMockYield && (
            <div
              className={`rounded-lg border p-3 ${
                walletStatus === "ready"
                  ? "bg-green-50 border-green-200"
                  : walletStatus === "error"
                    ? "bg-red-50 border-red-200"
                    : "bg-yellow-50 border-yellow-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    walletStatus === "ready"
                      ? "bg-green-500"
                      : walletStatus === "error"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                  }`}
                ></div>
                <span
                  className={`text-sm font-medium ${
                    walletStatus === "ready"
                      ? "text-green-800"
                      : walletStatus === "error"
                        ? "text-red-800"
                        : "text-yellow-800"
                  }`}
                >
                  {walletStatus === "ready"
                    ? "Wallet System Ready"
                    : walletStatus === "error"
                      ? "Wallet System Error"
                      : "Checking Wallet System..."}
                </span>
              </div>
              <div className="mt-2 text-xs text-yellow-700">
                Please make sure your TestNet wallet is connected using the
                wallet button in the top-right corner before making deposits or
                withdrawals.
                {walletError && (
                  <div className="mt-1 text-red-600">Error: {walletError}</div>
                )}
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-zinc-600 flex items-center gap-1">
                <DollarSign size={12} />
                Amount ({isTestNetMockYield ? "ALGO" : "USD"})
              </span>
              <span className="text-xs text-zinc-500">
                {isTestNetMockYield ? "ALGO amount" : "Principal investment"}
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                className="w-full rounded-xl bg-zinc-50 px-4 py-3 text-lg font-semibold tabular-nums ring-1 ring-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all"
                placeholder={isTestNetMockYield ? "0.1" : "1000"}
                min={0}
                max={isTestNetMockYield ? balance : 1000000}
                step={isTestNetMockYield ? 0.01 : 1}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="text-xs text-zinc-500">
                  {isTestNetMockYield ? "ALGO" : "USD"}
                </span>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="mt-2 flex gap-2">
              {(isTestNetMockYield
                ? [0.1, 0.5, 1, 5]
                : [100, 500, 1000, 5000]
              ).map((val) => (
                <button
                  key={val}
                  onClick={() => setAmount(val)}
                  className="flex-1 rounded-lg bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-200 transition-colors"
                >
                  {isTestNetMockYield
                    ? `${val} ALGO`
                    : `$${val.toLocaleString()}`}
                </button>
              ))}
            </div>
          </div>

          {/* Duration Slider - Only for non-TestNet */}
          {!isTestNetMockYield && (
            <div>
              <label className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-zinc-600 flex items-center gap-1">
                  <Calendar size={12} />
                  Duration
                </span>
                <span className="text-xs font-semibold text-zinc-900 tabular-nums">
                  {days} days
                </span>
              </label>
              <input
                type="range"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:bg-white"
                min={1}
                max={365}
                step={1}
                style={{
                  background: `linear-gradient(to right, #F6F4EF 0%, #F6F4EF ${(days / 365) * 100}%, ${colors.purple[600]} ${(days / 365) * 100}%, ${colors.purple[600]} 100%)`,
                  height: "6px",
                  borderRadius: "3px",
                  outline: "none",
                  WebkitAppearance: "none",
                }}
              />
              <div className="mt-2 flex justify-between text-xs text-zinc-500">
                <span>1d</span>
                <span>90d</span>
                <span>180d</span>
                <span>365d</span>
              </div>
            </div>
          )}

          {/* Compound Frequency - Only for non-TestNet */}
          {!isTestNetMockYield && (
            <div>
              <label className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-zinc-600 flex items-center gap-1">
                  <Percent size={12} />
                  Compound Frequency
                </span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    "Daily",
                    "Weekly",
                    "Monthly",
                    "Quarterly",
                    "Annually",
                  ] as const
                ).map((freq) => (
                  <button
                    key={freq}
                    onClick={() => setCompoundFrequency(freq)}
                    className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                      compoundFrequency === freq
                        ? "bg-[var(--brand-purple)] text-white"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Returns Summary - Only for non-TestNet */}
          {!isTestNetMockYield && (
            <div className="rounded-xl bg-gradient-to-br from-zinc-50 to-zinc-100 p-4 ring-1 ring-zinc-200">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-600">Simple Return</span>
                  <span className="font-semibold text-zinc-900 tabular-nums">
                    <CountUp
                      start={0}
                      end={returns.simple}
                      duration={0.8}
                      decimals={2}
                      prefix="$"
                      preserveValue
                    />
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-600 flex items-center gap-1">
                    Compound Return
                    <Info size={10} className="text-zinc-400" />
                  </span>
                  <span className="font-semibold text-emerald-600 tabular-nums">
                    <CountUp
                      start={0}
                      end={returns.compound}
                      duration={0.8}
                      decimals={2}
                      prefix="+$"
                      preserveValue
                    />
                  </span>
                </div>

                <div className="h-px bg-zinc-200" />

                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-700">
                    Final Amount
                  </span>
                  <span className="text-lg font-bold text-zinc-900 tabular-nums">
                    <CountUp
                      start={amount}
                      end={returns.final}
                      duration={0.8}
                      decimals={2}
                      prefix="$"
                      separator=","
                      preserveValue
                    />
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-600">Effective APY</span>
                  <span className="text-sm font-semibold text-zinc-900 tabular-nums">
                    {returns.effectiveAPY.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Deposit/Withdrawal Tabs - Only for TestNet */}
          {isTestNetMockYield && (
            <div className="inline-flex rounded-lg bg-zinc-100 p-0.5 w-full">
              <button
                onClick={() => setActiveTab("deposit")}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all ${
                  activeTab === "deposit"
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-600"
                }`}
              >
                Deposit
              </button>
              <button
                onClick={() => setActiveTab("withdraw")}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all ${
                  activeTab === "withdraw"
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-600"
                }`}
              >
                Withdraw
              </button>
            </div>
          )}

          {/* Action Button */}
          <AnimatePresence mode="wait">
            {showSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700"
              >
                <CheckCircle size={16} />
                <span className="text-sm font-medium">
                  Redirecting to {data.protocol}...
                </span>
              </motion.div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  if (activeTab === "deposit") {
                    handleDeposit();
                  } else {
                    handleWithdraw();
                  }
                }}
                disabled={isTxLoading || walletStatus !== "ready"}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isTxLoading
                    ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                    : "bg-[var(--brand-purple)] text-white hover:bg-[var(--brand-purple-700)] shadow-sm"
                }`}
              >
                {isTxLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Processing...
                  </>
                ) : isTestNetMockYield ? (
                  <>
                    {activeTab === "deposit" ? (
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
                ) : isRouterMode ? (
                  <>
                    <AlertCircle size={16} />
                    Router Mode
                  </>
                ) : (
                  <>
                    Go to {data.protocol}
                    <ArrowUpRight size={16} />
                  </>
                )}
              </motion.button>
            )}
          </AnimatePresence>

          {/* Info Text */}
          <p className="text-xs text-zinc-500 text-center">
            {isTestNetMockYield
              ? `Demo Mode - ${activeTab === "deposit" ? "Deposit" : "Withdraw"} ALGO to TestNet Mock Yield Protocol`
              : isRouterMode
                ? "One-click routing will handle the deposit for you"
                : `You'll be redirected to ${data.protocol}. Non-custodial.`}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
