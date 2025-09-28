"use client";
import React from "react";
import MarketMetricCard from "./MarketMetricCard";

export function Market({ progress = 0 }: { progress?: number }) {
  return (
    <section className="h-full">
      <div className="mx-auto flex h-full max-w-6xl items-center px-6 pt-20">
        <div
          className="w-full text-center"
          style={{
            transform: `translateY(${(1 - progress) * 20}px)`,
            transition: "transform 120ms linear",
          }}
        >
          <div className="typo-eyebrow text-white">Market Environment</div>
          <h2 className="typo-h2 text-white">
            Built with awareness of liquidity, risk, and opportunity
          </h2>
          <p className="text-white/80 text-base leading-relaxed max-w-3xl mx-auto mt-6">
            High APR in DeFi is often illusory. We match high returns with solid
            liquidity, street-tested mechanics, and risk measurement. We've
            built an infrastructure that tracks the market and responds
            immediately to anomalies.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <MarketMetricCard
              className="h-[250px]"
              primaryText="Withdraw anytime with zero friction & no hidden fees"
              secondaryText=""
            />
            <MarketMetricCard
              className="h-[250px]"
              primaryText="$50M+ liquidity analyzed daily"
              secondaryText=""
            />
            <MarketMetricCard
              className="h-[250px]"
              primaryText="Insurance-backed, multi-metric risk score"
              secondaryText=""
            />
          </div>
          <div className="mt-12">
            <h3 className="typo-h3 text-white mb-4">
              First insurance-integrated yield aggregator on Algorand
            </h3>
            <p className="text-white/70 text-sm">
              Not just yield — audited safety layer.
            </p>
            <p className="text-white/60 text-xs mt-3">
              More than metrics. A new standard of safety in DeFi.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
