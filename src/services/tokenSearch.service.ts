// Comprehensive Token Search Service for EVM and TRON networks

export interface TokenSearchResult {
  symbol: string;
  name: string;
  address: string;
  chain: 'Ethereum' | 'Tron';
  decimals: number;
  logo: string;
  balance?: string;
  verified?: boolean;
}

// Popular tokens database with comprehensive coverage
export const POPULAR_TOKENS: TokenSearchResult[] = [
  // Ethereum Tokens
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    chain: 'Ethereum',
    decimals: 6,
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
    verified: true
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    chain: 'Ethereum',
    decimals: 6,
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    verified: true
  },
  {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    chain: 'Ethereum',
    decimals: 18,
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
    verified: true
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ethereum',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    chain: 'Ethereum',
    decimals: 18,
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
    verified: true
  },
  {
    symbol: 'UNI',
    name: 'Uniswap',
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    chain: 'Ethereum',
    decimals: 18,
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png',
    verified: true
  },
  {
    symbol: 'LINK',
    name: 'Chainlink',
    address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    chain: 'Ethereum',
    decimals: 18,
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo.png',
    verified: true
  },
  {
    symbol: 'AAVE',
    name: 'Aave Token',
    address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
    chain: 'Ethereum',
    decimals: 18,
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9/logo.png',
    verified: true
  },
  {
    symbol: 'CRV',
    name: 'Curve DAO Token',
    address: '0xD533a949740bb3306d119CC777fa900bA034cd52',
    chain: 'Ethereum',
    decimals: 18,
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xD533a949740bb3306d119CC777fa900bA034cd52/logo.png',
    verified: true
  },
  {
    symbol: 'MKR',
    name: 'Maker',
    address: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
    chain: 'Ethereum',
    decimals: 18,
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2/logo.png',
    verified: true
  },
  {
    symbol: 'SNX',
    name: 'Synthetix Network Token',
    address: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
    chain: 'Ethereum',
    decimals: 18,
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F/logo.png',
    verified: true
  },

  // TRON Tokens
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    chain: 'Tron',
    decimals: 6,
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/tron/assets/TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t/logo.png',
    verified: true
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: 'TEkxiTehnzSmSe2XqrBj4w34RUNKrd3oRZ',
    chain: 'Tron',
    decimals: 6,
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/tron/assets/TEkxiTehnzSmSe2XqrBj4w34RUNKrd3oRZ/logo.png',
    verified: true
  },
  {
    symbol: 'JST',
    name: 'JUST',
    address: 'TCFLL5dx5ZJdKnWuesXxi1VPwjLVmWZZT9',
    chain: 'Tron',
    decimals: 18,
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/tron/assets/TCFLL5dx5ZJdKnWuesXxi1VPwjLVmWZZT9/logo.png',
    verified: true
  },
  {
    symbol: 'SUN',
    name: 'SUN',
    address: 'TSSMHYeV2uE9qYH95DqyoCuNCzEL1NvU3S',
    chain: 'Tron',
    decimals: 18,
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/tron/assets/TSSMHYeV2uE9qYH95DqyoCuNCzEL1NvU3S/logo.png',
    verified: true
  },
  {
    symbol: 'BTT',
    name: 'BitTorrent',
    address: 'TAFjULxiVgT4qWk6UZwjqwZXTSaGaqnVp4',
    chain: 'Tron',
    decimals: 18,
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/tron/assets/TAFjULxiVgT4qWk6UZwjqwZXTSaGaqnVp4/logo.png',
    verified: true
  },
  {
    symbol: 'WIN',
    name: 'WINk',
    address: 'TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7',
    chain: 'Tron',
    decimals: 6,
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/tron/assets/TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7/logo.png',
    verified: true
  },
  {
    symbol: 'TRX',
    name: 'TRON',
    address: 'native',
    chain: 'Tron',
    decimals: 6,
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/tron/info/logo.png',
    verified: true
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: 'native',
    chain: 'Ethereum',
    decimals: 18,
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
    verified: true
  }
];

export class TokenSearchService {
  // Search tokens by query
  static searchTokens(query: string, chain?: 'Ethereum' | 'Tron'): TokenSearchResult[] {
    if (!query || query.length < 2) return [];

    const lowerQuery = query.toLowerCase();
    
    let results = POPULAR_TOKENS.filter(token => {
      const matchesChain = !chain || token.chain === chain;
      const matchesQuery = 
        token.symbol.toLowerCase().includes(lowerQuery) ||
        token.name.toLowerCase().includes(lowerQuery) ||
        token.address.toLowerCase().includes(lowerQuery);
      
      return matchesChain && matchesQuery;
    });

    // Sort by relevance (exact symbol match first, then name, then address)
    results.sort((a, b) => {
      const aSymbolExact = a.symbol.toLowerCase() === lowerQuery;
      const bSymbolExact = b.symbol.toLowerCase() === lowerQuery;
      if (aSymbolExact && !bSymbolExact) return -1;
      if (!aSymbolExact && bSymbolExact) return 1;

      const aSymbolStart = a.symbol.toLowerCase().startsWith(lowerQuery);
      const bSymbolStart = b.symbol.toLowerCase().startsWith(lowerQuery);
      if (aSymbolStart && !bSymbolStart) return -1;
      if (!aSymbolStart && bSymbolStart) return 1;

      const aNameStart = a.name.toLowerCase().startsWith(lowerQuery);
      const bNameStart = b.name.toLowerCase().startsWith(lowerQuery);
      if (aNameStart && !bNameStart) return -1;
      if (!aNameStart && bNameStart) return 1;

      return a.symbol.localeCompare(b.symbol);
    });

    return results.slice(0, 20); // Limit to 20 results
  }

  // Get token by address
  static getTokenByAddress(address: string, chain: 'Ethereum' | 'Tron'): TokenSearchResult | null {
    return POPULAR_TOKENS.find(token => 
      token.address.toLowerCase() === address.toLowerCase() && 
      token.chain === chain
    ) || null;
  }

  // Get all tokens for a chain
  static getTokensByChain(chain: 'Ethereum' | 'Tron'): TokenSearchResult[] {
    return POPULAR_TOKENS.filter(token => token.chain === chain);
  }

  // Get verified tokens only
  static getVerifiedTokens(chain?: 'Ethereum' | 'Tron'): TokenSearchResult[] {
    let tokens = POPULAR_TOKENS.filter(token => token.verified);
    if (chain) {
      tokens = tokens.filter(token => token.chain === chain);
    }
    return tokens;
  }
}
