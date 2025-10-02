'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/walletStore';
import { ArrowLeftIcon } from './icons/GrayIcons';

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
      <div className="bg-gray-800 rounded-3xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gray-700 p-6 text-white">
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-600 hover:bg-gray-500 flex items-center justify-center transition"
            >
              <ArrowLeftIcon className="w-5 h-5 text-white" />
            </button>
            <div>
              <h2 className="text-2xl font-bold">My Wallets</h2>
              <p className="text-gray-300 text-sm mt-1">{wallets.length} wallet{wallets.length !== 1 ? 's' : ''} total</p>
            </div>
          </div>
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
                      ? 'border-gray-500 bg-gray-700 shadow-md'
                      : 'border-gray-600 bg-gray-700 hover:border-gray-500 hover:shadow-sm'
                  }`}
                >
                  {/* Wallet Info */}
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0 bg-gray-600">
                      {wallet.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white truncate">{wallet.name}</h3>
                      <p className="text-sm text-gray-300">
                        {wallet.accounts.length} accounts
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Created {new Date(wallet.createdAt).toLocaleDateString()}
                      </p>
                      
                      {isActive && (
                        <div className="mt-2 inline-block px-3 py-1 bg-gray-600 text-white text-xs font-bold rounded-full">
                          ✓ Active
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {!isActive && (
                        <button
                          onClick={() => handleSwitchWallet(wallet.id)}
                          className="px-4 py-2 bg-gray-600 text-white text-sm font-bold rounded-lg hover:bg-gray-500 transition"
                        >
                          Use
                        </button>
                      )}
                      
                      {wallets.length > 1 && (
                        <button
                          onClick={() => handleRemoveWallet(wallet.id, wallet.name)}
                          className="px-3 py-2 bg-gray-600 text-gray-300 text-sm font-bold rounded-lg hover:bg-gray-500 transition"
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
        <div className="p-4 border-t border-gray-600 bg-gray-700">
          <button
            onClick={handleAddWallet}
            className="w-full py-4 bg-gray-600 text-white font-bold text-lg rounded-xl hover:bg-gray-500 active:scale-98 transition shadow-lg flex items-center justify-center gap-2"
          >
            <span className="text-2xl">+</span>
            <span>Add New Wallet</span>
          </button>
        </div>
      </div>
    </div>
  );
}
