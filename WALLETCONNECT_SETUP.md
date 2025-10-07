# 🔗 WalletConnect Integration Guide

## Overview

WalletConnect is a protocol that allows your wallet to connect to decentralized applications (dApps) via QR code scanning or deep linking. This guide explains how WalletConnect works, why your wallet might not be detected, and how to properly integrate it.

---

## 🎯 How WalletConnect Works

### Connection Flow:
```
1. dApp displays WalletConnect QR code
2. User scans QR code with wallet app
3. Wallet establishes encrypted connection
4. User approves connection in wallet
5. dApp receives wallet address and can send transaction requests
```

### Why Your Wallet Isn't Detected:

Your Vordium Wallet is currently a **web application**, not a **mobile app** or **browser extension**. WalletConnect is primarily designed for:

1. **Mobile Apps** (iOS/Android)
   - Have native QR code scanning
   - Can register deep link schemes (`vordium://`)
   - Listed in WalletConnect's wallet registry

2. **Browser Extensions** (MetaMask-style)
   - Inject `window.ethereum` provider
   - Detected automatically by dApps
   - Can intercept Web3 calls

3. **Desktop Apps**
   - Can use WalletConnect URI protocol
   - Listed in WalletConnect registry

---

## 🚀 Solutions for Your Web Wallet

### Option 1: Wallet Browser (Current Implementation) ✅
**Status**: Already implemented in `/app/browser/page.tsx`

**How it works**:
- Users browse dApps directly in your wallet
- Your wallet injects Web3 provider into iframe
- Wallet connection is automatic (no QR code needed)

**Pros**:
- Best UX for web wallet
- No QR code scanning needed
- Direct integration

**Cons**:
- Only works for websites opened in wallet browser
- Won't work with external dApps

### Option 2: WalletConnect Web Integration ⚠️
**Status**: Needs enhancement

**What you need**:
```typescript
// Install WalletConnect
npm install @walletconnect/web3-provider

// Initialize in your wallet
import WalletConnectProvider from "@walletconnect/web3-provider";

const provider = new WalletConnectProvider({
  rpc: {
    1: process.env.NEXT_PUBLIC_ETHEREUM_RPC,
    56: process.env.NEXT_PUBLIC_BSC_RPC,
    137: process.env.NEXT_PUBLIC_POLYGON_RPC,
  },
  qrcode: true, // Show QR code modal
});

// Enable connection
await provider.enable();
```

**Implementation required**:
1. Add WalletConnect listener in your wallet
2. Handle connection requests
3. Sign transactions when requested
4. Manage sessions

### Option 3: Browser Extension (Future) 🔮
**Status**: Future enhancement

Convert your web wallet to a browser extension to be detected like MetaMask.

**Required steps**:
1. Create `manifest.json` for Chrome/Firefox
2. Inject content script into web pages
3. Implement `window.ethereum` provider
4. Submit to Chrome Web Store

---

## 🛠️ Current Implementation Status

### ✅ What Works:
- **In-app browser**: Users can browse dApps inside wallet
- **Manual connections**: Can connect via browser
- **Multi-chain support**: Ethereum, BSC, Polygon, Arbitrum, TRON, Solana, Bitcoin

### ⚠️ What Needs Work:
- **WalletConnect QR scanning**: Not fully integrated
- **Deep linking**: No mobile app for deep links
- **Provider injection**: Limited to iframe context
- **External dApp detection**: Can't connect to dApps opened outside wallet

---

## 📱 Why Asterdex.com Might Not Load

### Common Issues:

1. **X-Frame-Options / CSP Headers**
   - Many sites block iframe embedding for security
   - Asterdex.com might have `X-Frame-Options: DENY`
   
   **Solution**: 
   - Open in new tab instead of iframe
   - Use proxy server to strip headers (not recommended)
   - Contact Asterdex to whitelist your domain

2. **HTTPS/SSL Issues**
   - Mixed content blocking
   - Invalid SSL certificates
   
   **Solution**:
   - Ensure your wallet uses HTTPS
   - Check browser console for security errors

3. **CORS Restrictions**
   - Cross-origin resource sharing blocks
   
   **Solution**:
   - Use proper CORS headers
   - Open in external browser as fallback

---

## 🎯 Recommended Next Steps

### For Production Launch:

1. **Enhance In-App Browser** ✅ (Priority)
   ```typescript
   // Add Web3 provider injection
   // Handle connection requests
   // Sign transactions within wallet
   ```

2. **Add WalletConnect Support** (High Priority)
   ```typescript
   // Implement WalletConnect client
   // Handle pairing requests
   // Manage sessions
   ```

3. **Create Browser Extension** (Future)
   ```typescript
   // Convert to Chrome/Firefox extension
   // Register with WalletConnect registry
   // Enable external dApp detection
   ```

4. **Mobile App** (Long-term)
   ```typescript
   // React Native mobile app
   // Native QR code scanner
   // Deep link support
   ```

---

## 📄 Configuration Files Needed

### For WalletConnect Integration:

Create `src/services/walletconnect.service.ts` (enhanced):
```typescript
import { Core } from "@walletconnect/core";
import { Web3Wallet } from "@walletconnect/web3wallet";

export class WalletConnectService {
  private static wallet: any;

  static async init() {
    const core = new Core({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    });

    this.wallet = await Web3Wallet.init({
      core,
      metadata: {
        name: "Vordium Wallet",
        description: "Multi-chain cryptocurrency wallet",
        url: "https://vordium-wallet.vercel.app",
        icons: ["https://vordium-wallet.vercel.app/icon.png"],
      },
    });

    // Listen for session proposals
    this.wallet.on("session_proposal", async (proposal: any) => {
      // Show approval modal to user
      console.log("Session proposal:", proposal);
    });

    // Listen for session requests
    this.wallet.on("session_request", async (request: any) => {
      // Handle transaction signing
      console.log("Session request:", request);
    });
  }

  static async pair(uri: string) {
    await this.wallet.core.pairing.pair({ uri });
  }
}
```

### Environment Variables:
```env
# WalletConnect Project ID (get from https://cloud.walletconnect.com)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

---

## 🔧 Quick Fixes for Current Issues

### Fix 1: Handle iframe Blocking
```typescript
// In browser/page.tsx
const navigateToUrl = (url: string) => {
  // Try iframe first
  setCurrentUrl(url);
  
  // If fails, open in new tab
  setTimeout(() => {
    const iframe = document.querySelector('iframe');
    if (iframe && !iframe.contentWindow) {
      window.open(url, '_blank');
    }
  }, 2000);
};
```

### Fix 2: Add Fallback Message
```typescript
{currentUrl && (
  <>
    <iframe src={currentUrl} />
    <div className="text-xs text-gray-400 p-2">
      If the site doesn't load, it may block embedding.
      <button onClick={() => window.open(currentUrl, '_blank')}>
        Open in new tab
      </button>
    </div>
  </>
)}
```

---

## 📊 Summary

### Current Status:
✅ Multi-chain wallet functionality  
✅ In-app browser  
✅ Manual dApp connections  
⚠️ WalletConnect QR scanning (partial)  
❌ External dApp auto-detection  
❌ Browser extension  
❌ Mobile app  

### To Go Live:
1. ✅ Fix token prices (DONE)
2. ✅ Fix browser positioning (DONE)
3. ⚠️ Handle iframe blocking (needs error handling)
4. ⚠️ Enhance WalletConnect integration
5. 📱 Document limitations for users

---

## 💡 User Instructions

### How to Connect to dApps:

**Method 1: Use In-App Browser** (Recommended)
1. Click "Browser" in Vordium Wallet
2. Navigate to dApp (e.g., asterdex.com)
3. Connect wallet button should work automatically

**Method 2: Manual Connection**
1. Open dApp in regular browser
2. Look for "WalletConnect" option
3. Scan QR code with mobile wallet (if available)

**Method 3: Browser Extension** (Future)
1. Install Vordium browser extension
2. Visit any dApp
3. Click "Connect Wallet"
4. Select Vordium

---

## 🆘 Support

For issues or questions:
- Check browser console for errors
- Verify all environment variables are set
- Ensure HTTPS is enabled
- Test with different dApps

**Common Error**: "Wallet not detected"  
**Solution**: Use in-app browser or wait for extension release

