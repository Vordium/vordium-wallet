/**
 * Helius API Service
 * Handles Solana blockchain data and token information
 */

import { API_CONFIG } from '@/config/api.config';

export interface HeliusTokenAccount {
  account: string;
  amount: number;
  decimals: number;
  uiAmount: number;
  uiAmountString: string;
  mint: string;
  owner: string;
  state: string;
  tokenAmount: {
    amount: string;
    decimals: number;
    uiAmount: number;
    uiAmountString: string;
  };
}

export interface HeliusTokenMetadata {
  mint: string;
  name: string;
  symbol: string;
  decimals: number;
  logo?: string;
  description?: string;
  image?: string;
  attributes?: any[];
  properties?: any;
  collection?: any;
  external_url?: string;
  animation_url?: string;
}

export interface HeliusTokenBalance {
  mint: string;
  name: string;
  symbol: string;
  decimals: number;
  logo?: string;
  balance: number;
  balance_formatted: string;
  price?: number;
  value_usd?: number;
  owner: string;
}

export interface HeliusNativeBalance {
  balance: number;
  balance_formatted: string;
  price?: number;
  value_usd?: number;
}

export class HeliusService {
  private static instance: HeliusService;
  private baseUrl: string;
  private apiKey: string;

  private constructor() {
    this.baseUrl = API_CONFIG.HELIUS.API_URL;
    this.apiKey = API_CONFIG.HELIUS.API_KEY;
  }

  static getInstance(): HeliusService {
    if (!HeliusService.instance) {
      HeliusService.instance = new HeliusService();
    }
    return HeliusService.instance;
  }

  private async makeRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    if (!API_CONFIG.HELIUS.ENABLED) {
      throw new Error('Helius API is not configured');
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key].toString());
      }
    });

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Helius API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get token accounts for an address
   */
  async getTokenAccounts(address: string): Promise<HeliusTokenAccount[]> {
    try {
      const data = await this.makeRequest(`/accounts/${address}/tokens`, {
        limit: 1000,
      });

      return data || [];
    } catch (error) {
      console.error('Error fetching token accounts:', error);
      return [];
    }
  }

  /**
   * Get token metadata
   */
  async getTokenMetadata(mintAddress: string): Promise<HeliusTokenMetadata | null> {
    try {
      const data = await this.makeRequest(`/token-metadata`, {
        mint: mintAddress,
      });

      if (data && data.length > 0) {
        const token = data[0];
        return {
          mint: token.mint,
          name: token.name,
          symbol: token.symbol,
          decimals: token.decimals,
          logo: token.logo,
          description: token.description,
          image: token.image,
          attributes: token.attributes,
          properties: token.properties,
          collection: token.collection,
          external_url: token.external_url,
          animation_url: token.animation_url,
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching token metadata:', error);
      return null;
    }
  }

  /**
   * Get token balances for an address
   */
  async getTokenBalances(address: string): Promise<HeliusTokenBalance[]> {
    try {
      const tokenAccounts = await this.getTokenAccounts(address);
      const balances: HeliusTokenBalance[] = [];

      for (const account of tokenAccounts) {
        if (account.tokenAmount.uiAmount > 0) {
          const metadata = await this.getTokenMetadata(account.mint);
          
          if (metadata) {
            balances.push({
              mint: account.mint,
              name: metadata.name,
              symbol: metadata.symbol,
              decimals: metadata.decimals,
              logo: metadata.logo,
              balance: account.tokenAmount.uiAmount,
              balance_formatted: account.tokenAmount.uiAmountString,
              owner: account.owner,
            });
          }
        }
      }

      return balances;
    } catch (error) {
      console.error('Error fetching token balances:', error);
      return [];
    }
  }

  /**
   * Get native SOL balance
   */
  async getNativeBalance(address: string): Promise<HeliusNativeBalance | null> {
    try {
      const data = await this.makeRequest(`/accounts/${address}/balance`);

      return {
        balance: data.balance || 0,
        balance_formatted: (data.balance / 1e9).toFixed(9),
      };
    } catch (error) {
      console.error('Error fetching native balance:', error);
      return null;
    }
  }

  /**
   * Get token price
   */
  async getTokenPrice(mintAddress: string): Promise<number | null> {
    try {
      const data = await this.makeRequest(`/token-price`, {
        mint: mintAddress,
      });

      return data.price || null;
    } catch (error) {
      console.error('Error fetching token price:', error);
      return null;
    }
  }

  /**
   * Search for tokens
   */
  async searchTokens(query: string): Promise<HeliusTokenMetadata[]> {
    try {
      const data = await this.makeRequest(`/token-metadata/search`, {
        query,
        limit: 20,
      });

      return data.map((token: any) => ({
        mint: token.mint,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        logo: token.logo,
        description: token.description,
        image: token.image,
        attributes: token.attributes,
        properties: token.properties,
        collection: token.collection,
        external_url: token.external_url,
        animation_url: token.animation_url,
      }));
    } catch (error) {
      console.error('Error searching tokens:', error);
      return [];
    }
  }

  /**
   * Get trending tokens
   */
  async getTrendingTokens(): Promise<HeliusTokenMetadata[]> {
    try {
      const data = await this.makeRequest(`/token-metadata/trending`, {
        limit: 50,
      });

      return data.map((token: any) => ({
        mint: token.mint,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        logo: token.logo,
        description: token.description,
        image: token.image,
        attributes: token.attributes,
        properties: token.properties,
        collection: token.collection,
        external_url: token.external_url,
        animation_url: token.animation_url,
      }));
    } catch (error) {
      console.error('Error fetching trending tokens:', error);
      return [];
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(address: string, limit: number = 50): Promise<any[]> {
    try {
      const data = await this.makeRequest(`/accounts/${address}/transactions`, {
        limit,
      });

      return data || [];
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }
}

export const heliusService = HeliusService.getInstance();
