'use client';

import { ethers } from 'ethers';
import TronWeb from 'tronweb';
import { tokenService, type TokenBalance as TokenServiceBalance } from './token.service';
import { TokenMappingService } from './tokenMapping.service';

export interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  usdValue: string;
  chain: 'Ethereum' | 'Tron' | 'Solana' | 'Bitcoin';
  address?: string;
  decimals: number;
  isNative: boolean;
  logo: string;
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
            logo: this.getTokenLogo(token.symbol, token.address),
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
            logo: this.getTokenLogo(token.symbol, token.address),
          });
        }
      } catch (error) {
        console.error(`Failed to load ${token.symbol} on TRON:`, error);
      }
    }

    return tokens;
  }

  // Clear invalid tokens from localStorage
  static clearInvalidTokens(): void {
    try {
      const stored = localStorage.getItem('vordium-tokens');
      if (!stored) return;
      
      const customTokens = JSON.parse(stored);
      const validTokens = customTokens.filter((token: any) => {
        // Keep only tokens with valid addresses
        if (token.address === 'native') return true;
        if (token.chain === 'Ethereum' && token.address.startsWith('0x')) return true;
        if (token.chain === 'Tron' && token.address.startsWith('T')) return true;
        if (token.chain === 'Solana' && token.address.length >= 32 && token.address.length <= 44) return true;
        if (token.chain === 'Bitcoin' && (token.address.startsWith('1') || token.address.startsWith('3') || token.address.startsWith('bc1'))) return true;
        
        console.log(`Removing invalid token: ${token.symbol} with address: ${token.address}`);
        return false;
      });
      
      if (validTokens.length !== customTokens.length) {
        console.log(`Cleaned ${customTokens.length - validTokens.length} invalid tokens from localStorage`);
        localStorage.setItem('vordium-tokens', JSON.stringify(validTokens));
      }
    } catch (error) {
      console.error('Failed to clear invalid tokens:', error);
    }
  }

  // Live multi-chain token loading using best practices from major wallets
  static async getAllTokensMultiChain(addresses: { [chain: string]: string }): Promise<TokenBalance[]> {
    try {
      console.log('Loading live tokens for addresses:', addresses);
      
      // Clear invalid tokens first
      this.clearInvalidTokens();
      
      const allTokens: TokenBalance[] = [];
      
      // 1. Load EVM tokens using direct RPC calls (like MetaMask)
      if (addresses.ethereum || addresses.eth) {
        const ethAddress = addresses.ethereum || addresses.eth || '';
        if (ethAddress && ethAddress.startsWith('0x') && ethAddress.length === 42) {
          try {
            console.log('Loading EVM tokens for:', ethAddress);
            const evmTokens = await this.loadEVMTokens(ethAddress);
            allTokens.push(...evmTokens);
            console.log('EVM tokens loaded:', evmTokens.length);
          } catch (error) {
            console.error('Failed to load EVM tokens:', error);
          }
        }
      }
      
      // 2. Load TRON tokens using direct API calls
      if (addresses.tron) {
        const tronAddress = addresses.tron;
        if (tronAddress && tronAddress.startsWith('T') && tronAddress.length === 34) {
          try {
            console.log('Loading TRON tokens for:', tronAddress);
            const tronTokens = await this.loadTronTokens(tronAddress);
            allTokens.push(...tronTokens);
            console.log('TRON tokens loaded:', tronTokens.length);
          } catch (error) {
            console.error('Failed to load TRON tokens:', error);
          }
        }
      }
      
      // 3. Load Solana tokens using direct RPC calls
      if (addresses.solana) {
        const solAddress = addresses.solana;
        if (solAddress && solAddress.length >= 32 && solAddress.length <= 44 && !solAddress.startsWith('0x')) {
          try {
            console.log('Loading Solana tokens for:', solAddress);
            const solanaTokens = await this.loadSolanaTokens(solAddress);
            allTokens.push(...solanaTokens);
            console.log('Solana tokens loaded:', solanaTokens.length);
          } catch (error) {
            console.error('Failed to load Solana tokens:', error);
          }
        }
      }
      
      // 4. Load Bitcoin balance using direct API calls
      if (addresses.bitcoin) {
        const btcAddress = addresses.bitcoin;
        if (btcAddress && (btcAddress.startsWith('1') || btcAddress.startsWith('3') || btcAddress.startsWith('bc1')) && !btcAddress.startsWith('0x')) {
          try {
            console.log('Loading Bitcoin balance for:', btcAddress);
            const bitcoinTokens = await this.loadBitcoinTokens(btcAddress);
            allTokens.push(...bitcoinTokens);
            console.log('Bitcoin tokens loaded:', bitcoinTokens.length);
          } catch (error) {
            console.error('Failed to load Bitcoin tokens:', error);
          }
        }
      }
      
      // 5. Load custom tokens from localStorage
      const customTokens = await this.loadCustomTokens(addresses);
      allTokens.push(...customTokens);
      
      console.log('Total tokens loaded:', allTokens.length);
      return allTokens;
    } catch (error) {
      console.error('Failed to load multi-chain tokens:', error);
      // Fallback to original method
      return this.getAllTokens(addresses.ethereum || addresses.eth || '', addresses.tron || '');
    }
  }

  // Load EVM tokens using direct RPC calls (like MetaMask)
  private static async loadEVMTokens(address: string): Promise<TokenBalance[]> {
    const tokens: TokenBalance[] = [];
    
    try {
      // Use free public RPC endpoints
      const rpcUrls = [
        'https://eth.llamarpc.com',
        'https://rpc.ankr.com/eth',
        'https://ethereum.publicnode.com'
      ];
      
      let provider: ethers.JsonRpcProvider | null = null;
      
      // Try different RPC endpoints
      for (const rpcUrl of rpcUrls) {
        try {
          provider = new ethers.JsonRpcProvider(rpcUrl);
          await provider.getBlockNumber(); // Test connection
          console.log('Connected to RPC:', rpcUrl);
          break;
        } catch (error) {
          console.log('Failed to connect to RPC:', rpcUrl);
          continue;
        }
      }
      
      if (!provider) {
        throw new Error('No working RPC endpoint found');
      }
      
      // Get native ETH balance
      const ethBalance = await provider.getBalance(address);
      const ethBalanceFormatted = ethers.formatEther(ethBalance);
      
      // Get ETH price from CoinGecko (free)
      const ethPrice = await this.getTokenPrice('ethereum');
      const ethUsdValue = (parseFloat(ethBalanceFormatted) * ethPrice).toFixed(2);
      
      tokens.push({
        symbol: 'ETH',
        name: 'Ethereum',
        balance: ethBalanceFormatted,
        usdValue: ethUsdValue,
        chain: 'Ethereum',
        address: 'native',
        decimals: 18,
        isNative: true,
        logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
        change24h: await this.getTokenChange24h('ethereum'),
      });
      
      // Get popular ERC-20 tokens (USDT, USDC, DAI, etc.)
      const popularTokens = [
        {
          symbol: 'USDT',
          name: 'Tether USD',
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          decimals: 6,
          coingeckoId: 'tether'
        },
        {
          symbol: 'USDC',
          name: 'USD Coin',
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          decimals: 6,
          coingeckoId: 'usd-coin'
        },
        {
          symbol: 'DAI',
          name: 'Dai Stablecoin',
          address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
          decimals: 18,
          coingeckoId: 'dai'
        }
      ];
      
      for (const token of popularTokens) {
        try {
          const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
          const balance = await contract.balanceOf(address);
          const balanceFormatted = ethers.formatUnits(balance, token.decimals);
          
          if (parseFloat(balanceFormatted) > 0) {
            const price = await this.getTokenPrice(token.coingeckoId);
            const usdValue = (parseFloat(balanceFormatted) * price).toFixed(2);
            
            tokens.push({
              symbol: token.symbol,
              name: token.name,
              balance: balanceFormatted,
              usdValue: usdValue,
              chain: 'Ethereum',
              address: token.address,
              decimals: token.decimals,
              isNative: false,
              logo: `https://assets.coingecko.com/coins/images/${this.getTokenImageId(token.symbol)}/large/${token.symbol.toLowerCase()}.png`,
              change24h: await this.getTokenChange24h(token.coingeckoId),
            });
          }
        } catch (error) {
          console.error(`Failed to load ${token.symbol}:`, error);
        }
      }
      
    } catch (error) {
      console.error('Failed to load EVM tokens:', error);
    }
    
    return tokens;
  }

  // Load TRON tokens using direct API calls
  private static async loadTronTokens(address: string): Promise<TokenBalance[]> {
    const tokens: TokenBalance[] = [];
    
    try {
      // Get TRX balance
      const trxBalance = await this.getTrxBalance(address);
      const trxPrice = await this.getTokenPrice('tron');
      const trxUsdValue = (parseFloat(trxBalance) * trxPrice).toFixed(2);
      
      tokens.push({
        symbol: 'TRX',
        name: 'TRON',
        balance: trxBalance,
        usdValue: trxUsdValue,
        chain: 'Tron',
        address: 'native',
        decimals: 6,
        isNative: true,
        logo: 'https://assets.coingecko.com/coins/images/1094/large/tron-logo.png',
        change24h: await this.getTokenChange24h('tron'),
      });
      
    } catch (error) {
      console.error('Failed to load TRON tokens:', error);
    }
    
    return tokens;
  }

  // Load Solana tokens using direct RPC calls
  private static async loadSolanaTokens(address: string): Promise<TokenBalance[]> {
    const tokens: TokenBalance[] = [];
    
    try {
      // Use free Solana RPC
      const rpcUrl = 'https://api.mainnet-beta.solana.com';
      
      // Get SOL balance
      const solBalance = await this.getSolBalance(address, rpcUrl);
      const solPrice = await this.getTokenPrice('solana');
      const solUsdValue = (parseFloat(solBalance) * solPrice).toFixed(2);
      
      tokens.push({
        symbol: 'SOL',
        name: 'Solana',
        balance: solBalance,
        usdValue: solUsdValue,
        chain: 'Solana',
        address: 'native',
        decimals: 9,
        isNative: true,
        logo: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
        change24h: await this.getTokenChange24h('solana'),
      });
      
    } catch (error) {
      console.error('Failed to load Solana tokens:', error);
    }
    
    return tokens;
  }

  // Load Bitcoin balance using direct API calls
  private static async loadBitcoinTokens(address: string): Promise<TokenBalance[]> {
    const tokens: TokenBalance[] = [];
    
    try {
      // Use free Bitcoin API
      const btcBalance = await this.getBitcoinBalance(address);
      const btcPrice = await this.getTokenPrice('bitcoin');
      const btcUsdValue = (parseFloat(btcBalance) * btcPrice).toFixed(2);
      
      tokens.push({
        symbol: 'BTC',
        name: 'Bitcoin',
        balance: btcBalance,
        usdValue: btcUsdValue,
        chain: 'Bitcoin',
        address: 'native',
        decimals: 8,
        isNative: true,
        logo: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
        change24h: await this.getTokenChange24h('bitcoin'),
      });
      
    } catch (error) {
      console.error('Failed to load Bitcoin tokens:', error);
    }
    
    return tokens;
  }

  // Load custom tokens from localStorage
  private static async loadCustomTokens(addresses: { [chain: string]: string }): Promise<TokenBalance[]> {
    try {
      const stored = localStorage.getItem('vordium-tokens');
      if (!stored) return [];
      
      const customTokens = JSON.parse(stored);
      const tokens: TokenBalance[] = [];
      const fixedTokens: any[] = [];
      
      for (const token of customTokens) {
        try {
          // Fix invalid addresses (CoinGecko IDs)
          let fixedToken = { ...token };
          
          // If address is a CoinGecko ID, try to find proper mapping
          if (token.address && !token.address.startsWith('0x') && !token.address.startsWith('T') && token.address !== 'native') {
            console.log(`Fixing invalid address for ${token.symbol}: ${token.address}`);
            const mapping = TokenMappingService.getTokenByCoinGeckoId(token.address);
            if (mapping) {
              fixedToken.address = mapping.contractAddress;
              fixedToken.chain = mapping.chain;
              fixedToken.decimals = mapping.decimals;
              fixedToken.logo = mapping.logo;
              console.log(`Fixed ${token.symbol} address to: ${mapping.contractAddress}`);
            } else {
              console.log(`No mapping found for ${token.symbol}, skipping`);
              continue; // Skip tokens without proper mapping
            }
          }
          
          // Load balance based on chain
          let balance = '0';
          if (fixedToken.chain === 'Ethereum' && fixedToken.address !== 'native' && fixedToken.address.startsWith('0x')) {
            balance = await this.getERC20Balance(fixedToken.address, addresses.ethereum || addresses.eth || '', fixedToken.decimals);
          } else if (fixedToken.chain === 'Tron' && fixedToken.address !== 'native' && fixedToken.address.startsWith('T')) {
            balance = await this.getTRC20Balance(fixedToken.address, addresses.tron || '', fixedToken.decimals);
          }
          
          const price = await this.getTokenPrice(fixedToken.coingeckoId || fixedToken.symbol.toLowerCase());
          const usdValue = (parseFloat(balance) * price).toFixed(2);
          
          tokens.push({
            symbol: fixedToken.symbol,
            name: fixedToken.name,
            balance: balance,
            usdValue: usdValue,
            chain: fixedToken.chain,
            address: fixedToken.address,
            decimals: fixedToken.decimals,
            isNative: fixedToken.isNative || false,
            logo: fixedToken.logo || `https://assets.coingecko.com/coins/images/${this.getTokenImageId(fixedToken.symbol)}/large/${fixedToken.symbol.toLowerCase()}.png`,
            change24h: await this.getTokenChange24h(fixedToken.coingeckoId || fixedToken.symbol.toLowerCase()),
          });
          
          // Store fixed token for localStorage update
          fixedTokens.push(fixedToken);
        } catch (error) {
          console.error(`Failed to load custom token ${token.symbol}:`, error);
        }
      }
      
      // Update localStorage with fixed tokens
      if (fixedTokens.length !== customTokens.length) {
        console.log('Updating localStorage with fixed tokens');
        localStorage.setItem('vordium-tokens', JSON.stringify(fixedTokens));
      }
      
      return tokens;
    } catch (error) {
      console.error('Failed to load custom tokens:', error);
      return [];
    }
  }

  // Get token price from our API route (avoids CORS issues)
  private static async getTokenPrice(coinId: string): Promise<number> {
    try {
      const response = await fetch(`/api/prices?ids=${coinId}`);
      const data = await response.json();
      return data[coinId]?.usd || 0;
    } catch (error) {
      console.error(`Failed to get price for ${coinId}:`, error);
      return 0;
    }
  }

  // Get 24h price change from our API route (avoids CORS issues)
  private static async getTokenChange24h(coinId: string): Promise<number> {
    try {
      const response = await fetch(`/api/prices?ids=${coinId}&include_24hr_change=true`);
      const data = await response.json();
      return data[coinId]?.usd_24h_change || 0;
    } catch (error) {
      console.error(`Failed to get 24h change for ${coinId}:`, error);
      return 0;
    }
  }

  // Get token image ID for CoinGecko
  private static getTokenImageId(symbol: string): string {
    const imageIds: { [key: string]: string } = {
      'ETH': '279',
      'USDT': '325',
      'USDC': '6319',
      'DAI': '9956',
      'TRX': '1094',
      'SOL': '4128',
      'BTC': '1'
    };
    return imageIds[symbol.toUpperCase()] || '1';
  }

  // Get ERC-20 token balance
  private static async getERC20Balance(tokenAddress: string, userAddress: string, decimals: number): Promise<string> {
    try {
      const provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const balance = await contract.balanceOf(userAddress);
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      console.error('Failed to get ERC-20 balance:', error);
      return '0';
    }
  }

  // Get TRC-20 token balance
  private static async getTRC20Balance(tokenAddress: string, userAddress: string, decimals: number): Promise<string> {
    try {
      const tronWeb = new TronWeb({ fullHost: 'https://api.trongrid.io' });
      const contract = await tronWeb.contract().at(tokenAddress);
      const balance = await contract.balanceOf(userAddress).call();
      return (balance / Math.pow(10, decimals)).toString();
    } catch (error) {
      console.error('Failed to get TRC-20 balance:', error);
      return '0';
    }
  }

  // Get SOL balance
  private static async getSolBalance(address: string, rpcUrl: string): Promise<string> {
    try {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [address]
        })
      });
      
      const data = await response.json();
      const lamports = data.result?.value || 0;
      return (lamports / 1000000000).toString(); // Convert lamports to SOL
    } catch (error) {
      console.error('Failed to get SOL balance:', error);
      return '0';
    }
  }

  // Get TRON tokens
  private static async getTronTokens(address: string): Promise<TokenBalance[]> {
    try {
      const trxBalance = await this.getTrxBalance(address);
      const trxUsd = await this.getUsdValue('TRX', trxBalance);
      
      return [
        {
          symbol: 'TRX',
          name: 'TRON',
          balance: trxBalance,
          usdValue: trxUsd,
          chain: 'Tron',
          address: 'native',
          decimals: 6,
          isNative: true,
          logo: this.getTokenLogo('TRX'),
          change24h: undefined,
        }
      ];
    } catch (error) {
      console.error('Failed to load TRON tokens:', error);
      return [];
    }
  }

  // Get Bitcoin balance
  private static async getBitcoinBalance(address: string): Promise<string> {
    try {
      // For now, return 0 balance as we don't have a real Bitcoin API
      // In production, you would integrate with a Bitcoin API like BlockCypher
      return '0';
    } catch (error) {
      console.error('Failed to get Bitcoin balance:', error);
      return '0';
    }
  }

  // Get Bitcoin tokens
  private static async getBitcoinTokens(address: string): Promise<TokenBalance[]> {
    try {
      const bitcoinBalance = await this.getBitcoinBalance(address);
      const bitcoinUsd = await this.getUsdValue('BTC', bitcoinBalance);
      
      return [
        {
          symbol: 'BTC',
          name: 'Bitcoin',
          balance: bitcoinBalance,
          usdValue: bitcoinUsd,
          chain: 'Bitcoin',
          address: 'native',
          decimals: 8,
          isNative: true,
          logo: this.getTokenLogo('BTC'),
          change24h: undefined,
        }
      ];
    } catch (error) {
      console.error('Failed to load Bitcoin tokens:', error);
      return [];
    }
  }

  // Load custom tokens with their balances
  private static async loadCustomTokenBalances(customTokens: any[], addresses: { [chain: string]: string }): Promise<TokenBalance[]> {
    const customTokenBalances: TokenBalance[] = [];

    for (const customToken of customTokens) {
      try {
        let balance = '0';
        let address = '';

        // Get the appropriate address for the chain
        switch (customToken.chain) {
          case 'Ethereum':
            address = addresses.ethereum || addresses.eth || '';
            break;
          case 'Tron':
            address = addresses.tron || '';
            break;
          case 'Solana':
            address = addresses.solana || '';
            break;
          case 'Bitcoin':
            address = addresses.bitcoin || '';
            break;
        }

        if (!address) continue;

        // Load balance based on chain
        if (customToken.chain === 'Ethereum' && customToken.address !== 'native' && customToken.address.startsWith('0x')) {
          try {
            const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ETHEREUM_RPC || 'https://eth.llamarpc.com');
            const contract = new ethers.Contract(customToken.address, ERC20_ABI, provider);
            const bal = await contract.balanceOf(address);
            balance = ethers.formatUnits(bal, customToken.decimals);
          } catch (error) {
            console.error(`Failed to load balance for ${customToken.symbol}:`, error);
            balance = '0';
          }
        } else if (customToken.chain === 'Tron' && customToken.address !== 'native' && customToken.address.startsWith('T')) {
          try {
            const tronWeb = new TronWeb({ fullHost: 'https://api.trongrid.io' });
            const contract = await tronWeb.contract().at(customToken.address);
            const bal = await contract.balanceOf(address).call();
            balance = (bal / Math.pow(10, customToken.decimals)).toString();
          } catch (error) {
            console.error(`Failed to load balance for ${customToken.symbol}:`, error);
            balance = '0';
          }
        }
        // For Solana and Bitcoin, we'll use 0 balance for now since we don't have the full implementation

        const usdValue = await this.getUsdValue(customToken.symbol, balance);

        // Try to get logo from CoinGecko or use predefined logos
        let tokenLogo = customToken.logo;
        if (!tokenLogo || !tokenLogo.startsWith('http')) {
          tokenLogo = this.getTokenLogo(customToken.symbol, customToken.address);
        }

        customTokenBalances.push({
          symbol: customToken.symbol,
          name: customToken.name,
          balance,
          usdValue,
          chain: customToken.chain,
          address: customToken.address || '',
          decimals: customToken.decimals,
          isNative: customToken.isNative || false,
          logo: tokenLogo,
        });
      } catch (error) {
        console.error(`Failed to load custom token ${customToken.symbol}:`, error);
      }
    }

    return customTokenBalances;
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
          logo: this.getTokenLogo('ETH'),
        },
        {
          symbol: 'TRX',
          name: 'TRON',
          balance: trxBalance,
          usdValue: trxUsd,
          chain: 'Tron',
          decimals: 6,
          isNative: true,
          logo: this.getTokenLogo('TRX'),
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
            logo: tokenLogo,
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
        `/api/prices?ids=${coinId}`,
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
        `/api/contract?platform=${platform}&contract=${contractAddress}`,
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
