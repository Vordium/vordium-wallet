'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/walletStore';

interface WalletSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletSwitcherModal({ isOpen, onClose }: WalletSwitcherModalProps) {
  const router = useRouter();
  const wallets = useWalletStore(state => state.wallets);
  const currentWalletId = useWalletStore(state => state.currentWalletId);
  const setCurrentWallet = useWalletStore(state => state.setCurrentWallet);
  const removeWallet = useWalletStore(state => state.removeWallet);

  if (!isOpen) return null;

  function handleSwitchWallet(walletId: string) {
    setCurrentWallet(walletId);
    onClose();
    // Refresh page to reload balances
    window.location.reload();
  }

  function handleRemoveWallet(walletId: string, walletName: string) {
    if (wallets.length === 1) {
      alert('Cannot remove the last wallet');
      return;
    }
    
    const confirmed = confirm(`Remove "${walletName}"?\n\nMake sure you have backed up your seed phrase! This action cannot be undone.`);
    
    if (confirmed) {
      removeWallet(walletId);
      if (walletId === currentWalletId) {
        const remainingWallet = wallets.find(w => w.id !== walletId);
        if (remainingWallet) {
          setCurrentWallet(remainingWallet.id);
        }
      }
      onClose();
      window.location.reload();
    }
  }

  function handleAddWallet() {
    localStorage.setItem('adding_wallet', 'true');
    onClose();
    router.push('/create');
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">My Wallets</h2>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
          <p className="text-blue-100 text-sm mt-2">{wallets.length} wallet{wallets.length !== 1 ? 's' : ''} total</p>
        </div>

        {/* Wallets List */}
        <div className="p-4 max-h-96 overflow-y-auto">
          <div className="space-y-3">
            {wallets.map((wallet) => {
              const isActive = wallet.id === currentWalletId;
              
              return (
                <div
                  key={wallet.id}
                  className={`relative p-4 rounded-2xl border-2 transition-all ${
                    isActive
                      ? 'border-blue-600 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  {/* Wallet Info */}
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0 ${
                      isActive ? 'bg-gradient-to-br from-blue-600 to-purple-600' : 'bg-gradient-to-br from-gray-500 to-gray-600'
                    }`}>
                      {wallet.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 truncate">{wallet.name}</h3>
                      <p className="text-sm text-gray-600">
                        {wallet.accounts.length} accounts
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Created {new Date(wallet.createdAt).toLocaleDateString()}
                      </p>
                      
                      {isActive && (
                        <div className="mt-2 inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                          ✓ Active
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {!isActive && (
                        <button
                          onClick={() => handleSwitchWallet(wallet.id)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition"
                        >
                          Use
                        </button>
                      )}
                      
                      {wallets.length > 1 && (
                        <button
                          onClick={() => handleRemoveWallet(wallet.id, wallet.name)}
                          className="px-3 py-2 bg-red-100 text-red-600 text-sm font-bold rounded-lg hover:bg-red-200 transition"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Wallet Button */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleAddWallet}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-lg rounded-xl hover:from-green-600 hover:to-green-700 active:scale-98 transition shadow-lg flex items-center justify-center gap-2"
          >
            <span className="text-2xl">+</span>
            <span>Add New Wallet</span>
          </button>
        </div>
      </div>
    </div>
  );
}
