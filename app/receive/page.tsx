'use client';

import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/walletStore';
import { ReceiveCard } from '@/components/ReceiveCard';

export default function ReceivePage() {
  const router = useRouter();
  const { accounts, selectedAccountId } = useWalletStore();
  const current = accounts.find(a => a.id === selectedAccountId) || accounts[0] || null;
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow p-6 w-full max-w-lg space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Receive</h1>
          <button onClick={() => router.push('/')} className="text-sm text-gray-500 underline">Back</button>
        </div>
        {current ? (
          <ReceiveCard address={current.address} network={current.chain} />
        ) : (
          <div className="text-sm text-gray-500">No account selected.</div>
        )}
      </div>
    </main>
  );
}


