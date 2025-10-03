/**
 * API Configuration
 * Environment variables for external API services
 */

export const API_CONFIG = {
  // Moralis API - For token data, logos, and live prices
  MORALIS: {
    API_KEY: process.env.MORALIS_API_KEY || '',
    API_URL: process.env.MORALIS_API_URL || 'https://deep-index.moralis.io/api/v2',
    ENABLED: !!process.env.MORALIS_API_KEY,
  },
  
  // Helius API - For Solana blockchain data
  HELIUS: {
    API_KEY: process.env.HELIUS_API_KEY || '',
    API_URL: process.env.HELIUS_API_URL || 'https://api.helius.xyz/v0',
    ENABLED: !!process.env.HELIUS_API_KEY,
  },
  
  // CoinGecko API - For additional token data and prices
  COINGECKO: {
    API_KEY: process.env.COINGECKO_API_KEY || '',
    API_URL: process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3',
    ENABLED: !!process.env.COINGECKO_API_KEY,
  },
  
  // WalletConnect Configuration
  WALLETCONNECT: {
    PROJECT_ID: process.env.WALLETCONNECT_PROJECT_ID || '',
  },
  
  // App Configuration
  APP: {
    NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Vordium Wallet',
    URL: process.env.NEXT_PUBLIC_APP_URL || 'https://vordium-wallet.vercel.app',
  },
};

// Chain configurations
export const CHAIN_CONFIG = {
  ETHEREUM: {
    id: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/demo',
    explorerUrl: 'https://etherscan.io',
    logoUrl: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
  },
  POLYGON: {
    id: 137,
    name: 'Polygon',
    symbol: 'MATIC',
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    logoUrl: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png',
  },
  BSC: {
    id: 56,
    name: 'BNB Smart Chain',
    symbol: 'BNB',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    logoUrl: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
  },
  ARBITRUM: {
    id: 42161,
    name: 'Arbitrum One',
    symbol: 'ETH',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    logoUrl: 'https://assets.coingecko.com/coins/images/16547/large/photo_2023-03-29_21.47.00.jpeg',
  },
  SOLANA: {
    id: 101,
    name: 'Solana',
    symbol: 'SOL',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    explorerUrl: 'https://explorer.solana.com',
    logoUrl: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
  },
  BITCOIN: {
    id: 0,
    name: 'Bitcoin',
    symbol: 'BTC',
    rpcUrl: '', // Bitcoin doesn't use RPC in the same way
    explorerUrl: 'https://blockstream.info',
    logoUrl: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
  },
  TRON: {
    id: 195,
    name: 'TRON',
    symbol: 'TRX',
    rpcUrl: 'https://api.trongrid.io',
    explorerUrl: 'https://tronscan.org',
    logoUrl: 'https://assets.coingecko.com/coins/images/1094/large/tron-logo.png',
  },
};

// Supported chains
export const SUPPORTED_CHAINS = [
  CHAIN_CONFIG.ETHEREUM,
  CHAIN_CONFIG.POLYGON,
  CHAIN_CONFIG.BSC,
  CHAIN_CONFIG.ARBITRUM,
  CHAIN_CONFIG.SOLANA,
  CHAIN_CONFIG.BITCOIN,
  CHAIN_CONFIG.TRON,
];
