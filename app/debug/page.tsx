'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/walletStore';

export default function DebugPage() {
  const router = useRouter();
  const { accounts } = useWalletStore();
  const [storageData, setStorageData] = useState<any>({});

  useEffect(() => {
    const data = {
      vault: localStorage.getItem('vordium_vault'),
      unlocked: localStorage.getItem('vordium_unlocked'),
      verified: localStorage.getItem('vordium_verified'),
      walletName: localStorage.getItem('vordium_wallet_name'),
      createdAt: localStorage.getItem('vordium_created_at'),
      zustandStorage: localStorage.getItem('vordium-wallet-storage'),
      sessionSkipped: sessionStorage.getItem('verification_skipped'),
      accountsCount: accounts.length,
    };
    setStorageData(data);
  }, [accounts]);

  function clearAll() {
    if (confirm('Clear ALL wallet data? This cannot be undone!')) {
      localStorage.clear();
      sessionStorage.clear();
      router.push('/welcome');
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow p-6 space-y-4">
        <h1 className="text-2xl font-bold">Debug Info</h1>
        
        <div className="space-y-2">
          <h2 className="font-semibold">LocalStorage:</h2>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
            {JSON.stringify(storageData, null, 2)}
          </pre>
        </div>

        <div className="space-y-2">
          <h2 className="font-semibold">Zustand Accounts ({accounts.length}):</h2>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
            {JSON.stringify(accounts, null, 2)}
          </pre>
        </div>

        <div className="flex gap-3">
          <button
            onClick={clearAll}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Clear All Data
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Back to Home
          </button>
        </div>
      </div>
    </main>
  );
}

