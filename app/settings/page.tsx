'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const router = useRouter();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  function handleResetWallet() {
    if (showResetConfirm) {
      // Clear all wallet data
      localStorage.clear();
      sessionStorage.clear();
      router.replace('/');
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 5000);
    }
  }

  return (
    <main className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 rounded-2xl shadow p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-white">Settings</h1>
            <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-400 underline hover:text-gray-300">Back</button>
          </div>

          <div className="space-y-4">
            <div className="border-b border-gray-700 pb-4">
              <h2 className="text-sm font-semibold text-gray-300 mb-3">Security</h2>
              <Button variant="secondary" disabled>Change Password (Coming Soon)</Button>
            </div>

            <div className="border-b border-gray-700 pb-4">
              <h2 className="text-sm font-semibold text-gray-300 mb-3">Wallet</h2>
              <Button variant="secondary" disabled>Backup Recovery Phrase (Coming Soon)</Button>
            </div>

            <div className="border-b border-gray-700 pb-4">
              <h2 className="text-sm font-semibold text-gray-300 mb-3">About</h2>
              <div className="text-sm text-gray-400 space-y-1">
                <p>Version: 1.0.0</p>
                <p>Vordium Wallet - Professional Dark Theme</p>
                <p>Non-custodial Multi-chain Wallet</p>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-300 mb-3">Danger Zone</h2>
              <Button 
                variant="danger" 
                onClick={handleResetWallet}
                className={showResetConfirm ? 'bg-gray-600 hover:bg-gray-500 text-white' : ''}
              >
                {showResetConfirm ? 'Click Again to Confirm Reset' : 'Reset Wallet'}
              </Button>
              {showResetConfirm && (
                <p className="text-xs text-gray-400 mt-2">⚠️ This will delete all wallet data permanently!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}