# Vercel Environment Variables Setup Guide

## 🔧 Required Environment Variables

Add these environment variables in your Vercel dashboard:

> **⚠️ Important**: For client-side components (like token search), environment variables must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser. The configuration supports both prefixed and non-prefixed versions for maximum compatibility.

### 1. **Moralis API** (For EVM token data, logos, and prices)
```
NEXT_PUBLIC_MORALIS_API_KEY=your_moralis_api_key_here
NEXT_PUBLIC_MORALIS_API_URL=https://deep-index.moralis.io/api/v2
```

**How to get Moralis API Key:**
1. Go to [Moralis.io](https://moralis.io)
2. Sign up for a free account
3. Go to "Web3 APIs" → "API Keys"
4. Create a new API key
5. Copy the key and add it to Vercel

### 2. **Helius API** (For Solana blockchain data)
```
NEXT_PUBLIC_HELIUS_API_KEY=your_helius_api_key_here
NEXT_PUBLIC_HELIUS_API_URL=https://api.helius.xyz/v0
```

**How to get Helius API Key:**
1. Go to [Helius.xyz](https://helius.xyz)
2. Sign up for a free account
3. Go to "Dashboard" → "API Keys"
4. Create a new API key
5. Copy the key and add it to Vercel

### 3. **CoinGecko API** (For additional token data and prices)
```
NEXT_PUBLIC_COINGECKO_API_KEY=your_coingecko_api_key_here
NEXT_PUBLIC_COINGECKO_API_URL=https://api.coingecko.com/api/v3
```

**How to get CoinGecko API Key:**
1. Go to [CoinGecko API](https://www.coingecko.com/en/api)
2. Sign up for a free account
3. Go to "API Keys" section
4. Generate a new API key
5. Copy the key and add it to Vercel

### 4. **WalletConnect** (For DApp connections)
```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
```

**How to get WalletConnect Project ID:**
1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Sign up for a free account
3. Create a new project
4. Copy the Project ID and add it to Vercel

### 5. **App Configuration** (Optional but recommended)
```
NEXT_PUBLIC_APP_NAME=Vordium Wallet
NEXT_PUBLIC_APP_URL=https://vordium-wallet.vercel.app
```

## 📋 Step-by-Step Vercel Setup

### Step 1: Access Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Sign in to your account
3. Select your `vordium-wallet` project

### Step 2: Add Environment Variables
1. Click on **"Settings"** tab
2. Click on **"Environment Variables"** in the left sidebar
3. Click **"Add New"** for each variable above
4. Enter the **Name** and **Value** for each variable
5. Make sure to select **"Production"**, **"Preview"**, and **"Development"** environments
6. Click **"Save"** after adding each variable

### Step 3: Redeploy
1. After adding all environment variables
2. Go to **"Deployments"** tab
3. Click **"Redeploy"** on the latest deployment
4. Wait for the deployment to complete

## 🔍 Verification

After deployment, you can verify the environment variables are working by:

1. **Check the dashboard** - Tokens should load with real data and logos
2. **Check token search** - Should find tokens from all chains
3. **Check send/receive** - Should show tokens with proper balances
4. **Check browser console** - No API key errors should appear

## 🚨 Important Notes

- **Free Tiers**: All APIs offer free tiers with generous limits
- **Rate Limits**: Be aware of API rate limits for production use
- **Security**: Never commit API keys to your repository
- **Backup**: Keep your API keys in a secure password manager

## 🆘 Troubleshooting

### If tokens don't load:
1. Check if environment variables are set correctly
2. Verify API keys are valid and active
3. Check Vercel deployment logs for errors
4. Ensure all environments (Production, Preview, Development) are selected

### If you get API errors:
1. Check your API key limits
2. Verify the API key has the correct permissions
3. Check if the API service is down
4. Review the API documentation for any changes

## 📞 Support

If you need help:
1. Check the API provider's documentation
2. Review Vercel's environment variables guide
3. Check the project's GitHub issues
4. Contact the development team

---

**Last Updated**: December 2024
**Version**: 1.0.0
