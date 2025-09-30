'use client';

import { useEffect, useMemo, useState } from 'react';
import QRCode from 'react-qr-code';
import { useWalletStore } from '@/store/walletStore';
import { CryptoService, type DerivedAccount } from '@/services/crypto.service';

type ViewState = 'landing' | 'create' | 'import' | 'dashboard';

function short(addr: string) {
  if (!addr) return '';
  return addr.length > 12 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}

export default function Home() {
  const { accounts, addAccount, selectedAccountId, selectAccount } = useWalletStore();
  const [view, setView] = useState<ViewState>('landing');
  const [mnemonic, setMnemonic] = useState('');
  const [busy, setBusy] = useState(false);
  const selected = useMemo(() => accounts.find(a => a.id === selectedAccountId) || null, [accounts, selectedAccountId]);

  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      selectAccount(accounts[0].id);
      setView('dashboard');
    }
  }, [accounts, selectedAccountId, selectAccount]);

  async function deriveAndStore(seed: Uint8Array) {
    const evm: DerivedAccount = await CryptoService.deriveAccount(seed, 'EVM', 0);
    const tron: DerivedAccount = await CryptoService.deriveAccount(seed, 'TRON', 0);
    addAccount({ id: `evm-0`, name: 'EVM #1', address: evm.address, chain: 'EVM' });
    addAccount({ id: `tron-0`, name: 'TRON #1', address: tron.address, chain: 'TRON' });
    selectAccount('evm-0');
    setView('dashboard');
  }

  async function onCreateWallet() {
    try {
      setBusy(true);
      const m = CryptoService.generateMnemonic(12);
      setMnemonic(m);
      const seed = await CryptoService.mnemonicToSeed(m);
      await deriveAndStore(seed);
    } finally {
      setBusy(false);
    }
  }

  async function onImportMnemonic() {
    if (!CryptoService.validateMnemonic(mnemonic)) {
      alert('Invalid mnemonic');
      return;
    }
    try {
      setBusy(true);
      const seed = await CryptoService.mnemonicToSeed(mnemonic);
      await deriveAndStore(seed);
    } finally {
      setBusy(false);
    }
  }

  function Landing() {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Vordium Wallet</h1>
          <p className="text-gray-600 mt-1">Non-custodial, multi-chain wallet</p>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <button onClick={() => setView('create')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-3 font-medium">Create new wallet</button>
          <button onClick={() => setView('import')} className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg py-3 font-medium">Import with recovery phrase</button>
        </div>
      </div>
    );
  }

  function CreateFlow() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Create Wallet</h2>
          <p className="text-sm text-gray-600">We’ll generate a 12-word recovery phrase and set up your first accounts.</p>
        </div>
        <button disabled={busy} onClick={onCreateWallet} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg py-3 font-medium">{busy ? 'Creating…' : 'Generate recovery phrase'}</button>
        {mnemonic && (
          <div className="bg-gray-50 border rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-2">Recovery phrase (write it down safely)</p>
            <p className="font-mono text-sm break-words">{mnemonic}</p>
          </div>
        )}
        <button onClick={() => setView('landing')} className="w-full border rounded-lg py-2">Back</button>
      </div>
    );
  }

  function ImportFlow() {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Import Wallet</h2>
          <p className="text-sm text-gray-600">Paste your 12/24-word recovery phrase to restore accounts.</p>
        </div>
        <textarea value={mnemonic} onChange={(e) => setMnemonic(e.target.value)} placeholder="enter your recovery phrase" className="w-full border rounded-lg p-3 h-28 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <button disabled={busy} onClick={onImportMnemonic} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg py-3 font-medium">{busy ? 'Importing…' : 'Import'}</button>
        <button onClick={() => setView('landing')} className="w-full border rounded-lg py-2">Back</button>
      </div>
    );
  }

  function Dashboard() {
    const current = selected || accounts[0] || null;
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Wallet</h2>
          <button onClick={() => setView('landing')} className="text-sm text-gray-500 underline">Reset</button>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {accounts.map((a) => (
            <button key={a.id} onClick={() => selectAccount(a.id)} className={`text-left border rounded-lg p-3 ${selectedAccountId === a.id ? 'border-indigo-500 bg-indigo-50' : ''}`}>
              <div className="text-sm text-gray-500">{a.name} · {a.chain}</div>
              <div className="font-mono text-sm">{short(a.address)}</div>
            </button>
          ))}
        </div>
        {current && (
          <div className="bg-gray-50 border rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-2">Receive {current.chain}</div>
            <div className="bg-white inline-block p-3 rounded-md"><QRCode value={current.address} size={140} /></div>
            <div className="mt-3 flex items-center justify-between">
              <div className="font-mono text-sm break-all">{current.address}</div>
              <button onClick={() => navigator.clipboard.writeText(current.address)} className="ml-3 text-sm px-3 py-1 rounded bg-gray-900 text-white">Copy</button>
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <button disabled className="w-full bg-gray-200 text-gray-500 rounded-lg py-3 font-medium">Send (soon)</button>
          <button className="w-full border rounded-lg py-3 font-medium" onClick={() => setView('create')}>Add account</button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-lg">
        {view === 'landing' && <Landing />}
        {view === 'create' && <CreateFlow />}
        {view === 'import' && <ImportFlow />}
        {view === 'dashboard' && <Dashboard />}
      </div>
    </main>
  );
}
