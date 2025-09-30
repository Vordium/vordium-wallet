import { create } from 'zustand';

export type ChainType = 'EVM' | 'TRON';

export interface WalletAccount {
  id: string;
  name: string;
  address: string;
  chain: ChainType;
}

export interface WalletState {
  accounts: WalletAccount[];
  selectedAccountId: string | null;
  addAccount: (account: WalletAccount) => void;
  removeAccount: (id: string) => void;
  selectAccount: (id: string) => void;
  renameAccount: (id: string, name: string) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  accounts: [],
  selectedAccountId: null,
  addAccount: (account) => set((state) => ({ accounts: [...state.accounts, account] })),
  removeAccount: (id) =>
    set((state) => ({
      accounts: state.accounts.filter((a) => a.id !== id),
      selectedAccountId: state.selectedAccountId === id ? null : state.selectedAccountId,
    })),
  selectAccount: (id) => set(() => ({ selectedAccountId: id })),
  renameAccount: (id, name) =>
    set((state) => ({
      accounts: state.accounts.map((a) => (a.id === id ? { ...a, name } : a)),
    })),
}));


