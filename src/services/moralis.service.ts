/**
 * Moralis API Service
 * Handles token data, logos, and live prices from Moralis API
 */

import { API_CONFIG } from '@/config/api.config';

export interface MoralisTokenData {
  token_address: string;
  name: string;
  symbol: string;
  decimals: number;
  logo?: string;
  thumbnail?: string;
  price?: number;
  price_change_percentage_24h?: number;
  market_cap?: number;
  total_supply?: string;
  balance?: string;
  balance_formatted?: string;
  possible_spam?: boolean;
  verified_contract?: boolean;
  chain: string;
}

export interface MoralisTokenBalance {
  token_address: string;
  name: string;
  symbol: string;
  decimals: number;
  logo?: string;
  thumbnail?: string;
  balance: string;
  balance_formatted: string;
  price?: number;
  value_usd?: number;
  chain: string;
}

export interface MoralisNativeBalance {
  balance: string;
  balance_formatted: string;
  chain: string;
  symbol: string;
  name: string;
  price?: number;
  value_usd?: number;
}

export class MoralisService {
  private static instance: MoralisService;
  private baseUrl: string;
  private apiKey: string;

  private constructor() {
    this.baseUrl = API_CONFIG.MORALIS.API_URL;
    this.apiKey = API_CONFIG.MORALIS.API_KEY;
  }

  static getInstance(): MoralisService {
    if (!MoralisService.instance) {
      MoralisService.instance = new MoralisService();
    }
    return MoralisService.instance;
  }

  private async makeRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    if (!API_CONFIG.MORALIS.ENABLED) {
      throw new Error('Moralis API is not configured');
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key].toString());
      }
    });

    const response = await fetch(url.toString(), {
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Moralis API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get token balances for an address
   */
  async getTokenBalances(address: string, chain: string): Promise<MoralisTokenBalance[]> {
    try {
      const data = await this.makeRequest(`/${address}/erc20`, {
        chain: chain.toLowerCase(),
      });

      return data.map((token: any) => ({
        token_address: token.token_address,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        logo: token.logo,
        thumbnail: token.thumbnail,
        balance: token.balance,
        balance_formatted: token.balance_formatted,
        price: token.price,
        value_usd: token.value_usd,
        chain: chain.toLowerCase(),
      }));
    } catch (error) {
      console.error('Error fetching token balances:', error);
      return [];
    }
  }

  /**
   * Get native token balance (ETH, BNB, etc.)
   */
  async getNativeBalance(address: string, chain: string): Promise<MoralisNativeBalance | null> {
    try {
      const data = await this.makeRequest(`/${address}/balance`, {
        chain: chain.toLowerCase(),
      });

      return {
        balance: data.balance,
        balance_formatted: data.balance_formatted,
        chain: chain.toLowerCase(),
        symbol: this.getChainSymbol(chain),
        name: this.getChainName(chain),
        price: data.price,
        value_usd: data.value_usd,
      };
    } catch (error) {
      console.error('Error fetching native balance:', error);
      return null;
    }
  }

  /**
   * Get token metadata
   */
  async getTokenMetadata(tokenAddress: string, chain: string): Promise<MoralisTokenData | null> {
    try {
      const data = await this.makeRequest(`/erc20/metadata`, {
        chain: chain.toLowerCase(),
        addresses: [tokenAddress],
      });

      if (data && data.length > 0) {
        return {
          token_address: data[0].token_address,
          name: data[0].name,
          symbol: data[0].symbol,
          decimals: data[0].decimals,
          logo: data[0].logo,
          thumbnail: data[0].thumbnail,
          chain: chain.toLowerCase(),
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching token metadata:', error);
      return null;
    }
  }

  /**
   * Get token price
   */
  async getTokenPrice(tokenAddress: string, chain: string): Promise<number | null> {
    try {
      const data = await this.makeRequest(`/erc20/${tokenAddress}/price`, {
        chain: chain.toLowerCase(),
      });

      return data.usdPrice || null;
    } catch (error) {
      console.error('Error fetching token price:', error);
      return null;
    }
  }

  /**
   * Search for tokens
   */
  async searchTokens(query: string, chain?: string): Promise<MoralisTokenData[]> {
    try {
      const params: any = {
        q: query,
        limit: 20,
      };

      if (chain) {
        params.chain = chain.toLowerCase();
      }

      const data = await this.makeRequest('/erc20/search', params);

      return data.map((token: any) => ({
        token_address: token.token_address,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        logo: token.logo,
        thumbnail: token.thumbnail,
        chain: chain?.toLowerCase() || 'ethereum',
      }));
    } catch (error) {
      console.error('Error searching tokens:', error);
      return [];
    }
  }

  /**
   * Get trending tokens
   */
  async getTrendingTokens(chain?: string): Promise<MoralisTokenData[]> {
    try {
      const params: any = {
        limit: 50,
        order: 'market_cap',
      };

      if (chain) {
        params.chain = chain.toLowerCase();
      }

      const data = await this.makeRequest('/erc20/top', params);

      return data.map((token: any) => ({
        token_address: token.token_address,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        logo: token.logo,
        thumbnail: token.thumbnail,
        price: token.price,
        price_change_percentage_24h: token.price_change_percentage_24h,
        market_cap: token.market_cap,
        chain: chain?.toLowerCase() || 'ethereum',
      }));
    } catch (error) {
      console.error('Error fetching trending tokens:', error);
      return [];
    }
  }

  private getChainSymbol(chain: string): string {
    const chainMap: Record<string, string> = {
      'eth': 'ETH',
      'ethereum': 'ETH',
      'polygon': 'MATIC',
      'bsc': 'BNB',
      'arbitrum': 'ETH',
      'solana': 'SOL',
      'bitcoin': 'BTC',
      'tron': 'TRX',
    };
    return chainMap[chain.toLowerCase()] || chain.toUpperCase();
  }

  private getChainName(chain: string): string {
    const chainMap: Record<string, string> = {
      'eth': 'Ethereum',
      'ethereum': 'Ethereum',
      'polygon': 'Polygon',
      'bsc': 'BNB Smart Chain',
      'arbitrum': 'Arbitrum One',
      'solana': 'Solana',
      'bitcoin': 'Bitcoin',
      'tron': 'TRON',
    };
    return chainMap[chain.toLowerCase()] || chain;
  }
}

export const moralisService = MoralisService.getInstance();
