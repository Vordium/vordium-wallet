# 🌟 Vordium Wallet

A secure, non-custodial cryptocurrency wallet supporting both **EVM chains** (Ethereum, Polygon, BSC, Arbitrum) and **TRON** network.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Vordium/vordium-wallet)

## ✨ Features

### 🔐 Security First
- **BIP39/BIP44** compliant key derivation
- **AES-GCM + Argon2id** vault encryption  
- **Secure storage** using Keychain (iOS) / Keystore (Android) / SecureStore (Web)
- **PIN & Biometric** authentication
- **No backend** - your keys never leave your device

### ⛓️ Multi-Chain Support
- **EVM Chains**: Ethereum, Polygon, BNB Chain, Arbitrum
- **TRON Network**: TRX and TRC-20 tokens
- **EIP-1559** gas optimization
- **Token support**: ERC-20, TRC-20

### 🔗 DApp Integration
- **WalletConnect v2** for dApp connections
- Transaction signing & message signing
- Session management
- Safety checks for contract interactions

### 🛡️ Safety Features
- Address validation & checksum verification
- Amount validation with decimal guards
- Token contract verification
- Transaction risk assessment
- Phishing pattern detection
- High-value transaction warnings

### 📱 Cross-Platform
- **Mobile**: React Native with Expo
- **Web**: Next.js PWA (Progressive Web App)
- Shared business logic & state management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI (for mobile)

### Installation

```bash
# Clone the repository
git clone https://github.com/Vordium/vordium-wallet.git
cd vordium-wallet

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys
```

### Development

**Web (Next.js):**
```bash
npm run dev
# Open http://localhost:3000
```

**Mobile (Expo):**
```bash
npm run mobile
# Scan QR code with Expo Go app
```

## 📦 Deployment

### Vercel (Web)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Vordium/vordium-wallet)

Or manually:
```bash
npm install -g vercel
vercel
```

## 🔧 Tech Stack

- **Frontend**: React, Next.js 14, React Native
- **State**: Zustand
- **Crypto**: ethers.js v6, TronWeb, bip39
- **Encryption**: AES-GCM, Argon2id
- **Storage**: SecureStore, AsyncStorage
- **Styling**: Tailwind CSS (web), StyleSheet (mobile)
- **WalletConnect**: WalletConnect v2

## 🔒 Security

This is a non-custodial wallet - **you control your keys**:

- Private keys never leave your device
- No backend servers storing credentials
- Open source for transparency

**⚠️ Important**: Always backup your recovery phrase and store it safely offline.

## 📄 License

MIT License

## ⚠️ Disclaimer

This software is provided "as is" without warranty. Use at your own risk. The developers are not responsible for any loss of funds.

---

**Made with ❤️ for the decentralized web**
