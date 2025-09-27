"use client";
import React from "react";

type MarketMetricCardProps = {
  primaryText: string;
  secondaryText: string;
  className?: string;
};

export function MarketMetricCard({
  primaryText,
  secondaryText,
  className = "",
}: MarketMetricCardProps) {
  return (
    <div className={`mmc-outer ${className}`}>
      <div className="mmc-dot" />
      <div className="mmc-card">
        <div className="mmc-ray" />
        <div className="mmc-text">{primaryText}</div>
        <div className="mmc-sub">{secondaryText}</div>
        <div className="mmc-line mmc-topl" />
        <div className="mmc-line mmc-leftl" />
        <div className="mmc-line mmc-bottoml" />
        <div className="mmc-line mmc-rightl" />
      </div>
    </div>
  );
}

export default MarketMetricCard;
