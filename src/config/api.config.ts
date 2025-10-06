/**
 * API Configuration
 * Environment variables for external API services
 */

export const API_CONFIG = {
  // Moralis API - For token data, logos, and live prices
  MORALIS: {
    API_KEY: process.env.NEXT_PUBLIC_MORALIS_API_KEY || process.env.MORALIS_API_KEY || '',
    API_URL: process.env.NEXT_PUBLIC_MORALIS_API_URL || process.env.MORALIS_API_URL || 'https://deep-index.moralis.io/api/v2',
    ENABLED: !!(process.env.NEXT_PUBLIC_MORALIS_API_KEY || process.env.MORALIS_API_KEY),
  },
  
  // Helius API - For Solana blockchain data
  HELIUS: {
    API_KEY: process.env.NEXT_PUBLIC_HELIUS_API_KEY || process.env.HELIUS_API_KEY || '',
    API_URL: process.env.NEXT_PUBLIC_HELIUS_API_URL || process.env.HELIUS_API_URL || 'https://api.helius.xyz/v0',
    ENABLED: !!(process.env.NEXT_PUBLIC_HELIUS_API_KEY || process.env.HELIUS_API_KEY),
  },
  
  // CoinGecko API - For additional token data and prices
  COINGECKO: {
    API_KEY: process.env.NEXT_PUBLIC_COINGECKO_API_KEY || process.env.COINGECKO_API_KEY || '',
    API_URL: process.env.NEXT_PUBLIC_COINGECKO_API_URL || process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3',
    ENABLED: !!(process.env.NEXT_PUBLIC_COINGECKO_API_KEY || process.env.COINGECKO_API_KEY),
  },
  
  // BlockCypher API - For Bitcoin blockchain data
  BLOCKCYPHER: {
    API_KEY: process.env.NEXT_PUBLIC_BLOCKCYPHER_API_KEY || process.env.BLOCKCYPHER_API_KEY || '',
    API_URL: process.env.NEXT_PUBLIC_BITCOIN_API || process.env.BITCOIN_API || 'https://api.blockcypher.com/v1/btc/main',
    ENABLED: !!(process.env.NEXT_PUBLIC_BLOCKCYPHER_API_KEY || process.env.BLOCKCYPHER_API_KEY),
  },
  
  // Blockstream API - For Bitcoin blockchain data (backup)
  BLOCKSTREAM: {
    API_KEY: process.env.NEXT_PUBLIC_BLOCKSTREAM_API_KEY || process.env.BLOCKSTREAM_API_KEY || '',
    API_URL: process.env.NEXT_PUBLIC_BITCOIN_RPC || process.env.BITCOIN_RPC || 'https://blockstream.info/api',
    ENABLED: !!(process.env.NEXT_PUBLIC_BLOCKSTREAM_API_KEY || process.env.BLOCKSTREAM_API_KEY),
  },
  
  // WalletConnect Configuration
  WALLETCONNECT: {
    PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || process.env.WALLETCONNECT_PROJECT_ID || '',
  },
  
  // App Configuration
  APP: {
    NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Vordium Wallet',
    URL: process.env.NEXT_PUBLIC_APP_URL || 'https://vordium-wallet.vercel.app',
  },
};

// Debug API configuration
if (typeof window !== 'undefined') {
  console.log('=== API Configuration Debug ===');
  console.log('Moralis API Key:', API_CONFIG.MORALIS.API_KEY ? `${API_CONFIG.MORALIS.API_KEY.substring(0, 8)}...` : 'NOT SET');
  console.log('Moralis Enabled:', API_CONFIG.MORALIS.ENABLED);
  console.log('Helius API Key:', API_CONFIG.HELIUS.API_KEY ? `${API_CONFIG.HELIUS.API_KEY.substring(0, 8)}...` : 'NOT SET');
  console.log('Helius Enabled:', API_CONFIG.HELIUS.ENABLED);
  console.log('CoinGecko API Key:', API_CONFIG.COINGECKO.API_KEY ? `${API_CONFIG.COINGECKO.API_KEY.substring(0, 8)}...` : 'NOT SET');
  console.log('CoinGecko Enabled:', API_CONFIG.COINGECKO.ENABLED);
  console.log('BlockCypher API Key:', API_CONFIG.BLOCKCYPHER.API_KEY ? `${API_CONFIG.BLOCKCYPHER.API_KEY.substring(0, 8)}...` : 'NOT SET');
  console.log('BlockCypher Enabled:', API_CONFIG.BLOCKCYPHER.ENABLED);
  console.log('Blockstream API Key:', API_CONFIG.BLOCKSTREAM.API_KEY ? `${API_CONFIG.BLOCKSTREAM.API_KEY.substring(0, 8)}...` : 'NOT SET');
  console.log('Blockstream Enabled:', API_CONFIG.BLOCKSTREAM.ENABLED);
  console.log('================================');
}

// Chain configurations
export const CHAIN_CONFIG = {
  ETHEREUM: {
    id: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrl: process.env.NEXT_PUBLIC_ETHEREUM_RPC || 'https://eth-mainnet.g.alchemy.com/v2/demo',
    explorerUrl: 'https://etherscan.io',
    logoUrl: 'https://via.placeholder.com/64/6B7280/FFFFFF?text=ETH',
  },
  POLYGON: {
    id: 137,
    name: 'Polygon',
    symbol: 'MATIC',
    rpcUrl: process.env.NEXT_PUBLIC_POLYGON_RPC || 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    logoUrl: 'https://via.placeholder.com/64/6B7280/FFFFFF?text=MATIC',
  },
  BSC: {
    id: 56,
    name: 'BNB Smart Chain',
    symbol: 'BNB',
    rpcUrl: process.env.NEXT_PUBLIC_BSC_RPC || 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    logoUrl: 'https://via.placeholder.com/64/6B7280/FFFFFF?text=BNB',
  },
  ARBITRUM: {
    id: 42161,
    name: 'Arbitrum One',
    symbol: 'ETH',
    rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_RPC || 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    logoUrl: 'https://via.placeholder.com/64/6B7280/FFFFFF?text=ARB',
  },
  SOLANA: {
    id: 101,
    name: 'Solana',
    symbol: 'SOL',
    rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.mainnet-beta.solana.com',
    explorerUrl: 'https://explorer.solana.com',
    logoUrl: 'https://via.placeholder.com/64/6B7280/FFFFFF?text=SOL',
  },
  BITCOIN: {
    id: 0,
    name: 'Bitcoin',
    symbol: 'BTC',
    rpcUrl: process.env.NEXT_PUBLIC_BITCOIN_RPC || 'https://blockstream.info/api',
    explorerUrl: 'https://blockstream.info',
    logoUrl: 'https://via.placeholder.com/64/6B7280/FFFFFF?text=BTC',
  },
  TRON: {
    id: 195,
    name: 'TRON',
    symbol: 'TRX',
    rpcUrl: process.env.NEXT_PUBLIC_TRON_RPC || 'https://api.trongrid.io',
    explorerUrl: 'https://tronscan.org',
    logoUrl: 'https://via.placeholder.com/64/6B7280/FFFFFF?text=TRX',
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
