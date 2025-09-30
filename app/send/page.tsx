'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { isValidAddress } from '@/src/utils/safety.utils';
import { useWalletStore } from '@/store/walletStore';

export default function SendPage() {
  const router = useRouter();
  const { accounts, selectedAccountId } = useWalletStore();
  const from = accounts.find(a => a.id === selectedAccountId) || accounts[0] || null;
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  function validate() {
    if (!from) return 'No account selected';
    if (!to) return 'Recipient required';
    if (!isValidAddress(to, from.chain)) return 'Invalid address for selected network';
    if (!amount || Number(amount) <= 0) return 'Enter a valid amount';
    return '';
  }

  function onReview() {
    const e = validate();
    setError(e);
    if (e) return;
    alert('Review modal would show here. Sending is not wired yet.');
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow p-6 w-full max-w-lg space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Send</h1>
          <button onClick={() => router.push('/')} className="text-sm text-gray-500 underline">Back</button>
        </div>
        <div className="text-sm text-gray-500">From: {from ? `${from.name} · ${from.chain}` : '—'}</div>
        <div className="space-y-2">
          <label className="text-sm text-gray-600">Recipient</label>
          <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Enter address"
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-gray-600">Amount</label>
          <div className="flex gap-2">
            <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.0"
              className="flex-1 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <Button variant="secondary" onClick={() => setAmount('')}>Max</Button>
          </div>
        </div>
        {error && <div className="text-sm text-rose-600">{error}</div>}
        <Button onClick={onReview}>Review</Button>
      </div>
    </main>
  );
}


