'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { CryptoService } from '@/services/crypto.service';
import { useWalletStore } from '@/store/walletStore';
import { BiometricAuth } from '@/components/BiometricAuth';
import { biometricService } from '@/services/biometric.service';

export default function UnlockPage() {
  const router = useRouter();
  const { addAccount, selectAccount } = useWalletStore();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'biometric' | 'password'>('biometric');
  const [biometricEnrolled, setBiometricEnrolled] = useState(false);

  useEffect(() => {
    const vault = localStorage.getItem('vordium_vault');
    const unlocked = localStorage.getItem('vordium_unlocked') === 'true';
    
    if (!vault) {
      router.replace('/');
    } else if (unlocked) {
      router.replace('/dashboard');
    } else {
      // Check if biometric is enrolled
      checkBiometricStatus();
    }
  }, [router]);

  const checkBiometricStatus = async () => {
    try {
      const enrolled = await biometricService.isBiometricEnrolled();
      setBiometricEnrolled(enrolled);
      if (!enrolled) {
        setAuthMethod('password');
      }
    } catch (err) {
      console.error('Failed to check biometric status:', err);
      setAuthMethod('password');
    }
  };

  const handleBiometricSuccess = async () => {
    // For biometric auth, we need to get the password from secure storage
    // In a real implementation, this would be stored securely
    const storedPassword = localStorage.getItem('vordium_password');
    if (storedPassword) {
      setPassword(storedPassword);
      await handleUnlock();
    } else {
      setError('Password not found. Please use password authentication.');
      setAuthMethod('password');
    }
  };

  const handleBiometricFallback = () => {
    setAuthMethod('password');
  };

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
      router.replace('/dashboard');
    } catch (e) {
      setError('Incorrect password');
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="w-20 h-20 mx-auto bg-gray-600 rounded-2xl flex items-center justify-center text-4xl mb-4">
            <span className="text-white">🔒</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-gray-400 mt-1">Unlock your wallet to continue</p>
        </div>

        {/* Authentication Method Toggle */}
        {biometricEnrolled && (
          <div className="flex bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setAuthMethod('biometric')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                authMethod === 'biometric'
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Biometric
            </button>
            <button
              onClick={() => setAuthMethod('password')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                authMethod === 'password'
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Password
            </button>
          </div>
        )}

        {/* Biometric Authentication */}
        {authMethod === 'biometric' && biometricEnrolled ? (
          <BiometricAuth
            onSuccess={handleBiometricSuccess}
            onFallback={handleBiometricFallback}
          />
        ) : (
          <>
            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
                  placeholder="Enter your password"
                  className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {error && <p className="text-sm text-gray-400">{error}</p>}
            </div>

            {/* Unlock Button */}
            <button
              onClick={handleUnlock}
              disabled={loading}
              className="w-full h-14 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 text-white rounded-xl font-semibold transition transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? 'Unlocking...' : 'Unlock Wallet'}
            </button>
          </>
        )}

        {/* Reset Warning */}
        <div className="text-center">
          <p className="text-xs text-gray-400">
            Forgot password? You&apos;ll need your recovery phrase to restore your wallet.
          </p>
        </div>
      </div>
    </main>
  );
}

