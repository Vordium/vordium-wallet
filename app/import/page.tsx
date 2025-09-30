'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import * as bip39 from 'bip39';

export default function ImportPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'mnemonic' | 'pk'>('mnemonic');
  const [mnemonic, setMnemonic] = useState('');
  const [pk, setPk] = useState('');
  const [chain, setChain] = useState<'EVM' | 'TRON'>('EVM');
  const validMnemonic = mnemonic.trim().length > 0 && bip39.validateMnemonic(mnemonic.trim());

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow p-6 w-full max-w-lg space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Import Wallet</h1>
          <button onClick={()=>router.push('/')} className="text-sm text-gray-500 underline">Back</button>
        </div>
        <div className="flex gap-2 text-sm">
          <button onClick={()=>setTab('mnemonic')} className={`px-3 py-1 rounded ${tab==='mnemonic'?'bg-indigo-600 text-white':'border'}`}>Seed Phrase</button>
          <button onClick={()=>setTab('pk')} className={`px-3 py-1 rounded ${tab==='pk'?'bg-indigo-600 text-white':'border'}`}>Private Key</button>
        </div>
        {tab==='mnemonic' ? (
          <div className="space-y-3">
            <textarea value={mnemonic} onChange={(e)=>setMnemonic(e.target.value)} placeholder="enter your 12/24 words" className="w-full h-28 border rounded-lg p-3" />
            <div className={`text-sm ${validMnemonic? 'text-emerald-600':'text-gray-500'}`}>Mnemonic {validMnemonic? 'valid':'invalid'}</div>
            <Button disabled={!validMnemonic}>Import</Button>
          </div>
        ) : (
          <div className="space-y-3">
            <select value={chain} onChange={(e)=>setChain(e.target.value as any)} className="border rounded-lg p-2">
              <option value="EVM">EVM</option>
              <option value="TRON">TRON</option>
            </select>
            <input value={pk} onChange={(e)=>setPk(e.target.value)} placeholder="private key" className="w-full border rounded-lg p-3" />
            <Button disabled={!pk}>Import</Button>
          </div>
        )}
      </div>
    </main>
  );
}


