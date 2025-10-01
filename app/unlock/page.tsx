'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { CryptoService } from '@/services/crypto.service';
import { useWalletStore } from '@/store/walletStore';

export default function UnlockPage() {
  const router = useRouter();
  const { addAccount, selectAccount } = useWalletStore();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleUnlock() {
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const vaultJson = localStorage.getItem('vordium_vault');
      if (!vaultJson) {
        throw new Error('No wallet found');
      }

      const vault = JSON.parse(vaultJson);
      const mnemonic = await CryptoService.decrypt(vault, password);

      // Derive accounts
      const seed = await CryptoService.mnemonicToSeed(mnemonic);
      const evm = await CryptoService.deriveAccount(seed, 'EVM', 0);
      const tron = await CryptoService.deriveAccount(seed, 'TRON', 0);

      // Store in Zustand
      addAccount({ id: 'evm-0', name: 'Ethereum Account 1', address: evm.address, chain: 'EVM' });
      addAccount({ id: 'tron-0', name: 'TRON Account 1', address: tron.address, chain: 'TRON' });
      selectAccount('evm-0');

      // Mark as unlocked
      localStorage.setItem('vordium_unlocked', 'true');

      // Navigate to dashboard
      router.push('/');
    } catch (e) {
      setError('Incorrect password');
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-500 to-indigo-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-4xl mb-4">
            💎
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-1">Unlock your wallet to continue</p>
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
              placeholder="Enter your password"
              className="w-full border border-gray-300 rounded-lg p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        {/* Unlock Button */}
        <button
          onClick={handleUnlock}
          disabled={loading}
          className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white rounded-xl font-semibold transition transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {loading ? 'Unlocking...' : 'Unlock Wallet'}
        </button>

        {/* Reset Warning */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Forgot password? You&apos;ll need your recovery phrase to restore your wallet.
          </p>
        </div>
      </div>
    </main>
  );
}

