# 🚀 Vordium Wallet - Quickstart Guide

## ⚡ Get Started in 3 Steps

### Step 1: Get the Complete Code

📌 **READ THIS FIRST**: [`DOWNLOAD_ARTIFACTS.md`](./DOWNLOAD_ARTIFACTS.md)

The repository contains configuration files, but you need to download the complete TypeScript source code from the Claude conversation artifacts.

### Step 2: Install & Configure

```bash
# Clone the repo
git clone https://github.com/Vordium/vordium-wallet.git
cd vordium-wallet

# Install dependencies  
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your API keys
```

### Step 3: Run!

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

## 🔑 Required API Keys (All Free Tier)

1. **Infura** → https://infura.io (EVM networks)
2. **TronGrid** → https://www.trongrid.io (TRON network)  
3. **WalletConnect** → https://cloud.walletconnect.com (dApp connections)

## 📦 Deploy to Vercel

**One-click deploy:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Vordium/vordium-wallet)

**Or via CLI:**

```bash
npm i -g vercel
vercel
```

## 📱 Mobile App (React Native)

```bash
# Install Expo CLI
npm install -g expo-cli

# Run on mobile
npm run mobile

# Build for stores
expo build:ios
expo build:android
```

## 📁 Project Structure

```
vordium-wallet/
├── src/
│   ├── services/     # Crypto, EVM, TRON, WalletConnect
│   ├── store/        # Zustand state management
│   ├── utils/        # Safety & validation
│   ├── screens/      # React Native UI
│   └── components/   # Next.js components
├── app/              # Next.js app router
├── public/           # Static assets
└── package.json      # Dependencies
```

## ✅ Verification

```bash
# Lint
npm run lint

# Type check
npm run build

# Test locally
npm run dev
```

Visit http://localhost:3000 → You should see the wallet! 🎉

## 💡 Features

✅ BIP39/BIP44 key derivation  
✅ AES-GCM + Argon2id encryption  
✅ EVM (Ethereum, Polygon, BSC, Arbitrum)  
✅ TRON (TRX, TRC-20)  
✅ WalletConnect v2  
✅ EIP-1559 gas optimization  
✅ PIN & Biometric auth  
✅ QR code scanning  
✅ Transaction history  
✅ Token management  
✅ Safety checks & validation  

## 🐛 Troubleshooting

**Build errors?**
- Ensure you downloaded ALL artifacts (see `DOWNLOAD_ARTIFACTS.md`)
- Run `rm -rf node_modules && npm install`
- Check Node.js version (need 18+)

**Missing modules?**
- Verify all files in `src/services/`, `src/store/`, `src/utils/`
- Check tsconfig.json paths

**Environment issues?**
- Ensure `.env.local` exists and has all variables
- Restart dev server after env changes

## 📚 Documentation

- **[DOWNLOAD_ARTIFACTS.md](./DOWNLOAD_ARTIFACTS.md)** - Get complete source code
- **[SETUP.md](./SETUP.md)** - Detailed setup guide
- **[README.md](./README.md)** - Project overview
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - How to contribute

## 🎓 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Native](https://reactnative.dev/docs/getting-started)
- [Expo](https://docs.expo.dev/)
- [ethers.js](https://docs.ethers.org/)
- [TronWeb](https://developers.tron.network/docs)
- [WalletConnect](https://docs.walletconnect.com/)

## 🚀 Ready to Ship

Once everything builds:

1. Push to GitHub
2. Connect Vercel
3. Add environment variables
4. Deploy! 🎉

Your wallet will be live at `yourproject.vercel.app`

---

**Built with ❤️ for Web3**
