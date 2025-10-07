// Moralis Token Service - Centralized token information using Moralis API
import { API_CONFIG } from '@/config/api.config';

export interface MoralisTokenInfo {
  symbol: string;
  name: string;
  address: string;
  chain: string;
  decimals: number;
  logo: string;
  price: number;
  priceFormatted: string;
  balance: string;
  balanceFormatted: string;
  usdValue: string;
  change24h?: number;
  verified: boolean;
}

export interface MoralisTokenBalance {
  token_address: string;
  name: string;
  symbol: string;
  logo?: string;
  thumbnail?: string;
  decimals: number;
  balance: string;
  balance_formatted: string;
  possible_spam: boolean;
  verified: boolean;
  usd_price: number;
  usd_price_24hr_change?: number;
  usd_value: number;
}

export class MoralisTokenService {
  private static cache = new Map<string, { data: any; timestamp: number }>();
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Get token balances for a specific chain
  static async getTokenBalances(address: string, chain: string): Promise<MoralisTokenBalance[]> {
    if (!API_CONFIG.MORALIS.API_KEY) {
      console.warn('Moralis API key not configured');
      return [];
    }

    try {
      const cacheKey = `balances_${address}_${chain}`;
      const cached = this.getCached(cacheKey);
      if (cached) {
        return cached;
      }

      const response = await fetch(
        `${API_CONFIG.MORALIS.API_URL}/${address}/erc20?chain=${chain}&exclude_spam=true&include=percent_change`,
        {
          headers: {
            'X-API-Key': API_CONFIG.MORALIS.API_KEY,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Moralis API error: ${response.status}`);
      }

      const data = await response.json();
      const result = data.result || [];
      
      this.setCached(cacheKey, result);
      return result;
    } catch (error) {
      console.error(`Failed to get token balances for ${chain}:`, error);
      return [];
    }
  }

  // Get native token balance (ETH, BNB, MATIC, etc.)
  static async getNativeBalance(address: string, chain: string): Promise<MoralisTokenBalance | null> {
    if (!API_CONFIG.MORALIS.API_KEY) {
      console.warn('Moralis API key not configured');
      return null;
    }

    try {
      const cacheKey = `native_${address}_${chain}`;
      const cached = this.getCached(cacheKey);
      if (cached) {
        return cached;
      }

      const response = await fetch(
        `${API_CONFIG.MORALIS.API_URL}/${address}/balance?chain=${chain}`,
        {
          headers: {
            'X-API-Key': API_CONFIG.MORALIS.API_KEY,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Moralis API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Get the native token price separately
      const nativeSymbol = this.getNativeTokenSymbol(chain);
      const tokenPrice = await this.getNativeTokenPrice(chain);
      const balance = parseFloat(data.balance || '0') / Math.pow(10, 18);
      const usdValue = balance * tokenPrice;
      
      const result = {
        token_address: 'native',
        name: this.getNativeTokenName(chain),
        symbol: nativeSymbol,
        logo: this.getNativeTokenLogo(chain),
        decimals: 18,
        balance: data.balance || '0',
        balance_formatted: balance.toFixed(6),
        possible_spam: false,
        verified: true,
        usd_price: tokenPrice,
        usd_price_24hr_change: 0, // We'll fetch this separately if needed
        usd_value: usdValue,
      };

      console.log(`Moralis: Fetched ${nativeSymbol} balance=${balance.toFixed(6)}, price=$${tokenPrice}, value=$${usdValue.toFixed(2)}`);
      this.setCached(cacheKey, result);
      return result;
    } catch (error) {
      console.error(`Failed to get native balance for ${chain}:`, error);
      return null;
    }
  }

  // Get token metadata (logo, name, symbol) by contract address
  static async getTokenMetadata(address: string, chain: string): Promise<MoralisTokenInfo | null> {
    if (!API_CONFIG.MORALIS.API_KEY) {
      console.warn('Moralis API key not configured');
      return null;
    }

    try {
      const cacheKey = `metadata_${address}_${chain}`;
      const cached = this.getCached(cacheKey);
      if (cached) {
        return cached;
      }

      const response = await fetch(
        `${API_CONFIG.MORALIS.API_URL}/erc20/metadata?chain=${chain}&addresses[]=${address}`,
        {
          headers: {
            'X-API-Key': API_CONFIG.MORALIS.API_KEY,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Moralis API error: ${response.status}`);
      }

      const data = await response.json();
      const token = data[0];
      
      if (!token) return null;

      const result: MoralisTokenInfo = {
        symbol: token.symbol,
        name: token.name,
        address: token.address,
        chain: chain,
        decimals: parseInt(token.decimals),
        logo: token.logo || this.getDefaultLogo(token.symbol),
        price: 0, // Will be fetched separately
        priceFormatted: '0',
        balance: '0',
        balanceFormatted: '0',
        usdValue: '0',
        verified: !token.possible_spam,
      };

      this.setCached(cacheKey, result);
      return result;
    } catch (error) {
      console.error(`Failed to get token metadata for ${address}:`, error);
      return null;
    }
  }

  // Get token price by contract address
  static async getTokenPrice(address: string, chain: string): Promise<number> {
    if (!API_CONFIG.MORALIS.API_KEY) {
      console.warn('Moralis API key not configured');
      return 0;
    }

    try {
      const cacheKey = `price_${address}_${chain}`;
      const cached = this.getCached(cacheKey);
      if (cached) {
        return cached;
      }

      const response = await fetch(
        `${API_CONFIG.MORALIS.API_URL}/erc20/${address}/price?chain=${chain}`,
        {
          headers: {
            'X-API-Key': API_CONFIG.MORALIS.API_KEY,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Moralis API error: ${response.status}`);
      }

      const data = await response.json();
      const price = parseFloat(data.usdPrice || 0);
      
      this.setCached(cacheKey, price);
      return price;
    } catch (error) {
      console.error(`Failed to get token price for ${address}:`, error);
      return 0;
    }
  }

  // Get all tokens for multiple chains
  static async getAllTokensMultiChain(addresses: { [chain: string]: string }): Promise<MoralisTokenInfo[]> {
    const allTokens: MoralisTokenInfo[] = [];
    
    const chainMap: { [key: string]: string } = {
      'ethereum': 'eth',
      'polygon': 'polygon',
      'bsc': 'bsc',
      'arbitrum': 'arbitrum',
      'tron': 'tron',
      'solana': 'solana',
      'bitcoin': 'bitcoin',
    };

    for (const [chainKey, address] of Object.entries(addresses)) {
      if (!address) continue;
      
      const moralisChain = chainMap[chainKey];
      if (!moralisChain || moralisChain === 'tron' || moralisChain === 'solana' || moralisChain === 'bitcoin') {
        // Skip non-EVM chains for now, they need different handling
        continue;
      }

      try {
        console.log(`Fetching Moralis tokens for ${chainKey} (${moralisChain})`);
        
        // Get native token balance
        const nativeBalance = await this.getNativeBalance(address, moralisChain);
        if (nativeBalance) {
          allTokens.push(this.convertToTokenInfo(nativeBalance, moralisChain));
        }

        // Get ERC-20 token balances
        const tokenBalances = await this.getTokenBalances(address, moralisChain);
        const tokenInfos = tokenBalances.map(balance => this.convertToTokenInfo(balance, moralisChain));
        allTokens.push(...tokenInfos);

        console.log(`Loaded ${tokenInfos.length + (nativeBalance ? 1 : 0)} tokens for ${chainKey}`);
      } catch (error) {
        console.error(`Failed to load tokens for ${chainKey}:`, error);
      }
    }

    return allTokens;
  }

  // Convert MoralisTokenBalance to MoralisTokenInfo
  private static convertToTokenInfo(balance: MoralisTokenBalance, chain: string): MoralisTokenInfo {
    return {
      symbol: balance.symbol,
      name: balance.name,
      address: balance.token_address,
      chain: this.getChainName(chain),
      decimals: balance.decimals,
      logo: balance.logo || balance.thumbnail || this.getDefaultLogo(balance.symbol),
      price: balance.usd_price || 0,
      priceFormatted: balance.usd_price ? `$${balance.usd_price.toFixed(4)}` : '$0',
      balance: balance.balance || '0',
      balanceFormatted: balance.balance_formatted || '0',
      usdValue: balance.usd_value ? balance.usd_value.toFixed(2) : '0',
      change24h: balance.usd_price_24hr_change || 0,
      verified: !balance.possible_spam && balance.verified,
    };
  }

  // Helper methods
  private static getNativeTokenName(chain: string): string {
    const names: { [key: string]: string } = {
      'eth': 'Ethereum',
      'polygon': 'Polygon',
      'bsc': 'BNB Smart Chain',
      'arbitrum': 'Arbitrum One',
    };
    return names[chain] || chain;
  }

  private static getNativeTokenSymbol(chain: string): string {
    const symbols: { [key: string]: string } = {
      'eth': 'ETH',
      'polygon': 'MATIC',
      'bsc': 'BNB',
      'arbitrum': 'ETH',
    };
    return symbols[chain] || chain.toUpperCase();
  }

  private static getNativeTokenLogo(chain: string): string {
    const logos: { [key: string]: string } = {
      'eth': 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
      'polygon': 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png',
      'bsc': 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
      'arbitrum': 'https://assets.coingecko.com/coins/images/16547/large/photo_2023-03-29_21.47.00.jpeg',
    };
    return logos[chain] || `https://via.placeholder.com/64/6B7280/FFFFFF?text=${chain.toUpperCase()}`;
  }

  private static getChainName(chain: string): string {
    const chainNames: { [key: string]: string } = {
      'eth': 'Ethereum',
      'polygon': 'Polygon',
      'bsc': 'BSC',
      'arbitrum': 'Arbitrum',
    };
    return chainNames[chain] || chain;
  }

  private static getDefaultLogo(symbol: string): string {
    return `https://via.placeholder.com/64/6B7280/FFFFFF?text=${symbol.charAt(0)}`;
  }

  // Get native token price from CoinGecko
  private static async getNativeTokenPrice(chain: string): Promise<number> {
    const coinIds: { [key: string]: string } = {
      'eth': 'ethereum',
      'polygon': 'matic-network',
      'bsc': 'binancecoin',
      'arbitrum': 'ethereum', // Arbitrum uses ETH
    };
    
    const coinId = coinIds[chain] || chain;
    
    try {
      const response = await fetch(`/api/prices?ids=${coinId}`);
      const data = await response.json();
      const price = data[coinId]?.usd || 0;
      console.log(`Moralis: Fetched price for ${coinId}: $${price}`);
      return price;
    } catch (error) {
      console.error(`Failed to get price for ${coinId}:`, error);
      return 0;
    }
  }

  // Cache management
  private static getCached(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private static setCached(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}
