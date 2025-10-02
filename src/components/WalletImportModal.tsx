'use client';

import { useState } from 'react';
import { ArrowLeftIcon, CheckIcon, AlertTriangleIcon, EyeIcon, EyeOffIcon, KeyIcon, WalletIcon } from './icons/GrayIcons';
import { PINVerification } from './PINVerification';
import { useWalletStore } from '@/store/walletStore';

interface WalletImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function WalletImportModal({ isOpen, onClose, onSuccess }: WalletImportModalProps) {
  const [step, setStep] = useState<'method' | 'mnemonic' | 'private' | 'pin' | 'success'>('method');
  const [importMethod, setImportMethod] = useState<'mnemonic' | 'private'>('mnemonic');
  const [mnemonic, setMnemonic] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [walletName, setWalletName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const { addWallet } = useWalletStore();

  const handleMethodSelect = (method: 'mnemonic' | 'private') => {
    setImportMethod(method);
    setStep(method);
  };

  const handleImport = async () => {
    setError('');
    
    if (importMethod === 'mnemonic') {
      if (!mnemonic.trim()) {
        setError('Please enter your recovery phrase');
        return;
      }
      const words = mnemonic.trim().split(' ');
      if (words.length !== 12 && words.length !== 24) {
        setError('Recovery phrase must be 12 or 24 words');
        return;
      }
    } else {
      if (!privateKey.trim()) {
        setError('Please enter your private key');
        return;
      }
      if (privateKey.length !== 64) {
        setError('Private key must be 64 characters long');
        return;
      }
    }

    if (!walletName.trim()) {
      setError('Please enter a wallet name');
      return;
    }

    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsImporting(true);
    
    try {
      // Simulate import process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would:
      // 1. Validate the mnemonic/private key
      // 2. Derive accounts from the mnemonic/private key
      // 3. Create a new wallet object
      // 4. Encrypt and store the wallet
      
      const newWallet = {
        id: Date.now().toString(),
        name: walletName,
        mnemonic: importMethod === 'mnemonic' ? mnemonic : undefined,
        privateKey: importMethod === 'private' ? privateKey : undefined,
        accounts: [
          {
            id: `evm-${Date.now()}`,
            name: 'EVM Account',
            chain: 'EVM' as const,
            address: '0x' + Math.random().toString(16).substr(2, 40),
            privateKey: '0x' + Math.random().toString(16).substr(2, 64)
          },
          {
            id: `tron-${Date.now()}`,
            name: 'TRON Account',
            chain: 'TRON' as const,
            address: 'T' + Math.random().toString(16).substr(2, 40),
            privateKey: Math.random().toString(16).substr(2, 64)
          }
        ],
        createdAt: Date.now()
      };

      addWallet(newWallet);
      setStep('success');
    } catch (err) {
      setError('Failed to import wallet. Please check your input and try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-700 p-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-600 hover:bg-gray-500 flex items-center justify-center transition"
            >
              <ArrowLeftIcon className="w-5 h-5 text-white" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-white">Import Wallet</h2>
              <p className="text-gray-300 text-sm">
                {step === 'method' && 'Choose import method'}
                {step === 'mnemonic' && 'Enter recovery phrase'}
                {step === 'private' && 'Enter private key'}
                {step === 'pin' && 'Set up security'}
                {step === 'success' && 'Import successful'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {step === 'method' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <p className="text-gray-300">Choose how you want to import your wallet</p>
              </div>

              <button
                onClick={() => handleMethodSelect('mnemonic')}
                className="w-full p-4 bg-gray-700 rounded-xl hover:bg-gray-600 transition text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                    <KeyIcon className="w-6 h-6 text-gray-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Recovery Phrase</h3>
                    <p className="text-sm text-gray-400">Import using 12 or 24 word recovery phrase</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleMethodSelect('private')}
                className="w-full p-4 bg-gray-700 rounded-xl hover:bg-gray-600 transition text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                    <WalletIcon className="w-6 h-6 text-gray-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Private Key</h3>
                    <p className="text-sm text-gray-400">Import using private key (advanced)</p>
                  </div>
                </div>
              </button>

              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangleIcon className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-400 mb-1">Security Notice</h3>
                    <p className="text-yellow-300 text-sm">
                      Only import wallets from trusted sources. Never share your recovery phrase or private key.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'mnemonic' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Recovery Phrase
                </label>
                <textarea
                  value={mnemonic}
                  onChange={(e) => setMnemonic(e.target.value)}
                  className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="Enter your 12 or 24 word recovery phrase..."
                  rows={4}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Separate words with spaces. This phrase is used to generate your wallet.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Wallet Name
                </label>
                <input
                  type="text"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="My Imported Wallet"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 pr-12"
                    placeholder="Enter password"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOffIcon className="w-5 h-5 text-gray-400" /> : <EyeIcon className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 pr-12"
                    placeholder="Confirm password"
                  />
                  <button
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showConfirmPassword ? <EyeOffIcon className="w-5 h-5 text-gray-400" /> : <EyeIcon className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep('method')}
                  className="flex-1 py-3 px-4 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-500 transition"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  disabled={isImporting}
                  className="flex-1 py-3 px-4 bg-gray-500 text-white font-semibold rounded-xl hover:bg-gray-400 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isImporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      Import Wallet
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'private' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Private Key
                </label>
                <textarea
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 font-mono"
                  placeholder="Enter your private key..."
                  rows={3}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Enter the 64-character private key (with or without 0x prefix).
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Wallet Name
                </label>
                <input
                  type="text"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="My Imported Wallet"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 pr-12"
                    placeholder="Enter password"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOffIcon className="w-5 h-5 text-gray-400" /> : <EyeIcon className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 pr-12"
                    placeholder="Confirm password"
                  />
                  <button
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showConfirmPassword ? <EyeOffIcon className="w-5 h-5 text-gray-400" /> : <EyeIcon className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep('method')}
                  className="flex-1 py-3 px-4 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-500 transition"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  disabled={isImporting}
                  className="flex-1 py-3 px-4 bg-gray-500 text-white font-semibold rounded-xl hover:bg-gray-400 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isImporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      Import Wallet
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckIcon className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Wallet Imported Successfully!</h3>
              <p className="text-gray-300">
                Your wallet has been imported and is ready to use. You can now manage your funds and assets.
              </p>
              <button
                onClick={handleSuccess}
                className="w-full py-3 px-4 bg-gray-500 text-white font-semibold rounded-xl hover:bg-gray-400 transition"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
