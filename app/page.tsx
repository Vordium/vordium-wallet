'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/walletStore';
import { Dashboard as WalletDashboard } from '@/components/Dashboard';

export default function Home() {
  const router = useRouter();
  const { accounts } = useWalletStore();

  useEffect(() => {
    // Check if wallet exists
    const vault = localStorage.getItem('vordium_vault');
    const unlocked = localStorage.getItem('vordium_unlocked');
    
    if (vault && !unlocked) {
      // Wallet exists but locked, go to unlock
      router.push('/unlock');
    } else if (!vault) {
      // No wallet, show welcome
      router.push('/welcome');
    }
    // If vault exists and unlocked, stay on dashboard
  }, [router]);

  // If we have accounts, show dashboard
  if (accounts.length > 0) {
    return (
      <main className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-2xl mx-auto">
          <WalletDashboard />
        </div>
      </main>
    );
  }

  // Loading state while checking
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-500 to-indigo-600">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
    </main>
  );
}
