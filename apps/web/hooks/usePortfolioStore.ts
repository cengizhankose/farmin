'use client';

import { usePortfolioStore } from '@/stores/usePortfolio';
import { useEffect, useState } from 'react';

// Hook to handle store hydration
export function usePortfolioStoreWithHydration() {
  const store = usePortfolioStore();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    // This will run only on the client side
    setHasHydrated(true);

    // Listen for storage changes (for cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'portfolio-storage') {
        // Force rehydration when storage changes
        usePortfolioStore.persist.rehydrate();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Return store with hydration state
  return {
    ...store,
    hasHydrated,
  };
}

// Hook for SSR-safe store access
export function usePortfolioStoreSSR() {
  const store = usePortfolioStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Return empty/default state during SSR
  if (!isClient) {
    return {
      transactions: [],
      addTransaction: () => {},
      removeTransaction: () => {},
      clearTransactions: () => {},
      getTransactions: () => [],
      getTotalValue: () => 0,
      getTotalEstimatedReturn: () => 0,
      hasHydrated: false,
    };
  }

  return {
    ...store,
    hasHydrated: true,
  };
}