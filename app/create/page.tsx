'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as bip39 from 'bip39';
import { CryptoService } from '@/services/crypto.service';
import { useWalletStore } from '@/store/walletStore';

export default function CreatePage() {
  const router = useRouter();
  const [isAddingWallet, setIsAddingWallet] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mnemonic, setMnemonic] = useState<string>('');
  const [confirmChecks, setConfirmChecks] = useState<{ a: boolean; b: boolean; c: boolean }>({ a: false, b: false, c: false });
  
  const addWallet = useWalletStore(state => state.addWallet);
  const setCurrentWallet = useWalletStore(state => state.setCurrentWallet);
  const wallets = useWalletStore(state => state.wallets);

  useEffect(() => {
    const adding = localStorage.getItem('adding_wallet') === 'true';
    setIsAddingWallet(adding);
    setName(adding ? `Wallet ${wallets.length + 1}` : 'My Wallet');
  }, [wallets.length]);

  // STEP 1: Wallet Name (and Password for first wallet)
  if (step === 1) {
    const needsPassword = !isAddingWallet;
    const passwordValid = needsPassword ? (password.length >= 8 && password === confirmPassword) : true;
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {isAddingWallet ? 'Add Wallet' : 'Create Wallet'}
            </h1>
            <button 
              onClick={() => {
                localStorage.removeItem('adding_wallet');
                router.push(isAddingWallet ? '/dashboard' : '/');
              }}
              className="text-blue-600 font-semibold hover:text-blue-700"
            >
              Cancel
            </button>
          </div>

          {/* Wallet Name Input */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Wallet Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter wallet name"
              className="w-full px-4 py-4 text-gray-900 bg-white border-2 border-gray-300 rounded-xl text-lg focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
            />
          </div>

          {/* Password Inputs (only for first wallet) */}
          {needsPassword && (
            <>
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (min 8 characters)"
                  className="w-full px-4 py-4 text-gray-900 bg-white border-2 border-gray-300 rounded-xl text-lg focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition"
                  style={{ color: '#111827', backgroundColor: '#ffffff' }}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full px-4 py-4 text-gray-900 bg-white border-2 border-gray-300 rounded-xl text-lg focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition"
                  style={{ color: '#111827', backgroundColor: '#ffffff' }}
                />
              </div>
            </>
          )}

          {/* Continue Button */}
          <button
            onClick={() => {
              setMnemonic(bip39.generateMnemonic(256));
              setStep(2);
            }}
            disabled={!name.trim() || !passwordValid}
            className="w-full py-4 bg-blue-600 text-white text-lg font-bold rounded-xl hover:bg-blue-700 active:scale-98 transition disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed shadow-lg"
          >
            Continue →
          </button>
        </div>
      </div>
    );
  }

  // STEP 2: Show Seed Phrase
  if (step === 2) {
    const words = mnemonic.split(' ');
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Secret Recovery Phrase</h1>
            <button onClick={() => setStep(1)} className="text-blue-600 font-semibold hover:text-blue-700">
              ← Back
            </button>
          </div>

          {/* Warning */}
          <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4 mb-6">
            <p className="text-red-900 font-bold mb-2">⚠️ CRITICAL - READ CAREFULLY</p>
            <ul className="text-red-800 space-y-1 text-sm">
              <li>• Write these 24 words on paper and store safely</li>
              <li>• NEVER share with anyone - not even support</li>
              <li>• Anyone with these words can steal your funds</li>
              <li>• Lost phrase = Lost funds forever</li>
            </ul>
          </div>

          {/* Seed Phrase Grid - Dark Background with White Cards */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {words.map((word, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg p-3 flex items-center gap-2 shadow-md"
                >
                  <span className="text-gray-500 font-bold text-sm min-w-[28px]">{i + 1}.</span>
                  <span className="text-gray-900 font-mono font-semibold">{word}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 mb-6">
            {[
              { key: 'a', text: 'I have written down all 24 words in order' },
              { key: 'b', text: 'I understand this is the ONLY way to recover my wallet' },
              { key: 'c', text: 'I will NEVER share my seed phrase with anyone' }
            ].map(({ key, text }) => (
              <label key={key} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                <input
                  type="checkbox"
                  checked={confirmChecks[key as keyof typeof confirmChecks]}
                  onChange={(e) => setConfirmChecks(v => ({ ...v, [key]: e.target.checked }))}
                  className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-900 font-medium">{text}</span>
              </label>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(mnemonic);
                alert('Copied! But remember to write it down on paper too!');
              }}
              className="flex-1 py-4 bg-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-300 transition"
            >
              📋 Copy
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!(confirmChecks.a && confirmChecks.b && confirmChecks.c)}
              className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed shadow-lg"
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 3: Confirm and Create
  if (step === 3) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✓</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Ready to Create!</h1>
          <p className="text-gray-600 mb-8">Your wallet will be created with the seed phrase you saved.</p>

          <button
            onClick={async () => {
              try {
                // Encrypt vault (only for first wallet)
                if (!isAddingWallet && password) {
                  const vault = await CryptoService.encrypt(mnemonic, password);
                  localStorage.setItem('vordium_vault', JSON.stringify(vault));
                }
                
                // Generate accounts
                const seed = await CryptoService.mnemonicToSeed(mnemonic);
                const evmAccount = await CryptoService.deriveAccount(seed, 'EVM', 0);
                const tronAccount = await CryptoService.deriveAccount(seed, 'TRON', 0);
                
                const newWallet = {
                  id: Date.now().toString(),
                  name: name.trim(),
                  accounts: [
                    {
                      id: `evm-${Date.now()}`,
                      name: 'Ethereum',
                      address: evmAccount.address,
                      chain: 'EVM' as const,
                      index: 0,
                      publicKey: evmAccount.publicKey,
                      derivationPath: evmAccount.derivationPath
                    },
                    {
                      id: `tron-${Date.now()}`,
                      name: 'TRON',
                      address: tronAccount.address,
                      chain: 'TRON' as const,
                      index: 0,
                      publicKey: tronAccount.publicKey,
                      derivationPath: tronAccount.derivationPath
                    }
                  ],
                  createdAt: Date.now()
                };
                
                addWallet(newWallet);
                setCurrentWallet(newWallet.id);
                localStorage.removeItem('adding_wallet');
                localStorage.setItem('vordium_unlocked', 'true');
                
                router.push('/dashboard');
              } catch (error) {
                alert('Failed: ' + (error as Error).message);
              }
            }}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white text-lg font-bold rounded-xl hover:from-green-600 hover:to-green-700 active:scale-98 transition shadow-lg"
          >
            ✓ Create Wallet
          </button>
        </div>
      </div>
    );
  }

  return null;
}