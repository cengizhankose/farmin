// ARC-4 ABI Types for Router and Mock-Yield contracts

// Router Contract ABI Methods
export interface RouterABI {
  // Set allowed status for a target application
  setAllowed(targetAppId: number, allowed: boolean): void;

  // Set per-transaction cap
  setPerTxCap(cap: bigint): void;

  // Pause/unpause contract
  pause(paused: boolean): void;

  // Route deposit to target application
  routeDeposit(targetAppId: number, assetId: number, amount: bigint): void;

  // Route withdrawal from target application
  routeWithdraw(targetAppId: number, assetId: number, amount: bigint): void;
}

// Mock-Yield Contract ABI Methods
export interface MockYieldABI {
  // Set APY in basis points (e.g., 500 = 5%)
  setApy(apyBps: number): void;

  // Deposit assets into yield contract
  deposit(assetId: number, amount: bigint): void;

  // Withdraw assets from yield contract
  withdraw(assetId: number, amount: bigint): void;
}

// Common ARC-4 Types
export type Application = number;
export type Asset = number;
export type Account = string;
export type Uint64 = bigint;
export type Bool = boolean;
export type ByteSlice = Uint8Array;

// Global State Keys
export const RouterGlobalState = {
  ADMIN: 'admin',
  PAUSED: 'paused',
  PER_TX_CAP: 'per_txCap',
  ALLOWED_PREFIX: 'allowed_'
} as const;

export const MockYieldGlobalState = {
  ADMIN: 'admin',
  APY_BPS: 'apy_bps',
  TVL: 'tvl'
} as const;

// Local State Keys
export const MockYieldLocalState = {
  AMOUNT: 'amount',
  DEPOSIT_TS: 'deposit_ts'
} as const;

// Constants
export const YEAR_BPS = 10000n * 365n; // Basis points per year
export const ALGO_ASSET_ID = 0; // ALGO is asset ID 0