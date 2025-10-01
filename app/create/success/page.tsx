'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/walletStore';

export default function CreateSuccess() {
  const router = useRouter();
  const { accounts } = useWalletStore();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const evmAccount = accounts.find(a => a.chain === 'EVM');
  const tronAccount = accounts.find(a => a.chain === 'TRON');

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg space-y-8 text-center">
        {/* Success Animation */}
        <div className="relative">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-bounce">
            <span className="text-5xl text-white">✓</span>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border-4 border-green-200 rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Success Message */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Wallet Created Successfully! 🎉</h1>
          <p className="text-gray-600">You're ready to explore Web3</p>
        </div>

        {/* Wallet Info Card */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 space-y-4 text-left">
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <span className="text-xl">📊</span>
            <span>Your Multi-Chain Wallet</span>
          </div>
          
          {evmAccount && (
            <div className="bg-white rounded-lg p-3 space-y-1">
              <p className="text-sm text-gray-600 font-medium">Ethereum Account</p>
              <p className="font-mono text-sm text-gray-900 break-all">{evmAccount.address}</p>
            </div>
          )}
          
          {tronAccount && (
            <div className="bg-white rounded-lg p-3 space-y-1">
              <p className="text-sm text-gray-600 font-medium">TRON Account</p>
              <p className="font-mono text-sm text-gray-900 break-all">{tronAccount.address}</p>
            </div>
          )}
          
          <div className="flex items-center justify-center gap-2 text-sm text-green-700 font-medium pt-2">
            <span>✓</span>
            <span>Both secured by 1 recovery phrase</span>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-left text-sm text-gray-700">
          <p className="font-semibold text-gray-900">Quick Tips:</p>
          <ul className="space-y-1">
            <li>• Receive crypto by sharing your address</li>
            <li>• Never share your recovery phrase</li>
            <li>• Bookmark this app for easy access</li>
          </ul>
        </div>

        {/* Action Button */}
        <div className="space-y-3">
          <button
            onClick={() => router.push('/')}
            className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg transition transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Open My Wallet
          </button>
          <p className="text-sm text-gray-500">
            Redirecting in {countdown} seconds...
          </p>
        </div>
      </div>
    </main>
  );
}

