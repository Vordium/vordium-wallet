// Multi-Chain Token Service - Comprehensive token management across all chains
import { API_CONFIG, CHAIN_CONFIG } from '@/config/api.config';
import { MoralisTokenService, type MoralisTokenInfo } from './moralisToken.service';
import { SolanaService } from './solana.service';
import { BitcoinService } from './bitcoin.service';
import { TronService } from './tron.service';
import { EVMService } from './evm.service';

export interface MultiChainTokenInfo {
  symbol: string;
  name: string;
  address: string;
  chain: 'Ethereum' | 'Tron' | 'Solana' | 'Bitcoin' | 'BSC' | 'Polygon' | 'Arbitrum';
  decimals: number;
  logo: string;
  price: number;
  priceFormatted: string;
  balance: string;
  balanceFormatted: string;
  usdValue: string;
  change24h?: number;
  verified: boolean;
  isNative: boolean;
}

export interface TokenSearchFilter {
  chains?: ('Ethereum' | 'Tron' | 'Solana' | 'Bitcoin' | 'BSC' | 'Polygon' | 'Arbitrum')[];
  verifiedOnly?: boolean;
  includePrices?: boolean;
}

export class MultiChainTokenService {
  private static cache = new Map<string, { data: any; timestamp: number }>();
  private static CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  // Get all tokens for a wallet across all chains
  static async getAllTokensMultiChain(addresses: { [chain: string]: string }): Promise<MultiChainTokenInfo[]> {
    const allTokens: MultiChainTokenInfo[] = [];
    
    console.log('MultiChainTokenService: Loading tokens for all chains...');

    // Load EVM chains using Moralis
    const evmChains = ['ethereum', 'polygon', 'bsc', 'arbitrum'];
    const evmAddresses: { [key: string]: string } = {};
    
    for (const chain of evmChains) {
      if (addresses[chain] || addresses.ethereum) {
        evmAddresses[chain] = addresses[chain] || addresses.ethereum;
      }
    }

    if (Object.keys(evmAddresses).length > 0) {
      try {
        console.log('Loading EVM tokens with Moralis...');
        const moralisTokens = await MoralisTokenService.getAllTokensMultiChain(evmAddresses);
        const multiChainTokens = moralisTokens.map(this.convertMoralisToMultiChain);
        allTokens.push(...multiChainTokens);
        console.log(`Loaded ${multiChainTokens.length} EVM tokens`);
      } catch (error) {
        console.error('Failed to load EVM tokens:', error);
      }
    }

    // Load Solana tokens
    if (addresses.solana) {
      try {
        console.log('Loading Solana tokens...');
        const solanaTokens = await this.loadSolanaTokens(addresses.solana);
        allTokens.push(...solanaTokens);
        console.log(`Loaded ${solanaTokens.length} Solana tokens`);
      } catch (error) {
        console.error('Failed to load Solana tokens:', error);
      }
    }

    // Load TRON tokens
    if (addresses.tron) {
      try {
        console.log('Loading TRON tokens...');
        const tronTokens = await this.loadTronTokens(addresses.tron);
        allTokens.push(...tronTokens);
        console.log(`Loaded ${tronTokens.length} TRON tokens`);
      } catch (error) {
        console.error('Failed to load TRON tokens:', error);
      }
    }

    // Load Bitcoin
    if (addresses.bitcoin) {
      try {
        console.log('Loading Bitcoin...');
        const bitcoinTokens = await this.loadBitcoinTokens(addresses.bitcoin);
        allTokens.push(...bitcoinTokens);
        console.log(`Loaded ${bitcoinTokens.length} Bitcoin tokens`);
      } catch (error) {
        console.error('Failed to load Bitcoin tokens:', error);
      }
    }

    console.log(`MultiChainTokenService: Total tokens loaded: ${allTokens.length}`);
    return allTokens;
  }

  // Load Solana tokens
  private static async loadSolanaTokens(address: string): Promise<MultiChainTokenInfo[]> {
    const tokens: MultiChainTokenInfo[] = [];
    
    try {
      // Get SOL balance
      const solBalance = await SolanaService.getBalance(address);
      const solPrice = await this.getTokenPrice('solana');
      
      tokens.push({
        symbol: 'SOL',
        name: 'Solana',
        address: 'native',
        chain: 'Solana',
        decimals: 9,
        logo: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
        price: solPrice,
        priceFormatted: `$${solPrice.toFixed(4)}`,
        balance: solBalance || '0',
        balanceFormatted: solBalance || '0',
        usdValue: solBalance ? (parseFloat(solBalance) * solPrice).toFixed(2) : '0',
        verified: true,
        isNative: true,
      });

      // Get SPL token balances
      const splTokens = await SolanaService.getSPLTokenBalances(address);
      for (const token of splTokens) {
        const price = await this.getTokenPrice(token.symbol.toLowerCase());
        tokens.push({
          symbol: token.symbol,
          name: token.name,
          address: token.mint,
          chain: 'Solana',
          decimals: token.decimals,
          logo: token.logo || this.getDefaultLogo(token.symbol),
          price: price,
          priceFormatted: `$${price.toFixed(4)}`,
          balance: '0', // SPL tokens don't have balance in metadata
          balanceFormatted: '0',
          usdValue: '0',
          verified: true,
          isNative: false,
        });
      }
    } catch (error) {
      console.error('Failed to load Solana tokens:', error);
    }

    return tokens;
  }

  // Load TRON tokens
  private static async loadTronTokens(address: string): Promise<MultiChainTokenInfo[]> {
    const tokens: MultiChainTokenInfo[] = [];
    
    try {
      // Get TRX balance
      const tronService = new TronService();
      const trxBalance = await tronService.getBalance(address);
      const trxPrice = await this.getTokenPrice('tron');
      
      tokens.push({
        symbol: 'TRX',
        name: 'TRON',
        address: 'native',
        chain: 'Tron',
        decimals: 6,
        logo: 'https://assets.coingecko.com/coins/images/1094/large/tron-logo.png',
        price: trxPrice,
        priceFormatted: `$${trxPrice.toFixed(4)}`,
        balance: trxBalance || '0',
        balanceFormatted: trxBalance || '0',
        usdValue: trxBalance ? (parseFloat(trxBalance) * trxPrice).toFixed(2) : '0',
        verified: true,
        isNative: true,
      });

      // Get TRC-20 token balances
      const trc20Tokens = await tronService.getTRC20TokenBalances(address);
      for (const token of trc20Tokens) {
        const price = await this.getTokenPrice(token.symbol.toLowerCase());
        tokens.push({
          symbol: token.symbol || 'UNKNOWN',
          name: token.name || 'Unknown Token',
          address: token.address || '',
          chain: 'Tron',
          decimals: token.decimals || 18,
          logo: token.logo || this.getDefaultLogo(token.symbol || 'UNKNOWN'),
          price: price,
          priceFormatted: `$${price.toFixed(4)}`,
          balance: token.balance || '0',
          balanceFormatted: token.balance || '0',
          usdValue: (parseFloat(token.balance || '0') * price).toFixed(2),
          verified: true,
          isNative: false,
        });
      }
    } catch (error) {
      console.error('Failed to load TRON tokens:', error);
    }

    return tokens;
  }

  // Load Bitcoin tokens
  private static async loadBitcoinTokens(address: string): Promise<MultiChainTokenInfo[]> {
    const tokens: MultiChainTokenInfo[] = [];
    
    try {
      // Get BTC balance
      const btcBalance = await BitcoinService.getBalance(address);
      const btcPriceData = await BitcoinService.getPrice();
      
      tokens.push({
        symbol: 'BTC',
        name: 'Bitcoin',
        address: 'native',
        chain: 'Bitcoin',
        decimals: 8,
        logo: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
        price: btcPriceData?.price || 0,
        priceFormatted: `$${(btcPriceData?.price || 0).toFixed(2)}`,
        balance: btcBalance || '0',
        balanceFormatted: btcBalance || '0',
        usdValue: btcBalance && btcPriceData ? (parseFloat(btcBalance) * btcPriceData.price).toFixed(2) : '0',
        verified: true,
        isNative: true,
      });
    } catch (error) {
      console.error('Failed to load Bitcoin tokens:', error);
    }

    return tokens;
  }

  // Search tokens across all chains with filters
  static async searchTokens(query: string, filter?: TokenSearchFilter): Promise<MultiChainTokenInfo[]> {
    const cacheKey = `search_${query}_${JSON.stringify(filter)}`;
    const cached = this.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    const results: MultiChainTokenInfo[] = [];
    
    try {
      // Search CoinGecko for token information
      const coinGeckoResults = await this.searchCoinGecko(query, filter);
      results.push(...coinGeckoResults);

      // Search Moralis for EVM tokens if EVM chains are included
      if (!filter?.chains || filter.chains.some(c => ['Ethereum', 'BSC', 'Polygon', 'Arbitrum'].includes(c))) {
        const moralisResults = await this.searchMoralis(query, filter);
        results.push(...moralisResults);
      }

      // Remove duplicates and sort by relevance
      const uniqueResults = this.removeDuplicates(results);
      const sortedResults = this.sortByRelevance(uniqueResults, query);

      this.setCached(cacheKey, sortedResults);
      return sortedResults;
    } catch (error) {
      console.error('Failed to search tokens:', error);
      return [];
    }
  }

  // Search CoinGecko for token information
  private static async searchCoinGecko(query: string, filter?: TokenSearchFilter): Promise<MultiChainTokenInfo[]> {
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      const results: MultiChainTokenInfo[] = [];

      if (data.coins) {
        for (const coin of data.coins.slice(0, 20)) {
          const chain = this.mapCoinGeckoToChain(coin.id);
          
          // Apply chain filter
          if (filter?.chains && !filter.chains.includes(chain)) {
            continue;
          }

          const price = await this.getTokenPrice(coin.id);
          
          results.push({
            symbol: coin.symbol?.toUpperCase() || '',
            name: coin.name || '',
            address: this.getContractAddress(coin.id) || coin.id,
            chain: chain,
            decimals: 18,
            logo: coin.large || coin.small || coin.thumb || this.getDefaultLogo(coin.symbol),
            price: price,
            priceFormatted: `$${price.toFixed(4)}`,
            balance: '0',
            balanceFormatted: '0',
            usdValue: '0',
            verified: true,
            isNative: false,
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Failed to search CoinGecko:', error);
      return [];
    }
  }

  // Search Moralis for EVM tokens
  private static async searchMoralis(query: string, filter?: TokenSearchFilter): Promise<MultiChainTokenInfo[]> {
    if (!API_CONFIG.MORALIS.API_KEY) {
      return [];
    }

    try {
      const results: MultiChainTokenInfo[] = [];
      const evmChains = ['eth', 'polygon', 'bsc', 'arbitrum'];
      
      for (const chain of evmChains) {
        const chainName = this.getChainNameFromMoralis(chain);
        if (filter?.chains && !filter.chains.includes(chainName)) {
          continue;
        }

        try {
          const response = await fetch(
            `${API_CONFIG.MORALIS.API_URL}/erc20/metadata?chain=${chain}&symbols[]=${query}`,
            {
              headers: {
                'X-API-Key': API_CONFIG.MORALIS.API_KEY,
                'Accept': 'application/json',
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            for (const token of data) {
              const price = await this.getTokenPrice(token.symbol.toLowerCase());
              
              results.push({
                symbol: token.symbol,
                name: token.name,
                address: token.address,
                chain: chainName,
                decimals: parseInt(token.decimals),
                logo: token.logo || this.getDefaultLogo(token.symbol),
                price: price,
                priceFormatted: `$${price.toFixed(4)}`,
                balance: '0',
                balanceFormatted: '0',
                usdValue: '0',
                verified: !token.possible_spam,
                isNative: false,
              });
            }
          }
        } catch (error) {
          console.warn(`Failed to search Moralis for ${chain}:`, error);
        }
      }

      return results;
    } catch (error) {
      console.error('Failed to search Moralis:', error);
      return [];
    }
  }

  // Get token price from CoinGecko
  private static async getTokenPrice(coinId: string): Promise<number> {
    const cacheKey = `price_${coinId}`;
    const cached = this.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(`/api/prices?ids=${coinId}`);
      const data = await response.json();
      const price = data[coinId]?.usd || 0;
      
      this.setCached(cacheKey, price);
      return price;
    } catch (error) {
      console.error(`Failed to get price for ${coinId}:`, error);
      return 0;
    }
  }

  // Helper methods
  private static convertMoralisToMultiChain(token: MoralisTokenInfo): MultiChainTokenInfo {
    return {
      symbol: token.symbol,
      name: token.name,
      address: token.address,
      chain: token.chain as any,
      decimals: token.decimals,
      logo: token.logo,
      price: token.price,
      priceFormatted: token.priceFormatted,
      balance: token.balance,
      balanceFormatted: token.balanceFormatted,
      usdValue: token.usdValue,
      change24h: token.change24h,
      verified: token.verified,
      isNative: token.address === 'native',
    };
  }

  private static mapCoinGeckoToChain(coinId: string): 'Ethereum' | 'Tron' | 'Solana' | 'Bitcoin' | 'BSC' | 'Polygon' | 'Arbitrum' {
    const chainMap: Record<string, 'Ethereum' | 'Tron' | 'Solana' | 'Bitcoin' | 'BSC' | 'Polygon' | 'Arbitrum'> = {
      'bitcoin': 'Bitcoin',
      'ethereum': 'Ethereum',
      'tron': 'Tron',
      'solana': 'Solana',
      'binancecoin': 'BSC',
      'wbnb': 'BSC',
      'pancakeswap-token': 'BSC',
      'matic-network': 'Polygon',
      'wmatic': 'Polygon',
      'arbitrum': 'Arbitrum',
    };

    return chainMap[coinId] || 'Ethereum';
  }

  private static getChainNameFromMoralis(chain: string): 'Ethereum' | 'BSC' | 'Polygon' | 'Arbitrum' {
    const chainMap: Record<string, 'Ethereum' | 'BSC' | 'Polygon' | 'Arbitrum'> = {
      'eth': 'Ethereum',
      'polygon': 'Polygon',
      'bsc': 'BSC',
      'arbitrum': 'Arbitrum',
    };

    return chainMap[chain] || 'Ethereum';
  }

  private static getContractAddress(coinId: string): string {
    const knownContracts: { [key: string]: string } = {
      'pepe': '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
      'shiba-inu': '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
      'chainlink': '0x514910771AF9Ca656af840dff83E8264EcF986CA',
      'uniswap': '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      'aave': '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
    };

    return knownContracts[coinId] || '';
  }

  private static getDefaultLogo(symbol: string): string {
    return `https://via.placeholder.com/64/6B7280/FFFFFF?text=${symbol.charAt(0)}`;
  }

  private static removeDuplicates(tokens: MultiChainTokenInfo[]): MultiChainTokenInfo[] {
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

  private static sortByRelevance(tokens: MultiChainTokenInfo[], query: string): MultiChainTokenInfo[] {
    return tokens.sort((a, b) => {
      // Prioritize exact symbol matches
      const aExactMatch = a.symbol.toLowerCase() === query.toLowerCase();
      const bExactMatch = b.symbol.toLowerCase() === query.toLowerCase();
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;

      // Prioritize symbol starts with query
      const aStartsWith = a.symbol.toLowerCase().startsWith(query.toLowerCase());
      const bStartsWith = b.symbol.toLowerCase().startsWith(query.toLowerCase());
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      // Prioritize verified tokens
      if (a.verified && !b.verified) return -1;
      if (!a.verified && b.verified) return 1;

      return 0;
    });
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
