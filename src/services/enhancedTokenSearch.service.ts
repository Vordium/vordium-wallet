// Enhanced Token Search Service with Live API Integration
import { API_CONFIG } from '@/config/api.config';

export interface EnhancedTokenSearchResult {
  symbol: string;
  name: string;
  address: string;
  chain: 'Ethereum' | 'Tron' | 'Solana' | 'Bitcoin' | 'BSC' | 'Polygon' | 'Arbitrum';
  decimals: number;
  logo: string;
  balance?: string;
  verified?: boolean;
  price?: number;
  marketCap?: number;
  change24h?: number;
}

export class EnhancedTokenSearchService {
  private static searchCache = new Map<string, { results: EnhancedTokenSearchResult[]; timestamp: number }>();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Search tokens with live API data
  static async searchTokens(query: string, chain?: 'Ethereum' | 'Tron' | 'Solana' | 'Bitcoin' | 'BSC' | 'Polygon' | 'Arbitrum'): Promise<EnhancedTokenSearchResult[]> {
    if (!query || query.length < 2) return [];

    const cacheKey = `${query}-${chain || 'all'}`;
    const cached = this.searchCache.get(cacheKey);
    const now = Date.now();

    // Return cached results if still valid
    if (cached && now - cached.timestamp < this.CACHE_DURATION) {
      return cached.results;
    }

    try {
      const results: EnhancedTokenSearchResult[] = [];

      // Search CoinGecko for live token data
      if (API_CONFIG.COINGECKO.ENABLED) {
        const coingeckoResults = await this.searchCoinGecko(query, chain);
        results.push(...coingeckoResults);
      }

      // Search Moralis for EVM tokens
      if (API_CONFIG.MORALIS.ENABLED && (!chain || chain === 'Ethereum')) {
        const moralisResults = await this.searchMoralis(query);
        results.push(...moralisResults);
      }

      // Search Helius for Solana tokens
      if (API_CONFIG.HELIUS.ENABLED && (!chain || chain === 'Solana')) {
        const heliusResults = await this.searchHelius(query);
        results.push(...heliusResults);
      }

      // Remove duplicates and sort by relevance
      const uniqueResults = this.removeDuplicates(results);
      const sortedResults = this.sortByRelevance(uniqueResults, query);

      // Cache the results
      this.searchCache.set(cacheKey, { results: sortedResults, timestamp: now });

      return sortedResults.slice(0, 20); // Limit to 20 results
    } catch (error) {
      console.error('Error searching tokens:', error);
      return [];
    }
  }

  // Search CoinGecko for live token data
  private static async searchCoinGecko(query: string, chain?: string): Promise<EnhancedTokenSearchResult[]> {
    try {
      const response = await fetch(
        `${API_CONFIG.COINGECKO.API_URL}/search?query=${encodeURIComponent(query)}`,
        {
          headers: {
            'Accept': 'application/json',
            ...(API_CONFIG.COINGECKO.API_KEY && { 'x-cg-demo-api-key': API_CONFIG.COINGECKO.API_KEY }),
          },
        }
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      const results: EnhancedTokenSearchResult[] = [];

      // Process coins - get more results and fetch prices
      if (data.coins) {
        const coinIds = data.coins.slice(0, 20).map((coin: any) => coin.id).join(',');
        
        // Fetch prices for all coins
        let prices: any = {};
        try {
          const priceResponse = await fetch(
            `${API_CONFIG.COINGECKO.API_URL}/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`,
            {
              headers: {
                'Accept': 'application/json',
                ...(API_CONFIG.COINGECKO.API_KEY && { 'x-cg-demo-api-key': API_CONFIG.COINGECKO.API_KEY }),
              },
            }
          );
          if (priceResponse.ok) {
            prices = await priceResponse.json();
          }
        } catch (error) {
          console.warn('Failed to fetch prices:', error);
        }

        for (const coin of data.coins.slice(0, 20)) { // Increased to 20 results
          const chainType = this.mapCoinGeckoToChain(coin.id);
          if (!chain || chainType === chain) {
            // Get high-quality logo (prefer large, then small, then thumb)
            const logo = coin.large || coin.small || coin.thumb || coin.image || '';
            
            // Get price data
            const priceData = prices[coin.id];
            const price = priceData?.usd || 0;
            const change24h = priceData?.usd_24h_change || 0;
            
            results.push({
              symbol: coin.symbol?.toUpperCase() || '',
              name: coin.name || '',
              address: coin.id || '',
              chain: chainType,
              decimals: 18, // Default for most tokens
              logo: logo,
              verified: true,
              price: price,
              change24h: change24h,
            });
          }
        }
      }

      return results;
    } catch (error) {
      console.error('Error searching CoinGecko:', error);
      return [];
    }
  }

  // Search Moralis for EVM tokens
  private static async searchMoralis(query: string): Promise<EnhancedTokenSearchResult[]> {
    try {
      // Search for tokens by symbol or name
      const response = await fetch(
        `${API_CONFIG.MORALIS.API_URL}/erc20/metadata?chain=eth&symbols=${encodeURIComponent(query)}`,
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
      const results: EnhancedTokenSearchResult[] = [];

      if (Array.isArray(data)) {
        for (const token of data.slice(0, 5)) { // Limit to 5 results
          results.push({
            symbol: token.symbol || '',
            name: token.name || '',
            address: token.token_address || '',
            chain: 'Ethereum',
            decimals: token.decimals || 18,
            logo: token.logo || token.thumbnail || '',
            verified: token.verified_contract || false,
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error searching Moralis:', error);
      return [];
    }
  }

  // Search Helius for Solana tokens
  private static async searchHelius(query: string): Promise<EnhancedTokenSearchResult[]> {
    try {
      // Search for tokens by symbol or name
      const response = await fetch(
        `${API_CONFIG.HELIUS.API_URL}/token-metadata?api-key=${API_CONFIG.HELIUS.API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: query,
            limit: 5,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Helius API error: ${response.status}`);
      }

      const data = await response.json();
      const results: EnhancedTokenSearchResult[] = [];

      if (Array.isArray(data)) {
        for (const token of data) {
          results.push({
            symbol: token.symbol || '',
            name: token.name || '',
            address: token.mint || '',
            chain: 'Solana',
            decimals: 9, // Default for Solana tokens
            logo: token.image || token.offChainData?.image || '',
            verified: true,
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error searching Helius:', error);
      return [];
    }
  }

  // Map CoinGecko coin ID to chain type
  private static mapCoinGeckoToChain(coinId: string): 'Ethereum' | 'Tron' | 'Solana' | 'Bitcoin' | 'BSC' | 'Polygon' | 'Arbitrum' {
    const chainMap: Record<string, 'Ethereum' | 'Tron' | 'Solana' | 'Bitcoin' | 'BSC' | 'Polygon' | 'Arbitrum'> = {
      'bitcoin': 'Bitcoin',
      'ethereum': 'Ethereum',
      'tron': 'Tron',
      'solana': 'Solana',
      'binancecoin': 'BSC',
      'wbnb': 'BSC',
      'pancakeswap-token': 'BSC',
      'usd-coin': 'Ethereum',
      'tether': 'Ethereum',
      'matic-network': 'Polygon',
      'wmatic': 'Polygon',
      'arbitrum': 'Arbitrum',
      'chainlink': 'Ethereum',
      'uniswap': 'Ethereum',
      'aave': 'Ethereum',
      'maker': 'Ethereum',
      'curve-dao-token': 'Ethereum',
      'synthetix-network-token': 'Ethereum',
      'yearn-finance': 'Ethereum',
      'compound-governance-token': 'Ethereum',
    };

    return chainMap[coinId] || 'Ethereum';
  }

  // Remove duplicate tokens
  private static removeDuplicates(tokens: EnhancedTokenSearchResult[]): EnhancedTokenSearchResult[] {
    const seen = new Set<string>();
    return tokens.filter(token => {
      const key = `${token.symbol}-${token.chain}-${token.address}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // Sort results by relevance
  private static sortByRelevance(tokens: EnhancedTokenSearchResult[], query: string): EnhancedTokenSearchResult[] {
    const lowerQuery = query.toLowerCase();

    return tokens.sort((a, b) => {
      // Exact symbol match first
      const aSymbolExact = a.symbol.toLowerCase() === lowerQuery;
      const bSymbolExact = b.symbol.toLowerCase() === lowerQuery;
      if (aSymbolExact && !bSymbolExact) return -1;
      if (!aSymbolExact && bSymbolExact) return 1;

      // Symbol starts with query
      const aSymbolStart = a.symbol.toLowerCase().startsWith(lowerQuery);
      const bSymbolStart = b.symbol.toLowerCase().startsWith(lowerQuery);
      if (aSymbolStart && !bSymbolStart) return -1;
      if (!aSymbolStart && bSymbolStart) return 1;

      // Name starts with query
      const aNameStart = a.name.toLowerCase().startsWith(lowerQuery);
      const bNameStart = b.name.toLowerCase().startsWith(lowerQuery);
      if (aNameStart && !bNameStart) return -1;
      if (!aNameStart && bNameStart) return 1;

      // Verified tokens first
      if (a.verified && !b.verified) return -1;
      if (!a.verified && b.verified) return 1;

      // Alphabetical by symbol
      return a.symbol.localeCompare(b.symbol);
    });
  }

  // Get token by address
  static async getTokenByAddress(address: string, chain: 'Ethereum' | 'Tron' | 'Solana' | 'Bitcoin'): Promise<EnhancedTokenSearchResult | null> {
    try {
      // Try to get token metadata from appropriate API
      switch (chain) {
        case 'Ethereum':
          if (API_CONFIG.MORALIS.ENABLED) {
            return await this.getMoralisToken(address);
          }
          break;
        case 'Solana':
          if (API_CONFIG.HELIUS.ENABLED) {
            return await this.getHeliusToken(address);
          }
          break;
        case 'Bitcoin':
          if (address === 'native') {
            return {
              symbol: 'BTC',
              name: 'Bitcoin',
              address: 'native',
              chain: 'Bitcoin',
              decimals: 8,
              logo: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
              verified: true,
            };
          }
          break;
        case 'Tron':
          if (address === 'native') {
            return {
              symbol: 'TRX',
              name: 'TRON',
              address: 'native',
              chain: 'Tron',
              decimals: 6,
              logo: 'https://assets.coingecko.com/coins/images/1094/large/tron-logo.png',
              verified: true,
            };
          }
          break;
      }

      return null;
    } catch (error) {
      console.error('Error getting token by address:', error);
      return null;
    }
  }

  // Get token from Moralis
  private static async getMoralisToken(address: string): Promise<EnhancedTokenSearchResult | null> {
    try {
      const response = await fetch(
        `${API_CONFIG.MORALIS.API_URL}/erc20/${address}/metadata?chain=eth`,
        {
          headers: {
            'X-API-Key': API_CONFIG.MORALIS.API_KEY,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const token = data[0];
        return {
          symbol: token.symbol || '',
          name: token.name || '',
          address: token.token_address || address,
          chain: 'Ethereum',
          decimals: token.decimals || 18,
          logo: token.logo || token.thumbnail || '',
          verified: token.verified_contract || false,
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting Moralis token:', error);
      return null;
    }
  }

  // Get token from Helius
  private static async getHeliusToken(address: string): Promise<EnhancedTokenSearchResult | null> {
    try {
      const response = await fetch(
        `${API_CONFIG.HELIUS.API_URL}/token-metadata?api-key=${API_CONFIG.HELIUS.API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mints: [address],
            includeOffChain: true,
          }),
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const token = data[0];
        return {
          symbol: token.symbol || '',
          name: token.name || '',
          address: token.mint || address,
          chain: 'Solana',
          decimals: 9,
          logo: token.image || token.offChainData?.image || '',
          verified: true,
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting Helius token:', error);
      return null;
    }
  }
}
