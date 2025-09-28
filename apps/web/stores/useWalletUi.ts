import { create } from 'zustand';

interface WalletUiState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useWalletUi = create<WalletUiState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));