'use client';

import { useState } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useState(() => {
    setMounted(true);
  });

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-2">🌟 Vordium Wallet</h1>
        <p className="text-gray-600 text-center mb-8">
          Non-custodial wallet for EVM & TRON
        </p>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="font-semibold text-blue-900 mb-2">🔐 Security First</h2>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ BIP39/BIP44 key derivation</li>
              <li>✓ AES-GCM + Argon2id encryption</li>
              <li>✓ Your keys, your coins</li>
            </ul>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h2 className="font-semibold text-purple-900 mb-2">⛓️ Multi-Chain</h2>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>✓ Ethereum, Polygon, BSC, Arbitrum</li>
              <li>✓ TRON Network</li>
              <li>✓ ERC-20 & TRC-20 tokens</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h2 className="font-semibold text-green-900 mb-2">🔗 WalletConnect v2</h2>
            <p className="text-sm text-green-800">
              Connect to your favorite dApps securely
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-4">
            Implementation in progress...
          </p>
          <a
            href="https://github.com/Vordium/vordium-wallet"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            View on GitHub →
          </a>
        </div>
      </div>
    </main>
  );
}
