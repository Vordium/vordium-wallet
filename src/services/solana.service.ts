// Solana Service - Live Solana blockchain integration
import { API_CONFIG } from '@/config/api.config';

export interface SolanaTransaction {
  signature: string;
  slot: number;
  blockTime: number;
  fee: number;
  accounts: string[];
  preBalances: number[];
  postBalances: number[];
  instructions: Array<{
    programId: string;
    accounts: number[];
    data: string;
  }>;
}

export interface SolanaTokenAccount {
  account: string;
  amount: string;
  decimals: number;
  uiAmount: number;
  mint: string;
  owner: string;
}

export interface SolanaPrice {
  symbol: string;
  price: number;
  timestamp: number;
}

export interface SolanaTokenMetadata {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  logo?: string;
  description?: string;
}

export class SolanaService {
  private static cache = new Map<string, { data: any; timestamp: number }>();
  private static readonly CACHE_DURATION = 30000; // 30 seconds

  // Get Solana balance for an address
  static async getBalance(address: string): Promise<string> {
    try {
      const cacheKey = `balance-${address}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached.balance;

      if (API_CONFIG.HELIUS.ENABLED && API_CONFIG.HELIUS.API_KEY) {
        const balance = await this.getHeliusBalance(address);
        if (balance !== null) {
          this.setCachedData(cacheKey, { balance });
          return balance;
        }
      }

      // Fallback to direct RPC call
      const balance = await this.getRPCBalance(address);
      if (balance !== null) {
        this.setCachedData(cacheKey, { balance });
        return balance;
      }

      console.warn('All Solana APIs failed, returning 0 balance');
      return '0';
    } catch (error) {
      console.error('Error getting Solana balance:', error);
      return '0';
    }
  }

  // Get Solana transactions for an address
  static async getTransactions(address: string, limit: number = 50): Promise<SolanaTransaction[]> {
    try {
      const cacheKey = `transactions-${address}-${limit}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached.transactions;

      if (API_CONFIG.HELIUS.ENABLED) {
        const transactions = await this.getHeliusTransactions(address, limit);
        if (transactions) {
          this.setCachedData(cacheKey, { transactions });
          return transactions;
        }
      }

      // Fallback to direct RPC call
      const transactions = await this.getRPCTransactions(address, limit);
      if (transactions) {
        this.setCachedData(cacheKey, { transactions });
        return transactions;
      }

      console.warn('No Solana API configured, returning empty transactions');
      return [];
    } catch (error) {
      console.error('Error getting Solana transactions:', error);
      return [];
    }
  }

  // Get Solana token accounts for an address
  static async getTokenAccounts(address: string): Promise<SolanaTokenAccount[]> {
    try {
      const cacheKey = `token-accounts-${address}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached.tokenAccounts;

      if (API_CONFIG.HELIUS.ENABLED) {
        const tokenAccounts = await this.getHeliusTokenAccounts(address);
        if (tokenAccounts) {
          this.setCachedData(cacheKey, { tokenAccounts });
          return tokenAccounts;
        }
      }

      // Fallback to direct RPC call
      const tokenAccounts = await this.getRPCTokenAccounts(address);
      if (tokenAccounts) {
        this.setCachedData(cacheKey, { tokenAccounts });
        return tokenAccounts;
      }

      return [];
    } catch (error) {
      console.error('Error getting Solana token accounts:', error);
      return [];
    }
  }

  // Get Solana token metadata
  static async getTokenMetadata(mint: string): Promise<SolanaTokenMetadata | null> {
    try {
      const cacheKey = `token-metadata-${mint}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached.metadata;

      if (API_CONFIG.HELIUS.ENABLED) {
        const metadata = await this.getHeliusTokenMetadata(mint);
        if (metadata) {
          this.setCachedData(cacheKey, { metadata });
          return metadata;
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting Solana token metadata:', error);
      return null;
    }
  }

  // Get Solana price
  static async getPrice(): Promise<SolanaPrice | null> {
    try {
      const cacheKey = 'solana-price';
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached.price;

      if (API_CONFIG.COINGECKO.ENABLED) {
        const price = await this.getCoinGeckoPrice();
        if (price) {
          this.setCachedData(cacheKey, { price });
          return price;
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting Solana price:', error);
      return null;
    }
  }

  // Validate Solana address
  static validateAddress(address: string): boolean {
    // Basic Solana address validation (base58, 32-44 characters)
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return base58Regex.test(address);
  }

  // Get balance from Helius
  private static async getHeliusBalance(address: string): Promise<string | null> {
    try {
      const url = `${API_CONFIG.HELIUS.API_URL}/rpc?api-key=${API_CONFIG.HELIUS.API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [address],
        }),
      });

      if (!response.ok) {
        throw new Error(`Helius API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.result && data.result.value !== undefined) {
        return (data.result.value / 1000000000).toFixed(9); // Convert lamports to SOL
      }

      return null;
    } catch (error) {
      console.error('Helius balance error:', error);
      return null;
    }
  }

  // Get balance from direct RPC
  private static async getRPCBalance(address: string): Promise<string | null> {
    try {
      const rpcUrl = API_CONFIG.SOLANA.RPC_URL || 'https://api.mainnet-beta.solana.com';
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [address],
        }),
      });

      if (!response.ok) {
        throw new Error(`Solana RPC error: ${response.status}`);
      }

      const data = await response.json();
      if (data.result && data.result.value !== undefined) {
        return (data.result.value / 1000000000).toFixed(9); // Convert lamports to SOL
      }

      return null;
    } catch (error) {
      console.error('Solana RPC balance error:', error);
      return null;
    }
  }

  // Get transactions from Helius
  private static async getHeliusTransactions(address: string, limit: number): Promise<SolanaTransaction[] | null> {
    try {
      const url = `${API_CONFIG.HELIUS.API_URL}/rpc?api-key=${API_CONFIG.HELIUS.API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getSignaturesForAddress',
          params: [address, { limit }],
        }),
      });

      if (!response.ok) {
        throw new Error(`Helius API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.result && Array.isArray(data.result)) {
        // Get transaction details for each signature
        const transactions: SolanaTransaction[] = [];
        for (const signature of data.result.slice(0, limit)) {
          const txDetail = await this.getTransactionDetails(signature.signature);
          if (txDetail) {
            transactions.push(txDetail);
          }
        }
        return transactions;
      }

      return null;
    } catch (error) {
      console.error('Helius transactions error:', error);
      return null;
    }
  }

  // Get transactions from direct RPC
  private static async getRPCTransactions(address: string, limit: number): Promise<SolanaTransaction[] | null> {
    try {
      const rpcUrl = API_CONFIG.HELIUS.API_URL || 'https://api.mainnet-beta.solana.com';
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getSignaturesForAddress',
          params: [address, { limit }],
        }),
      });

      if (!response.ok) {
        throw new Error(`Solana RPC error: ${response.status}`);
      }

      const data = await response.json();
      if (data.result && Array.isArray(data.result)) {
        // Get transaction details for each signature
        const transactions: SolanaTransaction[] = [];
        for (const signature of data.result.slice(0, limit)) {
          const txDetail = await this.getTransactionDetails(signature.signature);
          if (txDetail) {
            transactions.push(txDetail);
          }
        }
        return transactions;
      }

      return null;
    } catch (error) {
      console.error('Solana RPC transactions error:', error);
      return null;
    }
  }

  // Get transaction details
  private static async getTransactionDetails(signature: string): Promise<SolanaTransaction | null> {
    try {
      const rpcUrl = API_CONFIG.HELIUS.API_URL || 'https://api.mainnet-beta.solana.com';
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTransaction',
          params: [
            signature,
            {
              encoding: 'json',
              maxSupportedTransactionVersion: 0,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Solana RPC error: ${response.status}`);
      }

      const data = await response.json();
      if (data.result) {
        const tx = data.result;
        return {
          signature: tx.transaction.signatures[0],
          slot: tx.slot,
          blockTime: tx.blockTime,
          fee: tx.meta.fee,
          accounts: tx.transaction.message.accountKeys,
          preBalances: tx.meta.preBalances,
          postBalances: tx.meta.postBalances,
          instructions: tx.transaction.message.instructions,
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting transaction details:', error);
      return null;
    }
  }

  // Get token accounts from Helius
  private static async getHeliusTokenAccounts(address: string): Promise<SolanaTokenAccount[] | null> {
    try {
      const url = `${API_CONFIG.HELIUS.API_URL}/rpc?api-key=${API_CONFIG.HELIUS.API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTokenAccountsByOwner',
          params: [
            address,
            {
              programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
            },
            {
              encoding: 'jsonParsed',
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Helius API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.result && data.result.value) {
        return data.result.value.map((account: any) => ({
          account: account.pubkey,
          amount: account.account.data.parsed.info.tokenAmount.amount,
          decimals: account.account.data.parsed.info.tokenAmount.decimals,
          uiAmount: account.account.data.parsed.info.tokenAmount.uiAmount,
          mint: account.account.data.parsed.info.mint,
          owner: account.account.data.parsed.info.owner,
        }));
      }

      return null;
    } catch (error) {
      console.error('Helius token accounts error:', error);
      return null;
    }
  }

  // Get token accounts from direct RPC
  private static async getRPCTokenAccounts(address: string): Promise<SolanaTokenAccount[] | null> {
    try {
      const rpcUrl = API_CONFIG.HELIUS.API_URL || 'https://api.mainnet-beta.solana.com';
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTokenAccountsByOwner',
          params: [
            address,
            {
              programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
            },
            {
              encoding: 'jsonParsed',
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Solana RPC error: ${response.status}`);
      }

      const data = await response.json();
      if (data.result && data.result.value) {
        return data.result.value.map((account: any) => ({
          account: account.pubkey,
          amount: account.account.data.parsed.info.tokenAmount.amount,
          decimals: account.account.data.parsed.info.tokenAmount.decimals,
          uiAmount: account.account.data.parsed.info.tokenAmount.uiAmount,
          mint: account.account.data.parsed.info.mint,
          owner: account.account.data.parsed.info.owner,
        }));
      }

      return null;
    } catch (error) {
      console.error('Solana RPC token accounts error:', error);
      return null;
    }
  }

  // Get token metadata from Helius
  private static async getHeliusTokenMetadata(mint: string): Promise<SolanaTokenMetadata | null> {
    try {
      const url = `${API_CONFIG.HELIUS.API_URL}/token-metadata?api-key=${API_CONFIG.HELIUS.API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mints: [mint],
          includeOffChain: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Helius API error: ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const token = data[0];
        return {
          mint: token.mint,
          symbol: token.symbol || '',
          name: token.name || '',
          decimals: token.decimals || 9,
          logo: token.image || token.offChainData?.image,
          description: token.description || token.offChainData?.description,
        };
      }

      return null;
    } catch (error) {
      console.error('Helius token metadata error:', error);
      return null;
    }
  }

  // Get price from CoinGecko
  private static async getCoinGeckoPrice(): Promise<SolanaPrice | null> {
    try {
      const url = `${API_CONFIG.COINGECKO.API_URL}/simple/price?ids=solana&vs_currencies=usd`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          ...(API_CONFIG.COINGECKO.API_KEY && { 'x-cg-demo-api-key': API_CONFIG.COINGECKO.API_KEY }),
        },
      });

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.solana && data.solana.usd) {
        return {
          symbol: 'SOL',
          price: data.solana.usd,
          timestamp: Date.now(),
        };
      }

      return null;
    } catch (error) {
      console.error('CoinGecko price error:', error);
      return null;
    }
  }

  // Cache management
  private static getCachedData(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private static setCachedData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }
}
