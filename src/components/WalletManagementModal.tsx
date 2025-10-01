'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/walletStore';
import QRCode from 'react-qr-code';

interface WalletManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletManagementModal({ isOpen, onClose }: WalletManagementModalProps) {
  const router = useRouter();
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState('');
  
  const wallets = useWalletStore(state => state.wallets);
  const currentWalletId = useWalletStore(state => state.currentWalletId);
  const setCurrentWallet = useWalletStore(state => state.setCurrentWallet);
  const removeWallet = useWalletStore(state => state.removeWallet);
  const accounts = useWalletStore(state => state.accounts);

  if (!isOpen) return null;

  const evmAccount = accounts.find(a => a.chain === 'EVM');
  const tronAccount = accounts.find(a => a.chain === 'TRON');
  const currentWalletName = localStorage.getItem('vordium_wallet_name') || 'My Wallet';

  function handleAddWallet() {
    localStorage.setItem('adding_wallet', 'true');
    onClose();
    router.push('/create/step-1');
  }

  function handleCopy(address: string, label: string) {
    navigator.clipboard.writeText(address);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Wallet</h2>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition"
          >
            ✕
          </button>
        </div>

        {/* Current Wallet Info */}
        <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-600">Active Wallet</p>
              <h3 className="text-lg font-bold text-gray-900">{currentWalletName}</h3>
            </div>
            <button
              onClick={() => setShowQR(!showQR)}
              className="px-4 py-2 bg-white text-gray-900 rounded-xl text-sm font-semibold border border-gray-300 hover:bg-gray-50 transition"
            >
              {showQR ? 'Hide' : 'Show'} QR
            </button>
          </div>

          {/* QR Codes */}
          {showQR && (evmAccount || tronAccount) && (
            <div className="space-y-4 mt-4">
              {/* Ethereum Address */}
              {evmAccount && (
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">⚡</span>
                      <span className="font-semibold text-gray-900">Ethereum</span>
                    </div>
                    <button
                      onClick={() => handleCopy(evmAccount.address, 'ETH')}
                      className="text-blue-600 text-sm font-semibold hover:underline"
                    >
                      {copied === 'ETH' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="flex justify-center mb-2">
                    <QRCode value={evmAccount.address} size={150} level="H" />
                  </div>
                  <p className="text-xs text-center text-gray-600 font-mono break-all">
                    {evmAccount.address}
                  </p>
                </div>
              )}

              {/* TRON Address */}
              {tronAccount && (
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🔺</span>
                      <span className="font-semibold text-gray-900">TRON</span>
                    </div>
                    <button
                      onClick={() => handleCopy(tronAccount.address, 'TRX')}
                      className="text-blue-600 text-sm font-semibold hover:underline"
                    >
                      {copied === 'TRX' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="flex justify-center mb-2">
                    <QRCode value={tronAccount.address} size={150} level="H" />
                  </div>
                  <p className="text-xs text-center text-gray-600 font-mono break-all">
                    {tronAccount.address}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Wallet Button */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <button
            onClick={handleAddWallet}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 active:scale-95 transition flex items-center justify-center gap-2"
          >
            <span className="text-xl">+</span>
            <span>Add New Wallet</span>
          </button>
        </div>
      </div>
    </div>
  );
}

