import {
  Application,
  Asset,
  Account,
  Uint64,
  Bool,
  ByteSlice
} from '../types';

// ARC-4 Method Selectors
export const MethodSelectors = {
  // Router methods
  SET_ALLOWED: 'setAllowed(application,bool)void',
  SET_PER_TX_CAP: 'setPerTxCap(uint64)void',
  PAUSE: 'pause(bool)void',
  ROUTE_DEPOSIT: 'routeDeposit(application,asset,uint64)void',
  ROUTE_WITHDRAW: 'routeWithdraw(application,asset,uint64)void',

  // Mock-Yield methods
  SET_APY: 'setApy(uint64)void',
  DEPOSIT: 'deposit(asset,uint64)void',
  WITHDRAW: 'withdraw(asset,uint64)void'
} as const;

// Encode method call arguments
export function encodeArgs(args: any[]): Uint8Array {
  // This is a simplified encoder - in production, use proper ARC-4 encoding
  const encoder = new TextEncoder();
  // Convert BigInt to string for JSON serialization
  const serializableArgs = args.map(arg =>
    typeof arg === 'bigint' ? arg.toString() : arg
  );
  return encoder.encode(JSON.stringify(serializableArgs));
}

// Decode method call results
export function decodeResult(data: Uint8Array): any {
  // This is a simplified decoder - in production, use proper ARC-4 decoding
  const decoder = new TextDecoder();
  return JSON.parse(decoder.decode(data));
}

// Generate method selector hash
export function getMethodSelector(methodSignature: string): Uint8Array {
  // Simple hash function for method selector (in production, use proper ARC-4 selector)
  const encoder = new TextEncoder();
  const data = encoder.encode(methodSignature);
  const hash = new Uint8Array(4);

  // Simple hash - in production, use proper cryptographic hash
  for (let i = 0; i < data.length; i++) {
    hash[i % 4] ^= data[i];
  }

  return hash;
}

// Validate ARC-4 types
export function validateArc4Type(value: any, type: string): boolean {
  switch (type) {
    case 'uint64':
      return typeof value === 'bigint' && value >= 0n && value <= 2n ** 64n - 1n;
    case 'bool':
      return typeof value === 'boolean';
    case 'application':
      return typeof value === 'number' && value >= 0 && value <= 2 ** 32 - 1;
    case 'asset':
      return typeof value === 'number' && value >= 0;
    case 'account':
      return typeof value === 'string' && value.length === 58; // Algorand address length
    default:
      return false;
  }
}