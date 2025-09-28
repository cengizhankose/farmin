"use client";
import React from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { Logger } from "@/lib/adapters/real";
import { Card, Button } from "@/components/ui/primitives";
import { toast } from "sonner";
import { colors } from "../lib/colors";
import { AccountSummary } from "@/components/portfolio/AccountSummary";
import { PositionsList } from "@/components/portfolio/PositionsList";
import PortfolioOverviewChart from "@/components/PortfolioOverviewChart";
import { ActivityFeed } from "@/components/portfolio/ActivityFeed";
import { toCSV, downloadCSV } from "@/lib/csv";
import { usePortfolioStoreSSR } from "@/hooks/usePortfolioStore";
import { debugStorage } from "@/lib/storage-debug";

// Type for compatibility with existing components
interface PortfolioTransaction {
  id: string;
  protocol: string;
  pair: string;
  chain: string;
  apr: number;
  apy: number;
  amount: number;
  days: number;
  ts: number;
  txid?: string;
  type: 'deposit' | 'withdrawal';
  rewardToken?: string;
  risk: 'Low' | 'Medium' | 'High';
}

type RedirectEntry = PortfolioTransaction & {
  action?: "Deposit" | "Withdraw";
};

export default function PortfolioPage() {
  const {
    transactions,
    addTransaction,
    removeTransaction,
    clearTransactions,
    getTotalValue,
    getTotalEstimatedReturn,
    hasHydrated,
  } = usePortfolioStoreSSR();

  const [period, setPeriod] = React.useState<"24H" | "7D" | "30D">("30D");
  const [loading, setLoading] = React.useState(!hasHydrated);

  // Overview chart row type for explicit shape
  type OverviewRow = { t: string; total: number; pnl: number; chg24h: number };
  const [overviewByPeriod, setOverviewByPeriod] = React.useState<
    Record<"24H" | "7D" | "30D", OverviewRow[]>
  >({
    "24H": [],
    "7D": [],
    "30D": [],
  });

  // Deterministic pseudo-random for stable mock data
  const seeded = (seed: number) => {
    let s = seed;
    return () => {
      s = (s * 1664525 + 1013904223) % 0xffffffff;
      return s / 0xffffffff;
    };
  };

  const genOverview = (
    points: number,
    seed: number,
    baseTotal: number,
  ): OverviewRow[] => {
    const rnd = seeded(seed);
    const out: OverviewRow[] = [];
    let total = baseTotal;
    let pnl = 0;
    // Use fixed base date (day precision) to avoid hydration mismatches
    const baseDate = new Date(Math.floor(Date.now() / 86400000) * 86400000);
    for (let i = points - 1; i >= 0; i--) {
      const drift = (rnd() - 0.48) * 0.02; // ~±2%
      const change = total * drift;
      total = Math.max(1500, total + change);
      pnl += change * 0.5;
      const dt = new Date(baseDate.getTime() - i * 24 * 3600 * 1000);
      out.push({
        t: dt.toISOString().slice(0, 10),
        total: Math.round(total),
        pnl: Math.round(pnl),
        chg24h: Math.round(change),
      });
    }
    return out;
  };

  React.useEffect(() => {
    if (!hasHydrated) return;

    // Debug storage state
    if (process.env.NODE_ENV === 'development') {
      debugStorage.logStorageState();
    }

    // Initialize with mock data based on current portfolio value
    const totalValue = getTotalValue();
    const seed = 1337;
    const baseTotal = totalValue || 10_000;

    setOverviewByPeriod({
      "24H": genOverview(24, seed + 1, Math.round(baseTotal * 0.98)),
      "7D": genOverview(7, seed + 2, baseTotal),
      "30D": genOverview(30, seed + 3, Math.round(baseTotal * 0.92)),
    });

    setLoading(false);
  }, [getTotalValue, hasHydrated]);

  // Convert transactions to RedirectEntry format for compatibility
  const redirectEntries: RedirectEntry[] = React.useMemo(() => {
    return transactions.map(tx => ({
      ...tx,
      action: tx.type === 'deposit' ? 'Deposit' : 'Withdraw',
    }));
  }, [transactions]);

  const clear = () => {
    Logger.info("🧽 Clearing portfolio data...");
    clearTransactions();
    toast("Cleared", { description: "Portfolio history cleared." });
  };

  const exportCSV = () => {
    Logger.info("📄 Exporting portfolio to CSV...");
    const withEst = transactions.map((r) => ({
      Date: new Date(r.ts).toLocaleString(),
      Type: r.type,
      Protocol: r.protocol,
      Pair: r.pair,
      Amount: r.amount,
      APR: r.apr,
      APY: r.apy,
      Days: r.days,
      Chain: r.chain,
      Risk: r.risk,
      EstimatedReturn: (r.amount * (r.apr / 100) * (r.days / 365)).toFixed(2),
    }));

    const csv = toCSV(withEst, [
      "Date",
      "Type",
      "Protocol",
      "Pair",
      "Amount",
      "APR",
      "APY",
      "Days",
      "Chain",
      "Risk",
      "EstimatedReturn",
    ]);
    downloadCSV("portfolio.csv", csv);
    Logger.info(`✅ Exported ${transactions.length} portfolio entries to CSV`);
  };

  const emptyIllustration =
    "https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?auto=format&fit=crop&q=80&w=1200";

  return (
    <>
      <Head>
        <title>Portfolio | Farmin UI</title>
        <meta
          name="description"
          content="Track your yield farming portfolio, view positions, and monitor your returns on Farmin UI."
        />
        <meta property="og:title" content="Portfolio | Farmin UI" />
        <meta
          property="og:description"
          content="Track your yield farming portfolio, view positions, and monitor your returns on Farmin UI."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Portfolio | Farmin UI" />
        <meta
          name="twitter:description"
          content="Track your yield farming portfolio, view positions, and monitor your returns on Farmin UI."
        />
      </Head>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="typo-portfolio-h1">Portfolio</h1>
        <p className="typo-portfolio-sub max-w-2xl">
          💼 Track your yield farming portfolio across multiple protocols on Algorand
        </p>

        {/* Portfolio Status Indicator */}
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center space-x-3">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
            <div>
              <p className="text-sm font-medium text-blue-800">
                🚀 Portfolio System Ready
              </p>
              <p className="text-sm text-blue-700">
                Connected to Algorand network - Tracking your DeFi positions
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
              Loading portfolio data...
            </div>
          </div>
        ) : transactions.length === 0 ? (
          <Card className="mt-8 overflow-hidden border-white/40 bg-white/60 backdrop-blur-2xl">
            <div className="relative h-48 w-full">
              <Image
                src={emptyIllustration}
                alt="empty"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="typo-section-h">Start farming now</h3>
              <p className="typo-empty mt-1">
                Explore opportunities and use the deposit button to add entries
                here.
              </p>
              <Link
                href="/opportunities"
                className="typo-link-primary mt-4 inline-block"
              >
                Browse opportunities →
              </Link>
            </div>
          </Card>
        ) : (
          <>
            {/* Period Toggle */}
            <div className="mt-6 flex justify-center">
              <div className="inline-flex rounded-lg bg-zinc-100 p-1">
                {(["24H", "7D", "30D"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`typo-toggle px-4 py-2 rounded-md transition-colors ${
                      period === p
                        ? "bg-[#8C45FF] text-white shadow-sm"
                        : "text-zinc-700 hover:bg-zinc-200"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <PortfolioOverviewChart
                period={period}
                data={overviewByPeriod[period]}
              />
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <AccountSummary rows={redirectEntries as any} />
            </div>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <PositionsList rows={redirectEntries as any} />
            <Card className="mt-6 border-white/40 bg-white/60 p-4 backdrop-blur-2xl">
              <div className="flex items-center justify-between px-2">
                <h3 className="typo-section-h">Recent activity</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={exportCSV}
                    className={`border-[${colors.zinc[300]}]`}
                  >
                    Export CSV
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clear}
                    className={`border-[${colors.zinc[300]}]`}
                  >
                    Clear
                  </Button>
                  {process.env.NODE_ENV === 'development' && (
                    <Button
                      variant="outline"
                      onClick={() => debugStorage.rehydrateStore()}
                      className={`border-[${colors.zinc[300]}]`}
                    >
                      Rehydrate
                    </Button>
                  )}
                </div>
              </div>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <ActivityFeed rows={redirectEntries as any} />
            </Card>
          </>
        )}
      </div>
    </>
  );
}