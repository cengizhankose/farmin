export type ChainId = "ethereum" | "solana";

export const CHAINS: { id: ChainId; label: string; enabled: boolean }[] = [
  { id: "ethereum", label: "Ethereum", enabled: false },
  { id: "solana", label: "Solana", enabled: false }
];

// Optional icon metadata for small badges in UI
export const CHAIN_META: Record<ChainId, { label: string; icon?: string }> = {
  ethereum: { label: "Ethereum", icon: "/chains/ethereum.svg" },
  solana: { label: "Solana", icon: "/chains/solana.svg" },
};

export function chainIcon(id: ChainId | string): string | undefined {
  try {
    return CHAIN_META[id as ChainId]?.icon;
  } catch {
    return undefined;
  }
}
