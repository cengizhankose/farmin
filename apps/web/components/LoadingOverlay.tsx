"use client";
import React from "react";

type LoadingOverlayProps = {
  show: boolean;
  label?: string;
};

export function LoadingOverlay({
  show,
  label = "Loading",
}: LoadingOverlayProps) {
  if (!show) return null;
  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <svg
        className="loading-svg"
        width="144"
        height="144"
        viewBox="0 0 200 200"
        aria-hidden="true"
      >
        <circle
          className="loading-circle"
          cx="100"
          cy="100"
          r="91"
          fill="transparent"
          stroke="url(#loadingGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          pathLength={"572"}
        />
        <text
          x="100"
          y="110"
          textAnchor="middle"
          className="loading-text"
          fontSize="14"
          fill="#e5e5e5"
          fontFamily="var(--font-display)"
          letterSpacing="0.04em"
        >
          {label}
        </text>
        <defs>
          <linearGradient id="loadingGradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#000" />
            <stop offset="50%" stopColor="#fff" />
            <stop offset="100%" stopColor="#000" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default LoadingOverlay;
