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

// Comprehensive tokens database with extensive coverage
export const POPULAR_TOKENS: TokenSearchResult[] = [
  // Ethereum Tokens - Major DeFi & Stablecoins
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    chain: 'Ethereum',
    decimals: 6,
    logo: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
    verified: true
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    chain: 'Ethereum',
    decimals: 6,
    logo: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
    verified: true
  },
  {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    chain: 'Ethereum',
    decimals: 18,
    logo: 'https://assets.coingecko.com/coins/images/9956/large/Badge_Dai.png',
    verified: true
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ethereum',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    chain: 'Ethereum',
    decimals: 18,
    logo: 'https://assets.coingecko.com/coins/images/2518/large/weth.png',
    verified: true
  },
  {
    symbol: 'UNI',
    name: 'Uniswap',
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    chain: 'Ethereum',
    decimals: 18,
    logo: 'https://assets.coingecko.com/coins/images/12504/large/uni.jpg',
    verified: true
  },
  {
    symbol: 'LINK',
    name: 'Chainlink',
    address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    chain: 'Ethereum',
    decimals: 18,
    logo: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
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
  {
    symbol: 'COMP',
    name: 'Compound',
    address: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
    chain: 'Ethereum',
    decimals: 18,
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xc00e94Cb662C3520282E6f5717214004A7f26888/logo.png',
    verified: true
  },
  {
    symbol: 'YFI',
    name: 'yearn.finance',
    address: '0x0bc529c00C6401aEF6D220BE8c6Ea1667F6Ad93e',
    chain: 'Ethereum',
    decimals: 18,
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x0bc529c00C6401aEF6D220BE8c6Ea1667F6Ad93e/logo.png',
    verified: true
  },
  {
    symbol: 'SUSHI',
    name: 'SushiToken',
    address: '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2',
    chain: 'Ethereum',
    decimals: 18,
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B3595068778DD592e39A122f4f5a5cF09C90fE2/logo.png',
    verified: true
  },
  {
    symbol: '1INCH',
    name: '1inch',
    address: '0x111111111117dC0aa78b770fA6A738034120C302',
    chain: 'Ethereum',
    decimals: 18,
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x111111111117dC0aa78b770fA6A738034120C302/logo.png',
    verified: true
  },
  {
    symbol: 'BAT',
    name: 'Basic Attention Token',
    address: '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
    chain: 'Ethereum',
    decimals: 18,
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x0D8775F648430679A709E98d2b0Cb6250d2887EF/logo.png',
    verified: true
  },
  {
    symbol: 'ZRX',
    name: '0x Protocol Token',
    address: '0xE41d2489571d322189246DaFA5ebDe1F4699F498',
    chain: 'Ethereum',
    decimals: 18,
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xE41d2489571d322189246DaFA5ebDe1F4699F498/logo.png',
    verified: true
  },
  {
    symbol: 'LEND',
    name: 'Aave LEND',
    address: '0x80fB784B7eD66730e8b1DBd9820aFD29931aab03',
    chain: 'Ethereum',
    decimals: 18,
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x80fB784B7eD66730e8b1DBd9820aFD29931aab03/logo.png',
    verified: true
  },
  {
    symbol: 'KNC',
    name: 'Kyber Network Crystal',
    address: '0xdd974D5C2e2928deA5F71b9825b8b646686BD200',
    chain: 'Ethereum',
    decimals: 18,
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdd974D5C2e2928deA5F71b9825b8b646686BD200/logo.png',
    verified: true
  },
  {
    symbol: 'REN',
    name: 'Republic Protocol',
    address: '0x408e41876cCCDC0F92210600ef50372656052a38',
    chain: 'Ethereum',
    decimals: 18,
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x408e41876cCCDC0F92210600ef50372656052a38/logo.png',
    verified: true
  },
  {
    symbol: 'LRC',
    name: 'Loopring',
    address: '0xBBbbCA6A901c926F240b89EacB641d8Aec7AEafD',
    chain: 'Ethereum',
    decimals: 18,
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xBBbbCA6A901c926F240b89EacB641d8Aec7AEafD/logo.png',
    verified: true
  },

  // TRON Tokens - Major TRC20 tokens
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
    logo: 'https://assets.coingecko.com/coins/images/1094/large/tron-logo.png',
    verified: true
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: 'native',
    chain: 'Ethereum',
    decimals: 18,
    logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
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
