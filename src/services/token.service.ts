/**
 * Comprehensive Token Service
 * Integrates Moralis, Helius, and other APIs for multi-chain token data
 */

import { moralisService, type MoralisTokenBalance, type MoralisNativeBalance } from './moralis.service';
import { heliusService, type HeliusTokenBalance, type HeliusNativeBalance } from './helius.service';
import { BitcoinService, type BitcoinPrice } from './bitcoin.service';
import { CHAIN_CONFIG } from '@/config/api.config';

export interface TokenBalance {
  symbol: string;
  name: string;
  address: string;
  chain: string;
  decimals: number;
  balance: string;
  balance_formatted: string;
  logo?: string;
  price?: number;
  value_usd?: number;
  change24h?: number;
  isNative: boolean;
}

export interface TokenMetadata {
  symbol: string;
  name: string;
  address: string;
  chain: string;
  decimals: number;
  logo?: string;
  description?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  coingecko_id?: string;
}

export class TokenService {
  private static instance: TokenService;

  private constructor() {}

  static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  /**
   * Get token balances for all supported chains
   */
  async getTokenBalances(address: string): Promise<TokenBalance[]> {
    const allBalances: TokenBalance[] = [];

    try {
      // Get EVM chain balances (Ethereum, Polygon, BSC, Arbitrum)
      const evmChains = ['eth', 'polygon', 'bsc', 'arbitrum'];
      
      for (const chain of evmChains) {
        try {
          // Get native token balance
          const nativeBalance = await moralisService.getNativeBalance(address, chain);
          if (nativeBalance) {
            allBalances.push({
              symbol: nativeBalance.symbol,
              name: nativeBalance.name,
              address: 'native',
              chain: chain,
              decimals: 18,
              balance: nativeBalance.balance,
              balance_formatted: nativeBalance.balance_formatted,
              price: nativeBalance.price,
              value_usd: nativeBalance.value_usd,
              isNative: true,
            });
          }

          // Get ERC20 token balances
          const tokenBalances = await moralisService.getTokenBalances(address, chain);
          const formattedBalances = tokenBalances.map(token => ({
            symbol: token.symbol,
            name: token.name,
            address: token.token_address,
            chain: chain,
            decimals: token.decimals,
            balance: token.balance,
            balance_formatted: token.balance_formatted,
            logo: token.logo || token.thumbnail,
            price: token.price,
            value_usd: token.value_usd,
            isNative: false,
          }));

          allBalances.push(...formattedBalances);
        } catch (error) {
          console.error(`Error fetching ${chain} balances:`, error);
        }
      }

      // Get Solana balances
      try {
        const solanaNativeBalance = await heliusService.getNativeBalance(address);
        if (solanaNativeBalance) {
          allBalances.push({
            symbol: 'SOL',
            name: 'Solana',
            address: 'native',
            chain: 'solana',
            decimals: 9,
            balance: solanaNativeBalance.balance.toString(),
            balance_formatted: solanaNativeBalance.balance_formatted,
            price: solanaNativeBalance.price,
            value_usd: solanaNativeBalance.value_usd,
            isNative: true,
          });
        }

        const solanaTokenBalances = await heliusService.getTokenBalances(address);
        const formattedSolanaBalances = solanaTokenBalances.map(token => ({
          symbol: token.symbol,
          name: token.name,
          address: token.mint,
          chain: 'solana',
          decimals: token.decimals,
          balance: token.balance.toString(),
          balance_formatted: token.balance_formatted,
          logo: token.logo,
          price: token.price,
          value_usd: token.value_usd,
          isNative: false,
        }));

        allBalances.push(...formattedSolanaBalances);
      } catch (error) {
        console.error('Error fetching Solana balances:', error);
      }

      // Get Bitcoin balance
      try {
        const bitcoinBalance = await BitcoinService.getBalance(address);
        if (bitcoinBalance && bitcoinBalance !== '0') {
          const bitcoinPrice = await BitcoinService.getPrice();
          const balanceNumber = parseFloat(bitcoinBalance);
          allBalances.push({
            symbol: 'BTC',
            name: 'Bitcoin',
            address: address,
            chain: 'bitcoin',
            decimals: 8,
            balance: bitcoinBalance,
            balance_formatted: parseFloat(bitcoinBalance).toFixed(8),
            price: bitcoinPrice?.price ?? undefined,
            value_usd: bitcoinPrice ? balanceNumber * bitcoinPrice.price : undefined,
            isNative: true,
          });
        }
      } catch (error) {
        console.error('Error fetching Bitcoin balance:', error);
      }

      // Get TRON balances (using existing service)
      try {
        // This would integrate with existing TRON service
        // For now, we'll skip TRON as it's already handled elsewhere
      } catch (error) {
        console.error('Error fetching TRON balances:', error);
      }

    } catch (error) {
      console.error('Error fetching token balances:', error);
    }

    return allBalances;
  }

  /**
   * Get token metadata
   */
  async getTokenMetadata(address: string, chain: string): Promise<TokenMetadata | null> {
    try {
      switch (chain.toLowerCase()) {
        case 'eth':
        case 'ethereum':
        case 'polygon':
        case 'bsc':
        case 'arbitrum':
          const moralisMetadata = await moralisService.getTokenMetadata(address, chain);
          if (moralisMetadata) {
            return {
              symbol: moralisMetadata.symbol,
              name: moralisMetadata.name,
              address: moralisMetadata.token_address,
              chain: chain,
              decimals: moralisMetadata.decimals,
              logo: moralisMetadata.logo || moralisMetadata.thumbnail,
            };
          }
          break;

        case 'solana':
          const heliusMetadata = await heliusService.getTokenMetadata(address);
          if (heliusMetadata) {
            return {
              symbol: heliusMetadata.symbol,
              name: heliusMetadata.name,
              address: heliusMetadata.mint,
              chain: 'solana',
              decimals: heliusMetadata.decimals,
              logo: heliusMetadata.logo,
              description: heliusMetadata.description,
              website: heliusMetadata.external_url,
            };
          }
          break;

        case 'bitcoin':
          return {
            symbol: 'BTC',
            name: 'Bitcoin',
            address: address,
            chain: 'bitcoin',
            decimals: 8,
            logo: CHAIN_CONFIG.BITCOIN.logoUrl,
          };

        default:
          return null;
      }
    } catch (error) {
      console.error('Error fetching token metadata:', error);
      return null;
    }

    return null;
  }

  /**
   * Search for tokens across all chains
   */
  async searchTokens(query: string, chain?: string): Promise<TokenMetadata[]> {
    const results: TokenMetadata[] = [];

    try {
      if (!chain || chain === 'eth' || chain === 'ethereum' || chain === 'polygon' || chain === 'bsc' || chain === 'arbitrum') {
        const moralisResults = await moralisService.searchTokens(query, chain);
        const formattedResults = moralisResults.map(token => ({
          symbol: token.symbol,
          name: token.name,
          address: token.token_address,
          chain: token.chain,
          decimals: token.decimals,
          logo: token.logo || token.thumbnail,
        }));
        results.push(...formattedResults);
      }

      if (!chain || chain === 'solana') {
        const heliusResults = await heliusService.searchTokens(query);
        const formattedResults = heliusResults.map(token => ({
          symbol: token.symbol,
          name: token.name,
          address: token.mint,
          chain: 'solana',
          decimals: token.decimals,
          logo: token.logo,
          description: token.description,
        }));
        results.push(...formattedResults);
      }
    } catch (error) {
      console.error('Error searching tokens:', error);
    }

    return results;
  }

  /**
   * Get trending tokens
   */
  async getTrendingTokens(chain?: string): Promise<TokenMetadata[]> {
    const results: TokenMetadata[] = [];

    try {
      if (!chain || chain === 'eth' || chain === 'ethereum' || chain === 'polygon' || chain === 'bsc' || chain === 'arbitrum') {
        const moralisResults = await moralisService.getTrendingTokens(chain);
        const formattedResults = moralisResults.map(token => ({
          symbol: token.symbol,
          name: token.name,
          address: token.token_address,
          chain: token.chain,
          decimals: token.decimals,
          logo: token.logo || token.thumbnail,
        }));
        results.push(...formattedResults);
      }

      if (!chain || chain === 'solana') {
        const heliusResults = await heliusService.getTrendingTokens();
        const formattedResults = heliusResults.map(token => ({
          symbol: token.symbol,
          name: token.name,
          address: token.mint,
          chain: 'solana',
          decimals: token.decimals,
          logo: token.logo,
          description: token.description,
        }));
        results.push(...formattedResults);
      }
    } catch (error) {
      console.error('Error fetching trending tokens:', error);
    }

    return results;
  }

  /**
   * Get token price
   */
  async getTokenPrice(address: string, chain: string): Promise<number | null> {
    try {
      switch (chain.toLowerCase()) {
        case 'eth':
        case 'ethereum':
        case 'polygon':
        case 'bsc':
        case 'arbitrum':
          return await moralisService.getTokenPrice(address, chain);

        case 'solana':
          return await heliusService.getTokenPrice(address);

        case 'bitcoin':
          const bitcoinPrice = await BitcoinService.getPrice();
          return bitcoinPrice?.price ?? null;

        default:
          return null;
      }
    } catch (error) {
      console.error('Error fetching token price:', error);
      return null;
    }
  }

  /**
   * Get supported chains
   */
  getSupportedChains(): string[] {
    return ['ethereum', 'polygon', 'bsc', 'arbitrum', 'solana', 'bitcoin', 'tron'];
  }

  /**
   * Get chain configuration
   */
  getChainConfig(chain: string) {
    const chainMap: Record<string, any> = {
      'ethereum': CHAIN_CONFIG.ETHEREUM,
      'eth': CHAIN_CONFIG.ETHEREUM,
      'polygon': CHAIN_CONFIG.POLYGON,
      'bsc': CHAIN_CONFIG.BSC,
      'arbitrum': CHAIN_CONFIG.ARBITRUM,
      'solana': CHAIN_CONFIG.SOLANA,
      'bitcoin': CHAIN_CONFIG.BITCOIN,
      'btc': CHAIN_CONFIG.BITCOIN,
      'tron': CHAIN_CONFIG.TRON,
    };

    return chainMap[chain.toLowerCase()] || null;
  }
}

export const tokenService = TokenService.getInstance();
