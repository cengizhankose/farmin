import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface PortfolioTransaction {
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

interface PortfolioState {
  transactions: PortfolioTransaction[];
  addTransaction: (transaction: Omit<PortfolioTransaction, 'id' | 'ts'> & { id?: string }) => void;
  removeTransaction: (id: string) => void;
  clearTransactions: () => void;
  getTransactions: () => PortfolioTransaction[];
  getTotalValue: () => number;
  getTotalEstimatedReturn: () => number;
}

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      transactions: [],

      addTransaction: (transaction) => {
        const newTransaction: PortfolioTransaction = {
          ...transaction,
          id: transaction.id || `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ts: Date.now(),
        };

        set((state) => ({
          transactions: [...state.transactions, newTransaction],
        }));
      },

      removeTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((tx) => tx.id !== id),
        }));
      },

      clearTransactions: () => {
        set({ transactions: [] });
      },

      getTransactions: () => {
        return get().transactions;
      },

      getTotalValue: () => {
        const transactions = get().transactions;
        return transactions
          .filter(tx => tx.type === 'deposit')
          .reduce((total, tx) => total + tx.amount, 0);
      },

      getTotalEstimatedReturn: () => {
        const transactions = get().transactions;
        return transactions
          .filter(tx => tx.type === 'deposit')
          .reduce((total, tx) => {
            const daysHeld = (Date.now() - tx.ts) / (1000 * 60 * 60 * 24);
            const estimatedReturn = (tx.amount * (tx.apr / 100) * (daysHeld / 365));
            return total + estimatedReturn;
          }, 0);
      },
    }),
    {
      name: 'portfolio-storage',
      storage: isBrowser ? createJSONStorage(() => localStorage) : undefined,
      partialize: (state) => ({
        transactions: state.transactions,
      }),
      onRehydrateStorage: () => (state) => {
        if (isBrowser) {
          console.log('Portfolio store hydrated:', state?.transactions?.length || 0, 'transactions');
        }
      },
      skipHydration: !isBrowser,
    }
  )
);