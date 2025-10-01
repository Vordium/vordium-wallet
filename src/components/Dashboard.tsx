'use client';

import React, { useMemo, useState } from 'react';
import { BalanceCard } from './BalanceCard';
import { Button } from './ui/Button';
import { TokenCard } from './TokenCard';
import { ReceiveCard } from './ReceiveCard';
import Link from 'next/link';
import { useWalletStore } from '@/store/walletStore';
import { Settings } from 'lucide-react';

export function Dashboard() {
  const { accounts, selectedAccountId, selectAccount } = useWalletStore();
  const [hide, setHide] = useState(false);
  const selected = useMemo(() => accounts.find(a => a.id === selectedAccountId) || accounts[0] || null, [accounts, selectedAccountId]);

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-2">
        <Link href="/settings">
          <button className="p-2 rounded-lg hover:bg-gray-100">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </Link>
      </div>
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
              <div className="font-mono text-sm break-all text-gray-900">{a.address}</div>
            </button>
          ))}
          {accounts.length === 0 && (
            <div className="text-sm text-gray-500">No accounts yet. Create or import a wallet.</div>
          )}
        </div>
      </div>

      {selected && (
        <ReceiveCard address={selected.address} network={selected.chain} />
      )}

      <div className="bg-white border rounded-2xl p-4">
        <div className="text-sm text-gray-500 mb-3">Tokens</div>
        <div className="space-y-2">
          <TokenCard symbol="ETH" name="Ethereum" balance="0.00" value="$0.00" change="+0.0%" />
          <TokenCard symbol="TRX" name="TRON" balance="0.00" value="$0.00" change="+0.0%" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pb-16 md:pb-0">
        <Link href="/send"><Button>Send</Button></Link>
        <Link href="/receive"><Button variant="secondary">Receive</Button></Link>
      </div>
    </div>
  );
}


