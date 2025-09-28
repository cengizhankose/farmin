"use client";

import React, { useState, useRef } from "react";

interface YieldData {
  logoSvg: string;
  yieldName: string;
  tvl: string;
  risk: "Low" | "Medium" | "High";
}

interface YieldBannerProps {
  data?: YieldData[];
  speed?: number;
}

const defaultData: YieldData[] = [
  {
    logoSvg: "📈",
    yieldName: "Ethereum Staking",
    tvl: "$2.4M",
    risk: "Low"
  },
  {
    logoSvg: "💰",
    yieldName: "USDC Liquidity Pool",
    tvl: "$1.8M",
    risk: "Medium"
  },
  {
    logoSvg: "🔥",
    yieldName: "High Yield DeFi",
    tvl: "$3.2M",
    risk: "High"
  },
  {
    logoSvg: "💎",
    yieldName: "Blue Chip Vault",
    tvl: "$5.1M",
    risk: "Low"
  },
  {
    logoSvg: "⚡",
    yieldName: "Flash Loan Protocol",
    tvl: "$0.9M",
    risk: "Medium"
  }
];

const getRiskColor = (risk: string) => {
  switch (risk) {
    case "Low":
      return "#22c55e";
    case "Medium":
      return "#facc15";
    case "High":
      return "#ef4444";
    default:
      return "#ffffff";
  }
};

export const YieldBanner: React.FC<YieldBannerProps> = ({
  data = defaultData,
  speed = 50
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="relative w-full bg-black border-t border-b border-[#111111] overflow-hidden"
      style={{ height: "25px" }}
      ref={containerRef}
    >
      <div
        ref={contentRef}
        className="flex items-center whitespace-nowrap"
        style={{
          animation: `marquee ${data.length * speed / 20}s linear infinite`,
          willChange: "transform"
        }}
      >
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-4 mx-8">
            <span className="text-white opacity-90">{item.logoSvg}</span>
            <span className="text-white opacity-90 font-medium text-sm tracking-[-0.01em]">
              {item.yieldName}
            </span>
            <span className="text-white opacity-75 text-sm tracking-[-0.01em]">
              TVL: {item.tvl}
            </span>
            <span
              className="text-sm font-medium tracking-[-0.01em]"
              style={{ color: getRiskColor(item.risk) }}
            >
              Risk: {item.risk}
            </span>
          </div>
        ))}
        {/* First duplicate for seamless loop */}
        {data.map((item, index) => (
          <div key={`duplicate-${index}`} className="flex items-center gap-4 mx-8">
            <span className="text-white opacity-90">{item.logoSvg}</span>
            <span className="text-white opacity-90 font-medium text-sm tracking-[-0.01em]">
              {item.yieldName}
            </span>
            <span className="text-white opacity-75 text-sm tracking-[-0.01em]">
              TVL: {item.tvl}
            </span>
            <span
              className="text-sm font-medium tracking-[-0.01em]"
              style={{ color: getRiskColor(item.risk) }}
            >
              Risk: {item.risk}
            </span>
          </div>
        ))}
        {/* Second duplicate for seamless loop */}
        {data.map((item, index) => (
          <div key={`duplicate2-${index}`} className="flex items-center gap-4 mx-8">
            <span className="text-white opacity-90">{item.logoSvg}</span>
            <span className="text-white opacity-90 font-medium text-sm tracking-[-0.01em]">
              {item.yieldName}
            </span>
            <span className="text-white opacity-75 text-sm tracking-[-0.01em]">
              TVL: {item.tvl}
            </span>
            <span
              className="text-sm font-medium tracking-[-0.01em]"
              style={{ color: getRiskColor(item.risk) }}
            >
              Risk: {item.risk}
            </span>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(-33.333%);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};