'use client';

import { ethers } from 'ethers';
import TronWeb from 'tronweb';

export interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  usdValue: string;
  chain: 'Ethereum' | 'Tron';
  address?: string;
  decimals: number;
  isNative: boolean;
  icon: string;
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
            icon: '💲',
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
            icon: '💲',
          });
        }
      } catch (error) {
        console.error(`Failed to load ${token.symbol} on TRON:`, error);
      }
    }

    return tokens;
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
          icon: '⚡',
        },
        {
          symbol: 'TRX',
          name: 'TRON',
          balance: trxBalance,
          usdValue: trxUsd,
          chain: 'Tron',
          decimals: 6,
          isNative: true,
          icon: '🔺',
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

          allTokens.push({
            symbol: customToken.symbol,
            name: customToken.name,
            balance,
            usdValue,
            chain: customToken.chain,
            address: customToken.address,
            decimals: customToken.decimals,
            isNative: customToken.isNative || false,
            icon: customToken.logo || '🪙',
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
}
