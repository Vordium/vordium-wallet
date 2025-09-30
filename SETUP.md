# Vordium Wallet - Complete Setup Guide

## 📥 Download Complete Source Code

All the complete source code artifacts are available in the Claude conversation. You need to download and add these files:

### Core Services (src/services/)
1. **crypto.service.ts** - Full BIP39/BIP44 implementation with encryption
2. **evm.service.ts** - Complete EVM transaction service with EIP-1559
3. **tron.service.ts** - Full TRON transaction service
4. **walletconnect.service.ts** - WalletConnect v2 integration
5. **balance.service.ts** - Balance polling and transaction monitoring

### State Management (src/store/)
6. **walletStore.ts** - Complete Zustand store with all wallet logic

### Utilities (src/utils/)
7. **safety.utils.ts** - Comprehensive validation and safety checks

### React Native Screens (src/screens/)
8. **CreateWalletScreen.tsx** - Wallet creation UI
9. **AccountDetailScreen.tsx** - Account dashboard
10. **SendScreen.tsx** - Send transaction UI
11. **SettingsScreen.tsx** - Settings management
12. **AddTokenScreen.tsx** - Token management
13. **TransactionDetailScreen.tsx** - Transaction details
14. **WalletConnectScreen.tsx** - WalletConnect UI

### Next.js Components (src/components/)
15. **CreateWallet.tsx** - Web wallet creation
16. **WalletDashboard.tsx** - Web dashboard
17. **AccountCard.tsx** - Account display component

## 🚀 Quick Setup

### 1. Clone and Install

```bash
git clone https://github.com/Vordium/vordium-wallet.git
cd vordium-wallet
npm install
```

### 2. Add Source Files

Create the directory structure:
```bash
mkdir -p src/services src/store src/utils src/screens src/components
```

Then copy all the TypeScript files from the Claude artifacts to their respective directories.

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your API keys:
- **Infura**: https://infura.io (for EVM RPCs)
- **TronGrid**: https://www.trongrid.io (for TRON API)
- **WalletConnect**: https://cloud.walletconnect.com (for dApp connections)

### 4. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## 📦 Deploy to Vercel

### Option 1: Vercel Dashboard
1. Go to https://vercel.com/new
2. Import `Vordium/vordium-wallet` repository
3. Add environment variables
4. Deploy!

### Option 2: Vercel CLI
```bash
npm i -g vercel
vercel login
vercel
```

## 🔑 Required API Keys

### Infura (EVM Networks)
1. Sign up at https://infura.io
2. Create new project
3. Copy API key
4. Add to `.env.local` as `NEXT_PUBLIC_ETHEREUM_RPC`

### TronGrid (TRON Network)
1. Sign up at https://www.trongrid.io
2. Get API key
3. Add to `.env.local` as `NEXT_PUBLIC_TRONGRID_API_KEY`

### WalletConnect (dApp Integration)
1. Sign up at https://cloud.walletconnect.com
2. Create new project
3. Copy Project ID
4. Add to `.env.local` as `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

## 📁 Complete File Structure

```
vordium-wallet/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── src/
│   ├── services/
│   │   ├── crypto.service.ts
│   │   ├── evm.service.ts
│   │   ├── tron.service.ts
│   │   ├── walletconnect.service.ts
│   │   └── balance.service.ts
│   ├── store/
│   │   └── walletStore.ts
│   ├── utils/
│   │   └── safety.utils.ts
│   ├── screens/
│   │   ├── CreateWalletScreen.tsx
│   │   ├── AccountDetailScreen.tsx
│   │   ├── SendScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   ├── AddTokenScreen.tsx
│   │   ├── TransactionDetailScreen.tsx
│   │   └── WalletConnectScreen.tsx
│   └── components/
│       ├── CreateWallet.tsx
│       ├── WalletDashboard.tsx
│       └── AccountCard.tsx
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
├── vercel.json
├── .env.example
├── .gitignore
├── LICENSE
└── README.md
```

## ✅ Verification

After adding all files, verify the setup:

```bash
# Check for TypeScript errors
npm run lint

# Build the project
npm run build

# Run development server
npm run dev
```

## 🐛 Troubleshooting

### "Cannot find module"
- Ensure all source files are in correct directories
- Run `npm install` again

### "Environment variables not defined"
- Check `.env.local` exists
- Verify all required variables are set
- Restart dev server

### "Type errors"
- Ensure TypeScript version is 5.3+
- Check tsconfig.json paths are correct

## 📞 Need Help?

Open an issue at: https://github.com/Vordium/vordium-wallet/issues

---

**Made with ❤️ for the decentralized web**
