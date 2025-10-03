# Environment Setup Guide

This guide will help you set up the environment variables for the Vordium Wallet to enable all features and APIs.

## Required Environment Variables

### 1. Moralis API (Recommended for Token Data)
- **Purpose**: Token data, logos, live prices, and multi-chain support
- **Why Moralis**: Best for EVM chains, comprehensive token data, reliable APIs
- **Setup**:
  1. Go to [Moralis.io](https://moralis.io)
  2. Sign up for a free account
  3. Get your API key from the dashboard
  4. Add to Vercel environment variables

### 2. Helius API (For Solana)
- **Purpose**: Solana blockchain data, token information, and transactions
- **Why Helius**: Best Solana API provider with comprehensive data
- **Setup**:
  1. Go to [Helius.xyz](https://helius.xyz)
  2. Sign up for a free account
  3. Get your API key from the dashboard
  4. Add to Vercel environment variables

### 3. CoinGecko API (Optional)
- **Purpose**: Additional token data and price information
- **Why CoinGecko**: Reliable price data and token metadata
- **Setup**:
  1. Go to [CoinGecko API](https://www.coingecko.com/en/api)
  2. Sign up for a free account
  3. Get your API key
  4. Add to Vercel environment variables

### 4. WalletConnect Project ID
- **Purpose**: DApp connections and wallet integration
- **Setup**:
  1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com)
  2. Create a new project
  3. Get your Project ID
  4. Add to Vercel environment variables

## Vercel Environment Variables Setup

### Step 1: Access Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `vordium-wallet`

### Step 2: Add Environment Variables
1. Go to **Settings** → **Environment Variables**
2. Add the following variables:

```bash
# Moralis API
MORALIS_API_KEY=your_moralis_api_key_here
MORALIS_API_URL=https://deep-index.moralis.io/api/v2

# Helius API
HELIUS_API_KEY=your_helius_api_key_here
HELIUS_API_URL=https://api.helius.xyz/v0

# CoinGecko API (Optional)
COINGECKO_API_KEY=your_coingecko_api_key_here
COINGECKO_API_URL=https://api.coingecko.com/api/v3

# WalletConnect
WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here

# App Configuration
NEXT_PUBLIC_APP_NAME=Vordium Wallet
NEXT_PUBLIC_APP_URL=https://vordium-wallet.vercel.app
```

### Step 3: Redeploy
1. After adding all environment variables
2. Go to **Deployments** tab
3. Click **Redeploy** on the latest deployment
4. Wait for the deployment to complete

## API Service Comparison

### Moralis vs Thirdweb vs Others

**Moralis (Recommended)**:
- ✅ Best EVM chain support
- ✅ Comprehensive token data
- ✅ Reliable APIs
- ✅ Good documentation
- ✅ Free tier available
- ✅ Real-time data

**Thirdweb**:
- ✅ Good for Web3 development
- ✅ SDK integration
- ❌ Limited token data
- ❌ More focused on smart contracts

**CoinGecko**:
- ✅ Excellent price data
- ✅ Large token database
- ❌ Limited blockchain data
- ❌ Rate limits on free tier

## Features Enabled by APIs

### With Moralis API:
- ✅ Multi-chain token balances (Ethereum, Polygon, BSC, Arbitrum)
- ✅ Real-time token prices
- ✅ Token logos and metadata
- ✅ Transaction history
- ✅ Token search functionality

### With Helius API:
- ✅ Solana token balances
- ✅ Solana transaction history
- ✅ Solana token metadata
- ✅ Solana price data

### With CoinGecko API:
- ✅ Additional price data
- ✅ Market cap information
- ✅ 24h price changes
- ✅ Trending tokens

## Local Development

For local development, create a `.env.local` file in the root directory:

```bash
# Copy the environment variables from above
# Make sure to use your actual API keys
```

## Troubleshooting

### Common Issues:

1. **API Key Not Working**:
   - Check if the API key is correct
   - Verify the API key has the right permissions
   - Check if you've exceeded rate limits

2. **Environment Variables Not Loading**:
   - Make sure variables are added to Vercel
   - Redeploy the application
   - Check variable names are exact

3. **Token Data Not Loading**:
   - Verify API keys are valid
   - Check network requests in browser dev tools
   - Ensure APIs are enabled in the configuration

### Support:
- Check the console for error messages
- Verify API keys are working by testing endpoints
- Contact support if issues persist

## Cost Estimation

### Free Tiers:
- **Moralis**: 1M requests/month
- **Helius**: 100K requests/month
- **CoinGecko**: 10K requests/month
- **WalletConnect**: Free for basic usage

### Paid Tiers (if needed):
- **Moralis Pro**: $49/month for 10M requests
- **Helius Pro**: $99/month for 1M requests
- **CoinGecko Pro**: $129/month for 100K requests

## Next Steps

1. Set up all required API keys
2. Add environment variables to Vercel
3. Redeploy the application
4. Test the wallet functionality
5. Monitor API usage in respective dashboards

The wallet will work without APIs but with limited functionality. For full features, all APIs are recommended.
