import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ChainType = 'EVM' | 'TRON';

export interface WalletAccount {
  id: string;
  name: string;
  address: string;
  chain: ChainType;
  index?: number;
  publicKey?: string;
  derivationPath?: string;
}

export interface Wallet {
  id: string;
  name: string;
  accounts: WalletAccount[];
  createdAt: number;
}

export interface WalletState {
  // Legacy single-wallet support (backwards compatible)
  accounts: WalletAccount[];
  selectedAccountId: string | null;
  
  // Multi-wallet support
  wallets: Wallet[];
  currentWalletId: string | null;
  
  // Legacy actions
  addAccount: (account: WalletAccount) => void;
  removeAccount: (id: string) => void;
  selectAccount: (id: string) => void;
  renameAccount: (id: string, name: string) => void;
  
  // Multi-wallet actions
  addWallet: (wallet: Wallet) => void;
  removeWallet: (id: string) => void;
  setCurrentWallet: (id: string) => void;
  renameWallet: (id: string, name: string) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      // Legacy state
      accounts: [],
      selectedAccountId: null,
      
      // Multi-wallet state
      wallets: [],
      currentWalletId: null,
      
      // Legacy actions (maintain backwards compatibility)
      addAccount: (account) =>
        set((state) => {
          const newAccounts = [...state.accounts, account];
          
          // Also sync to current wallet if exists
          if (state.currentWalletId) {
            const updatedWallets = state.wallets.map(w =>
              w.id === state.currentWalletId
                ? { ...w, accounts: [...w.accounts, account] }
                : w
            );
            return { accounts: newAccounts, wallets: updatedWallets };
          }
          
          return { accounts: newAccounts };
        }),
        
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
      
      // Multi-wallet actions
      addWallet: (wallet) =>
        set((state) => {
          const newWallets = [...state.wallets, wallet];
          return {
            wallets: newWallets,
            currentWalletId: wallet.id,
            accounts: wallet.accounts,
            selectedAccountId: wallet.accounts[0]?.id || null,
          };
        }),
        
      removeWallet: (id) =>
        set((state) => {
          const filtered = state.wallets.filter(w => w.id !== id);
          const newCurrent = filtered[0]?.id || null;
          const newAccounts = filtered[0]?.accounts || [];
          
          return {
            wallets: filtered,
            currentWalletId: newCurrent,
            accounts: newAccounts,
            selectedAccountId: newAccounts[0]?.id || null,
          };
        }),
        
      setCurrentWallet: (id) =>
        set((state) => {
          const wallet = state.wallets.find(w => w.id === id);
          if (!wallet) return state;
          
          return {
            currentWalletId: id,
            accounts: wallet.accounts,
            selectedAccountId: wallet.accounts[0]?.id || null,
          };
        }),
        
      renameWallet: (id, name) =>
        set((state) => ({
          wallets: state.wallets.map(w => (w.id === id ? { ...w, name } : w)),
        })),
    }),
    {
      name: 'vordium-wallet-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
