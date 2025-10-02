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
  privateKey?: string;
  derivationPath?: string;
}

export interface Wallet {
  id: string;
  name: string;
  accounts: WalletAccount[];
  createdAt: number;
}

export interface Token {
  symbol: string;
  name: string;
  address: string;
  chain: 'Ethereum' | 'Tron';
  decimals: number;
  balance: string;
  logo: string;
  isNative: boolean;
  usdValue: string;
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
  
  // Token management
  addToken: (token: Token) => void;
  removeToken: (tokenAddress: string, chain: string) => void;
  getTokens: () => Token[];
}

// Helper functions for loading from localStorage
const loadWallets = (): Wallet[] => {
  try {
    const stored = localStorage.getItem('vordium-wallets');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const loadCurrentWallet = (): string | null => {
  try {
    return localStorage.getItem('vordium-current-wallet');
  } catch {
    return null;
  }
};

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => {
      const initialWallets = loadWallets();
      const initialCurrentWallet = loadCurrentWallet();
      const currentWallet = initialWallets.find(w => w.id === initialCurrentWallet);

      return {
        // Legacy state
        accounts: currentWallet?.accounts || [],
        selectedAccountId: currentWallet?.accounts[0]?.id || null,
        
        // Multi-wallet state
        wallets: initialWallets,
        currentWalletId: initialCurrentWallet,
      
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
          // Persist to localStorage for cross-session persistence
          localStorage.setItem('vordium-wallets', JSON.stringify(newWallets));
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
          
          // Persist to localStorage
          localStorage.setItem('vordium-wallets', JSON.stringify(filtered));
          
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
          
          // Persist current wallet selection
          localStorage.setItem('vordium-current-wallet', id);
          
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
      
      // Token management
      addToken: (token) => {
        const tokens = get().getTokens();
        const exists = tokens.some(t => t.address === token.address && t.chain === token.chain);
        if (!exists) {
          const newTokens = [...tokens, token];
          localStorage.setItem('vordium-tokens', JSON.stringify(newTokens));
        }
      },
      removeToken: (tokenAddress, chain) => {
        const tokens = get().getTokens();
        const newTokens = tokens.filter(t => !(t.address === tokenAddress && t.chain === chain));
        localStorage.setItem('vordium-tokens', JSON.stringify(newTokens));
      },
      getTokens: () => {
        try {
          const stored = localStorage.getItem('vordium-tokens');
          return stored ? JSON.parse(stored) : [];
        } catch {
          return [];
        }
      },
    };
    },
    {
      name: 'vordium-wallet-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
