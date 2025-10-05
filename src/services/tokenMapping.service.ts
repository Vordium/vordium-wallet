/**
 * Token Mapping Service
 * Maps CoinGecko IDs to actual contract addresses
 */

export interface TokenMapping {
  coingeckoId: string;
  symbol: string;
  name: string;
  contractAddress: string;
  chain: 'Ethereum' | 'Tron' | 'Solana' | 'Bitcoin';
  decimals: number;
  logo: string;
}

// Popular token mappings with actual contract addresses
export const TOKEN_MAPPINGS: TokenMapping[] = [
  // Ethereum Tokens
  {
    coingeckoId: 'tether',
    symbol: 'USDT',
    name: 'Tether USD',
    contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    chain: 'Ethereum',
    decimals: 6,
    logo: 'https://via.placeholder.com/64/6B7280/FFFFFF?text=USDT'
  },
  {
    coingeckoId: 'usd-coin',
    symbol: 'USDC',
    name: 'USD Coin',
    contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    chain: 'Ethereum',
    decimals: 6,
    logo: 'https://via.placeholder.com/64/6B7280/FFFFFF?text=USDC'
  },
  {
    coingeckoId: 'dai',
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    contractAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    chain: 'Ethereum',
    decimals: 18,
    logo: 'https://via.placeholder.com/64/6B7280/FFFFFF?text=DAI'
  },
  {
    coingeckoId: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    contractAddress: 'native',
    chain: 'Ethereum',
    decimals: 18,
    logo: 'https://via.placeholder.com/64/6B7280/FFFFFF?text=ETH'
  },
  {
    coingeckoId: 'weth',
    symbol: 'WETH',
    name: 'Wrapped Ethereum',
    contractAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    chain: 'Ethereum',
    decimals: 18,
    logo: 'https://assets.coingecko.com/coins/images/2518/large/weth.png'
  },
  {
    coingeckoId: 'uniswap',
    symbol: 'UNI',
    name: 'Uniswap',
    contractAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    chain: 'Ethereum',
    decimals: 18,
    logo: 'https://assets.coingecko.com/coins/images/12504/large/uni.jpg'
  },
  {
    coingeckoId: 'chainlink',
    symbol: 'LINK',
    name: 'Chainlink',
    contractAddress: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    chain: 'Ethereum',
    decimals: 18,
    logo: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png'
  },
  // TRON Tokens
  {
    coingeckoId: 'tron',
    symbol: 'TRX',
    name: 'TRON',
    contractAddress: 'native',
    chain: 'Tron',
    decimals: 6,
    logo: 'https://via.placeholder.com/64/6B7280/FFFFFF?text=TRX'
  },
  // Solana Tokens
  {
    coingeckoId: 'solana',
    symbol: 'SOL',
    name: 'Solana',
    contractAddress: 'native',
    chain: 'Solana',
    decimals: 9,
    logo: 'https://via.placeholder.com/64/6B7280/FFFFFF?text=SOL'
  },
  // Bitcoin
  {
    coingeckoId: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    contractAddress: 'native',
    chain: 'Bitcoin',
    decimals: 8,
    logo: 'https://via.placeholder.com/64/6B7280/FFFFFF?text=BTC'
  }
];

export class TokenMappingService {
  // Get token mapping by CoinGecko ID
  static getTokenByCoinGeckoId(coingeckoId: string): TokenMapping | undefined {
    return TOKEN_MAPPINGS.find(token => token.coingeckoId === coingeckoId);
  }

  // Get token mapping by symbol and chain
  static getTokenBySymbol(symbol: string, chain: 'Ethereum' | 'Tron' | 'Solana' | 'Bitcoin'): TokenMapping | undefined {
    return TOKEN_MAPPINGS.find(token => 
      token.symbol.toLowerCase() === symbol.toLowerCase() && token.chain === chain
    );
  }

  // Convert CoinGecko search result to proper token data
  static convertCoinGeckoResult(coin: any, chain: 'Ethereum' | 'Tron' | 'Solana' | 'Bitcoin'): TokenMapping | null {
    const mapping = this.getTokenByCoinGeckoId(coin.id);
    if (mapping && mapping.chain === chain) {
      return mapping;
    }

    // If no mapping found, return null (don't add tokens without proper contract addresses)
    return null;
  }

  // Get all tokens for a specific chain
  static getTokensForChain(chain: 'Ethereum' | 'Tron' | 'Solana' | 'Bitcoin'): TokenMapping[] {
    return TOKEN_MAPPINGS.filter(token => token.chain === chain);
  }
}
