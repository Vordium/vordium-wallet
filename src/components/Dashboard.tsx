'use client';

import React, { useMemo, useState } from 'react';
import { BalanceCard } from './BalanceCard';
import { Button } from './ui/Button';
import { useWalletStore } from '@/store/walletStore';

export function Dashboard() {
  const { accounts, selectedAccountId, selectAccount } = useWalletStore();
  const [hide, setHide] = useState(false);
  const selected = useMemo(() => accounts.find(a => a.id === selectedAccountId) || accounts[0] || null, [accounts, selectedAccountId]);

  return (
    <div className="space-y-6">
      <BalanceCard
        balance={hide ? '••••••' : '$0.00'}
        change={'+0.00%'}
        isPositive
        hideBalance={hide}
        onToggleHide={() => setHide(v => !v)}
      />

      <div className="bg-white border rounded-2xl p-4">
        <div className="text-sm text-gray-500 mb-3">Accounts</div>
        <div className="grid grid-cols-1 gap-3">
          {accounts.map((a) => (
            <button key={a.id} onClick={() => selectAccount(a.id)} className={`text-left border rounded-lg p-3 ${selectedAccountId === a.id ? 'border-indigo-500 bg-indigo-50' : ''}`}>
              <div className="text-sm text-gray-500">{a.name} · {a.chain}</div>
              <div className="font-mono text-sm break-all">{a.address}</div>
            </button>
          ))}
          {accounts.length === 0 && (
            <div className="text-sm text-gray-500">No accounts yet. Create or import a wallet.</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button disabled>Send (soon)</Button>
        <Button variant="secondary">Receive</Button>
      </div>
    </div>
  );
}


