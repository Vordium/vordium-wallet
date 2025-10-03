'use client';

import { ethers } from 'ethers';
import TronWeb from 'tronweb';
import { tokenService } from './token.service';

export interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  usdValue: string;
  chain: 'Ethereum' | 'Tron' | 'Solana' | 'Bitcoin';
  address?: string;
  decimals: number;
  isNative: boolean;
  icon: string;
  change24h?: number; // Optional 24h price change percentage
}

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
];

const DEFAULT_ERC20_TOKENS = [
  { address: '0xdac17f958d2ee523a2206206994597c13d831ec7', symbol: 'USDT', name: 'Tether USD', decimals: 6 },
  { address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
  { address: '0x6b175474e89094c44da98b954eedeac495271d0f', symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18 },
];

const DEFAULT_TRC20_TOKENS = [
  { address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', symbol: 'USDT', name: 'Tether USD', decimals: 6 },
];

export class BalanceService {
  private static ethProvider: ethers.JsonRpcProvider | null = null;
  private static tronWeb: any | null = null;
  private static priceCache: Map<string, { price: number; timestamp: number }> = new Map();
  
  // Token logo mapping using CoinGecko assets (free API)
  private static readonly TOKEN_LOGOS: { [key: string]: string } = {
    'ETH': 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    'TRX': 'https://assets.coingecko.com/coins/images/1094/large/tron-logo.png',
    'USDT': 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
    'USDC': 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
    'DAI': 'https://assets.coingecko.com/coins/images/9956/large/Badge_Dai.png',
    'WETH': 'https://assets.coingecko.com/coins/images/2518/large/weth.png',
    'UNI': 'https://assets.coingecko.com/coins/images/12504/large/uni.jpg',
    'LINK': 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
    'AAVE': 'https://assets.coingecko.com/coins/images/12645/large/AAVE.png',
    'CRV': 'https://assets.coingecko.com/coins/images/12124/large/Curve.png',
    'MKR': 'https://assets.coingecko.com/coins/images/1364/large/Mark_Maker.png',
    'SNX': 'https://assets.coingecko.com/coins/images/3406/large/SNX.png',
    'COMP': 'https://assets.coingecko.com/coins/images/10775/large/COMP.png',
    'YFI': 'https://assets.coingecko.com/coins/images/11849/large/yearn.jpg',
    'SUSHI': 'https://assets.coingecko.com/coins/images/12271/large/512x512_Logo_no_chop.png',
    '1INCH': 'https://assets.coingecko.com/coins/images/13469/large/1inch-token.png',
    'BAT': 'https://assets.coingecko.com/coins/images/677/large/basic-attention-token.png',
    'ZRX': 'https://assets.coingecko.com/coins/images/863/large/0x.png',
    'LRC': 'https://assets.coingecko.com/coins/images/913/large/LRC.png',
    'JST': 'https://assets.coingecko.com/coins/images/11455/large/JUST.jpg',
    'SUN': 'https://assets.coingecko.com/coins/images/12885/large/sun-token.png',
    'BTT': 'https://assets.coingecko.com/coins/images/7595/large/BTT_Token_Icon.png',
    'WIN': 'https://assets.coingecko.com/coins/images/8804/large/wink_logo.png'
  };

  private static getEthProvider() {
    if (!this.ethProvider) {
      const rpc = process.env.NEXT_PUBLIC_ETHEREUM_RPC || 'https://eth.llamarpc.com';
      this.ethProvider = new ethers.JsonRpcProvider(rpc);
    }
    return this.ethProvider;
  }

  private static getTronWeb() {
    if (!this.tronWeb) {
      this.tronWeb = new TronWeb({
        fullHost: process.env.NEXT_PUBLIC_TRON_API || 'https://api.trongrid.io',
      });
    }
    return this.tronWeb;
  }

  static async getEthBalance(address: string): Promise<string> {
    try {
      const provider = this.getEthProvider();
      const balance = await provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to load ETH balance:', error);
      return '0';
    }
  }

  static async getTrxBalance(address: string): Promise<string> {
    try {
      const tronWeb = this.getTronWeb();
      const balance = await tronWeb.trx.getBalance(address);
      return tronWeb.fromSun(balance);
    } catch (error) {
      console.error('Failed to load TRX balance:', error);
      return '0';
    }
  }

  static async getERC20Tokens(address: string): Promise<TokenBalance[]> {
    const tokens: TokenBalance[] = [];
    const provider = this.getEthProvider();

    for (const token of DEFAULT_ERC20_TOKENS) {
      try {
        const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
        const balance = await contract.balanceOf(address);
        const formatted = ethers.formatUnits(balance, token.decimals);

        if (parseFloat(formatted) > 0) {
          const usdValue = await this.getUsdValue(token.symbol, formatted);
          tokens.push({
            symbol: token.symbol,
            name: token.name,
            balance: formatted,
            usdValue,
            chain: 'Ethereum',
            address: token.address,
            decimals: token.decimals,
            isNative: false,
            icon: this.getTokenLogo(token.symbol, token.address),
          });
        }
      } catch (error) {
        console.error(`Failed to load ${token.symbol}:`, error);
      }
    }

    return tokens;
  }

  static async getTRC20Tokens(address: string): Promise<TokenBalance[]> {
    const tokens: TokenBalance[] = [];
    const tronWeb = this.getTronWeb();

    for (const token of DEFAULT_TRC20_TOKENS) {
      try {
        const contract = await tronWeb.contract().at(token.address);
        const balance = await contract.balanceOf(address).call();
        const formatted = (balance / Math.pow(10, token.decimals)).toString();

        if (parseFloat(formatted) > 0) {
          const usdValue = await this.getUsdValue(token.symbol, formatted);
          tokens.push({
            symbol: token.symbol,
            name: token.name,
            balance: formatted,
            usdValue,
            chain: 'Tron',
            address: token.address,
            decimals: token.decimals,
            isNative: false,
            icon: this.getTokenLogo(token.symbol, token.address),
          });
        }
      } catch (error) {
        console.error(`Failed to load ${token.symbol} on TRON:`, error);
      }
    }

    return tokens;
  }

  // New method using comprehensive token service
  static async getAllTokensMultiChain(addresses: { [chain: string]: string }): Promise<TokenBalance[]> {
    try {
      const allBalances = await tokenService.getTokenBalances(addresses.ethereum || addresses.eth || '');
      
      // Convert to our TokenBalance format
      return allBalances.map(balance => ({
        symbol: balance.symbol,
        name: balance.name,
        balance: balance.balance,
        usdValue: balance.value_usd?.toString() || '0',
        chain: this.mapChainName(balance.chain) as 'Ethereum' | 'Tron' | 'Solana' | 'Bitcoin',
        address: balance.address,
        decimals: balance.decimals,
        isNative: balance.isNative,
        icon: balance.logo || this.getTokenLogo(balance.symbol, balance.address),
        change24h: balance.change24h,
      }));
    } catch (error) {
      console.error('Failed to load multi-chain tokens:', error);
      // Fallback to original method
      return this.getAllTokens(addresses.ethereum || addresses.eth || '', addresses.tron || '');
    }
  }

  static async getAllTokens(ethAddress: string, tronAddress: string): Promise<TokenBalance[]> {
    try {
      // Get custom tokens from localStorage
      const getCustomTokens = () => {
        try {
          const stored = localStorage.getItem('vordium-tokens');
          return stored ? JSON.parse(stored) : [];
        } catch {
          return [];
        }
      };

      const customTokens = getCustomTokens();

      const [ethBalance, trxBalance, ethTokens, tronTokens] = await Promise.all([
        this.getEthBalance(ethAddress),
        this.getTrxBalance(tronAddress),
        this.getERC20Tokens(ethAddress),
        this.getTRC20Tokens(tronAddress),
      ]);

      const ethUsd = await this.getUsdValue('ETH', ethBalance);
      const trxUsd = await this.getUsdValue('TRX', trxBalance);

      const allTokens: TokenBalance[] = [
        {
          symbol: 'ETH',
          name: 'Ethereum',
          balance: ethBalance,
          usdValue: ethUsd,
          chain: 'Ethereum',
          decimals: 18,
          isNative: true,
          icon: this.getTokenLogo('ETH'),
        },
        {
          symbol: 'TRX',
          name: 'TRON',
          balance: trxBalance,
          usdValue: trxUsd,
          chain: 'Tron',
          decimals: 6,
          isNative: true,
          icon: this.getTokenLogo('TRX'),
        },
        ...ethTokens,
        ...tronTokens,
      ];

      // Add custom tokens with updated balances
      for (const customToken of customTokens) {
        // Skip if already exists in default tokens
        if (allTokens.some(t => t.symbol === customToken.symbol && t.chain === customToken.chain)) {
          continue;
        }

        try {
          let balance = '0';
          const address = customToken.chain === 'Ethereum' ? ethAddress : tronAddress;

          if (customToken.chain === 'Ethereum' && customToken.address !== 'native') {
            const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ETHEREUM_RPC || 'https://eth.llamarpc.com');
            const contract = new ethers.Contract(customToken.address, ERC20_ABI, provider);
            const bal = await contract.balanceOf(address);
            balance = ethers.formatUnits(bal, customToken.decimals);
          } else if (customToken.chain === 'Tron' && customToken.address !== 'native') {
            const tronWeb = new TronWeb({ fullHost: 'https://api.trongrid.io' });
            const contract = await tronWeb.contract().at(customToken.address);
            const bal = await contract.balanceOf(address).call();
            balance = (bal / Math.pow(10, customToken.decimals)).toString();
          }

          const usdValue = await this.getUsdValue(customToken.symbol, balance);

          // Try to get logo from CoinGecko or use predefined logos
          let tokenLogo = customToken.logo;
          if (!tokenLogo || !tokenLogo.startsWith('http')) {
            tokenLogo = this.getTokenLogo(customToken.symbol, customToken.address);
          }

          allTokens.push({
            symbol: customToken.symbol,
            name: customToken.name,
            balance,
            usdValue,
            chain: customToken.chain,
            address: customToken.address,
            decimals: customToken.decimals,
            isNative: customToken.isNative || false,
            icon: tokenLogo,
          });
        } catch (error) {
          console.error(`Failed to load custom token ${customToken.symbol}:`, error);
        }
      }

      return allTokens;
    } catch (error) {
      console.error('Failed to load all tokens:', error);
      return [];
    }
  }

  static async getUsdValue(symbol: string, amount: string): Promise<string> {
    try {
      // Check cache (5 min TTL)
      const cached = this.priceCache.get(symbol);
      const now = Date.now();
      if (cached && now - cached.timestamp < 300000) {
        const value = parseFloat(amount) * cached.price;
        return value.toFixed(2);
      }

      const coinIds: Record<string, string> = {
        ETH: 'ethereum',
        TRX: 'tron',
        USDT: 'tether',
        USDC: 'usd-coin',
        DAI: 'dai',
      };

      const coinId = coinIds[symbol];
      if (!coinId) return '0.00';

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
        { cache: 'no-store' }
      );
      const data = await response.json();

      const price = data[coinId]?.usd || 0;
      this.priceCache.set(symbol, { price, timestamp: now });

      const value = parseFloat(amount) * price;
      return value.toFixed(2);
    } catch (error) {
      console.error('Failed to get USD value:', error);
      return '0.00';
    }
  }

  static async getTotalBalance(tokens: TokenBalance[]): Promise<string> {
    const total = tokens.reduce((sum, token) => {
      return sum + parseFloat(token.usdValue || '0');
    }, 0);
    return total.toFixed(2);
  }

  // Get token logo from CoinGecko assets or fallback
  static getTokenLogo(symbol: string, address?: string): string {
    const upperSymbol = symbol.toUpperCase();
    
    // First check our predefined logos
    if (this.TOKEN_LOGOS[upperSymbol]) {
      console.log(`Found logo for ${symbol}: ${this.TOKEN_LOGOS[upperSymbol]}`);
      return this.TOKEN_LOGOS[upperSymbol];
    }

    // Fallback to a generic token icon
    const fallbackUrl = `https://via.placeholder.com/64/6B7280/FFFFFF?text=${symbol.charAt(0)}`;
    console.log(`Using fallback logo for ${symbol}: ${fallbackUrl}`);
    return fallbackUrl;
  }

  // Map chain names to our format
  private static mapChainName(chain: string): 'Ethereum' | 'Tron' | 'Solana' | 'Bitcoin' {
    const chainMap: Record<string, 'Ethereum' | 'Tron' | 'Solana' | 'Bitcoin'> = {
      'ethereum': 'Ethereum',
      'eth': 'Ethereum',
      'polygon': 'Ethereum', // Treat as EVM
      'bsc': 'Ethereum', // Treat as EVM
      'arbitrum': 'Ethereum', // Treat as EVM
      'tron': 'Tron',
      'solana': 'Solana',
      'bitcoin': 'Bitcoin',
      'btc': 'Bitcoin',
    };
    return chainMap[chain.toLowerCase()] || 'Ethereum';
  }

  // Fetch token info from CoinGecko API (for dynamic logos)
  static async fetchTokenInfo(contractAddress: string, platform: string = 'ethereum'): Promise<{ logo?: string; name?: string } | null> {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${platform}/contract/${contractAddress}`,
        { 
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      return {
        logo: data.image?.large || data.image?.small,
        name: data.name
      };
    } catch (error) {
      console.error('Failed to fetch token info from CoinGecko:', error);
      return null;
    }
  }
}
