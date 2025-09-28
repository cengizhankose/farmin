"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

type Tier = "basic" | "standard" | "plus";

type Props = {
  amount?: number; // principal (USD)
  days?: number; // duration in days
  premiumRate30d?: number; // e.g., 0.18% per 30d => 0.0018
  coverageByTier?: Record<Tier, number>; // % of principal covered (0.6, 0.8, 0.9)
  deductiblePct?: number; // e.g., 0.10 (10%)
  coverageCapUSD?: number; // max payout cap in USD
  riskScore?: number; // 0-100
  className?: string;
  onChange?: (_data: {
    enabled: boolean;
    tier: Tier;
    premiumUSD: number;
    estimatedPayoutUSD: number;
  }) => void;
};

const defaultCoverageByTier: Record<Tier, number> = {
  basic: 0.6,
  standard: 0.8,
  plus: 0.9,
};

export function InsuranceCard({
  amount = 1000,
  days = 90,
  premiumRate30d = 0.0018, // %0.18 / 30gün
  coverageByTier = defaultCoverageByTier,
  deductiblePct = 0.1, // %10
  coverageCapUSD = 100000, // üst sınır
  riskScore = 27,
  className,
  onChange,
}: Props) {
  const [enabled, setEnabled] = React.useState(false);
  const [tier, setTier] = React.useState<Tier>("standard");

  // hesaplar
  const months = Math.max(1, Math.ceil(days / 30)); // basit: 1 ay taban
  const premiumUSD = enabled ? round(amount * premiumRate30d * months, 2) : 0;

  const coveredAmount = enabled ? amount * coverageByTier[tier] : 0;
  const deductibleUSD = enabled ? coveredAmount * deductiblePct : 0;

  const estimatedPayoutRaw = Math.max(0, coveredAmount - deductibleUSD);
  const estimatedPayoutUSD = enabled
    ? Math.min(estimatedPayoutRaw, coverageCapUSD)
    : 0;

  React.useEffect(() => {
    onChange?.({ enabled, tier, premiumUSD, estimatedPayoutUSD });
  }, [enabled, tier, premiumUSD, estimatedPayoutUSD, onChange]);

  return (
    <section
      className={[
        "sticky top-24 rounded-2xl p-5 sm:p-6",
        "bg-white/60 dark:bg-neutral-900/50",
        "backdrop-blur-sm ring-1 ring-black/5 dark:ring-white/10",
        "shadow-sm",
        className ?? "",
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/40">
            <ShieldCheckIcon className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <div className="font-display text-lg text-neutral-900 dark:text-white">
              Yield Insurance
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              Protect your principal with transparent terms
            </div>
          </div>
        </div>

        {/* Enable Switch */}
        <button
          type="button"
          onClick={() => setEnabled((v) => !v)}
          className={[
            "relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full",
            enabled ? "bg-emerald-500" : "bg-neutral-300 dark:bg-neutral-700",
            "transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400/50",
          ].join(" ")}
          aria-pressed={enabled}
          aria-label="Protect with insurance"
        >
          <span
            className={[
              "pointer-events-none absolute left-1 top-1 inline-block h-6 w-6 transform rounded-full bg-white dark:bg-neutral-100 shadow transition",
              enabled ? "translate-x-6" : "translate-x-0",
            ].join(" ")}
          />
        </button>
      </div>

      {/* Collapsible content */}
      <AnimatePresence initial={false}>
        {enabled && (
          <motion.div
            key="ins-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            {/* Tier selector */}
            <div className="mt-5 grid grid-cols-3 gap-2">
              {(["basic", "standard", "plus"] as Tier[]).map((t) => {
                const active = tier === t;
                const label =
                  t === "basic"
                    ? "Basic"
                    : t === "standard"
                      ? "Standard"
                      : "Plus";
                const covPct = coverageByTier[t] * 100;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTier(t)}
                    className={[
                      "rounded-xl px-3 py-2.5 text-sm font-medium",
                      "ring-1 transition",
                      active
                        ? "bg-emerald-500 text-white ring-emerald-500"
                        : "bg-white/50 dark:bg-neutral-800/60 text-neutral-800 dark:text-neutral-200 ring-black/10 dark:ring-white/10 hover:bg-white/80 dark:hover:bg-neutral-800",
                    ].join(" ")}
                  >
                    {label}{" "}
                    <span className="opacity-80">({covPct.toFixed(0)}%)</span>
                  </button>
                );
              })}
            </div>

            {/* Summary grid */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Stat
                label="Premium"
                valueUSD={premiumUSD}
                accent="purple"
                hint={`≈ ${(premiumRate30d * 100).toFixed(2)}% / 30d × ${months} mo`}
              />
              <Stat
                label="Covered Amount"
                valueUSD={coveredAmount}
                accent="blue"
                hint={`${(coverageByTier[tier] * 100).toFixed(0)}% of principal`}
              />
              <Stat
                label="Deductible"
                valueUSD={deductibleUSD}
                accent="amber"
                hint={`${(deductiblePct * 100).toFixed(0)}% of covered`}
              />
              <Stat
                label="Est. Payout (max)"
                valueUSD={estimatedPayoutUSD}
                accent="emerald"
                hint={`Cap: $${abbr(coverageCapUSD)}`}
              />
            </div>

            {/* Coverage in / out */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ListCard
                title="Covered"
                items={[
                  "Protocol bankruptcy / exploit†",
                  "Smart-contract critical bug",
                  "LP insolvency due to depeg",
                ]}
                accent="emerald"
              />
              <ListCard
                title="Not Covered"
                items={[
                  "Self-custody loss (seed/ledger)",
                  "Market price drop / IL",
                  "Sanctions or KYC failure",
                ]}
                accent="rose"
              />
            </div>

            {/* Risk strip */}
            <div className="mt-6 flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-400/5 px-3 py-2 ring-1 ring-emerald-400/20">
              <div className="text-xs text-neutral-600 dark:text-neutral-300">
                Market condition: <b>Low Volatility</b> • Your risk score:{" "}
                <b>{riskScore}/100</b>
              </div>
              <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
                †Requires post-mortem & oracle verification
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ——— Helpers ——— */

function round(n: number, p = 2) {
  return Math.round(n * 10 ** p) / 10 ** p;
}

function abbr(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v.toFixed(0);
}

function Stat({
  label,
  valueUSD,
  hint,
  accent = "emerald",
}: {
  label: string;
  valueUSD: number;
  hint?: string;
  accent?: "emerald" | "purple" | "blue" | "amber";
}) {
  const ring =
    accent === "emerald"
      ? "ring-emerald-400/40"
      : accent === "purple"
        ? "ring-purple-400/40"
        : accent === "blue"
          ? "ring-sky-400/40"
          : "ring-amber-400/40";

  return (
    <div
      className={[
        "rounded-xl p-3 sm:p-4 bg-white/60 dark:bg-neutral-800/60 backdrop-blur",
        "ring-1",
        ring,
      ].join(" ")}
    >
      <div className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {label}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mt-0.5 font-display text-lg text-neutral-900 dark:text-white tabular-nums"
      >
        ${valueUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </motion.div>
      {hint ? (
        <div className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
          {hint}
        </div>
      ) : null}
    </div>
  );
}

function ListCard({
  title,
  items,
  accent = "emerald",
}: {
  title: string;
  items: string[];
  accent?: "emerald" | "rose";
}) {
  const dot = accent === "emerald" ? "bg-emerald-400" : "bg-rose-400";

  return (
    <div className="rounded-xl p-3 sm:p-4 ring-1 ring-black/5 dark:ring-white/10 bg-white/60 dark:bg-neutral-800/60">
      <div className="mb-1.5 text-sm font-semibold text-neutral-900 dark:text-white">
        {title}
      </div>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-[13px] text-neutral-700 dark:text-neutral-300"
          >
            <span className={`mt-1 h-2 w-2 rounded-full ${dot}`} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
