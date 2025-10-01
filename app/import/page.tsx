'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import * as bip39 from 'bip39';
import { CryptoService } from '@/services/crypto.service';
import { useWalletStore } from '@/store/walletStore';

export default function ImportPage() {
  const router = useRouter();
  const { addAccount, selectAccount } = useWalletStore();
  const [tab, setTab] = useState<'mnemonic' | 'pk'>('mnemonic');
  const [mnemonic, setMnemonic] = useState('');
  const [pk, setPk] = useState('');
  const [chain, setChain] = useState<'EVM' | 'TRON'>('EVM');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [walletName, setWalletName] = useState('Imported Wallet');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const validMnemonic = mnemonic.trim().length > 0 && bip39.validateMnemonic(mnemonic.trim());
  const passwordValid = password.length >= 8 && password === confirmPassword;
  const canImport = tab === 'mnemonic' ? validMnemonic && passwordValid : pk && passwordValid;

  const wordCount = mnemonic.trim().split(/\s+/).filter(Boolean).length;

  async function handleImport() {
    if (!canImport) return;
    
    setLoading(true);
    setError('');

    try {
      let mnemonicToUse = '';
      
      if (tab === 'mnemonic') {
        mnemonicToUse = mnemonic.trim();
      } else {
        // Import from private key - generate a temporary wallet
        alert('Private key import creates a single-key wallet. Feature coming soon.');
        setLoading(false);
        return;
      }

      // Encrypt and store vault
      const vault = await CryptoService.encrypt(mnemonicToUse, password);
      localStorage.setItem('vordium_vault', JSON.stringify(vault));
      localStorage.setItem('vordium_wallet_name', walletName);
      localStorage.setItem('vordium_created_at', Date.now().toString());
      localStorage.setItem('vordium_verified', 'true'); // Imported wallets are considered verified
      
      // Derive accounts
      const seed = await CryptoService.mnemonicToSeed(mnemonicToUse);
      const evm = await CryptoService.deriveAccount(seed, 'EVM', 0);
      const tron = await CryptoService.deriveAccount(seed, 'TRON', 0);
      
      // Store in Zustand
      addAccount({ id: 'evm-0', name: 'Ethereum Account 1', address: evm.address, chain: 'EVM' });
      addAccount({ id: 'tron-0', name: 'TRON Account 1', address: tron.address, chain: 'TRON' });
      selectAccount('evm-0');
      
      // Mark as unlocked
      localStorage.setItem('vordium_unlocked', 'true');
      
      // Navigate to dashboard
      router.push('/dashboard');
    } catch (e) {
      setError('Failed to import wallet: ' + (e as Error).message);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <button onClick={() => router.push('/welcome')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Import Wallet</h1>
            <p className="text-gray-600 mt-2">Restore your wallet using your recovery phrase</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setTab('mnemonic')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                tab === 'mnemonic' ? 'bg-blue-600 text-white' : 'border border-gray-300'
              }`}
            >
              Seed Phrase
            </button>
            <button
              onClick={() => setTab('pk')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                tab === 'pk' ? 'bg-blue-600 text-white' : 'border border-gray-300'
              }`}
            >
              Private Key
            </button>
          </div>

          {tab === 'mnemonic' ? (
            <>
              {/* Seed Phrase Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Recovery Phrase</label>
                <textarea
                  value={mnemonic}
                  onChange={(e) => setMnemonic(e.target.value)}
                  placeholder="Enter your 12 or 24 word recovery phrase"
                  className="w-full h-32 border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <div className="flex items-center justify-between text-sm">
                  <span className={validMnemonic ? 'text-emerald-600' : 'text-gray-500'}>
                    {validMnemonic ? '✓ Valid mnemonic' : `${wordCount}/12 or 24 words`}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Chain Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Chain</label>
                <select
                  value={chain}
                  onChange={(e) => setChain(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-lg p-3"
                >
                  <option value="EVM">EVM (Ethereum)</option>
                  <option value="TRON">TRON</option>
                </select>
              </div>

              {/* Private Key Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Private Key</label>
                <input
                  value={pk}
                  onChange={(e) => setPk(e.target.value)}
                  placeholder="Enter private key"
                  className="w-full border border-gray-300 rounded-lg p-4 font-mono"
                />
              </div>
            </>
          )}

          {/* Wallet Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Wallet Name (Optional)</label>
            <input
              type="text"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              placeholder="My Wallet"
              className="w-full border border-gray-300 rounded-lg p-4"
            />
          </div>

          {/* Password Setup */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700">Create a password to encrypt this wallet</p>
            
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full border border-gray-300 rounded-lg p-4 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-600">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full border border-gray-300 rounded-lg p-4"
              />
            </div>

            {password && (
              <div className="text-sm text-gray-600">
                {password.length >= 8 ? '✓' : '○'} At least 8 characters
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={!canImport || loading}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold"
          >
            {loading ? 'Importing...' : 'Import Wallet'}
          </button>
        </div>
      </div>
    </main>
  );
}


