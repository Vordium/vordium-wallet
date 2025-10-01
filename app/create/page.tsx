'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import * as bip39 from 'bip39';
import { CryptoService } from '@/services/crypto.service';
import { useWalletStore } from '@/store/walletStore';

export default function CreatePage() {
  const router = useRouter();
  const [name, setName] = useState('My Wallet');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mnemonic, setMnemonic] = useState<string>('');
  const [confirmChecks, setConfirmChecks] = useState({ a: false, b: false, c: false });
  const addAccount = useWalletStore((s) => s.addAccount);
  const selectAccount = useWalletStore((s) => s.selectAccount);

  const validLen = pw.length >= 8;
  const hasUpper = /[A-Z]/.test(pw);
  const hasNum = /\d/.test(pw);
  const match = pw && pw === pw2;
  const valid = validLen && hasUpper && hasNum && match;

  const words = useMemo(() => (mnemonic ? mnemonic.split(' ') : []), [mnemonic]);

  if (step === 2) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
        <div className="bg-white rounded-2xl shadow p-6 w-full max-w-2xl space-y-5">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Secret Recovery Phrase</h1>
            <button onClick={() => setStep(1)} className="text-sm text-gray-500 underline">Back</button>
          </div>
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-3 text-sm">
            ⚠️ Write these 24 words in order and store them safely. Never share with anyone.
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {words.map((w, i) => (
              <div key={i} className="border rounded-lg p-2 text-sm font-mono flex items-center gap-2">
                <span className="text-gray-400 w-6">{i + 1}.</span>
                <span>{w}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={confirmChecks.a} onChange={(e)=>setConfirmChecks(v=>({...v,a:e.target.checked}))} /> I have written down my seed phrase</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={confirmChecks.b} onChange={(e)=>setConfirmChecks(v=>({...v,b:e.target.checked}))} /> I understand I cannot recover my wallet without it</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={confirmChecks.c} onChange={(e)=>setConfirmChecks(v=>({...v,c:e.target.checked}))} /> I will never share my seed phrase</label>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={()=>navigator.clipboard.writeText(mnemonic)}>Copy</Button>
            <Button disabled={!(confirmChecks.a && confirmChecks.b && confirmChecks.c)} onClick={()=>setStep(3)}>Continue</Button>
          </div>
        </div>
      </main>
    );
  }

  if (step === 3) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
        <div className="bg-white rounded-2xl shadow p-6 w-full max-w-lg space-y-5">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Verify Your Phrase</h1>
            <button onClick={() => setStep(2)} className="text-sm text-gray-500 underline">Back</button>
          </div>
          <p className="text-sm text-gray-600">For now, tap verify to proceed. (Full word check can be added.)</p>
          <Button onClick={async ()=>{
            try {
              // 1) Encrypt and persist vault locally (password-only; name stored alongside)
              const vault = await CryptoService.encrypt(mnemonic, pw);
              localStorage.setItem('vordium_vault', JSON.stringify(vault));
              localStorage.setItem('vordium_wallet_name', name || 'My Wallet');

              // 2) Derive first accounts and store in Zustand
              const seed = await CryptoService.mnemonicToSeed(mnemonic);
              const evm = await CryptoService.deriveAccount(seed, 'EVM', 0);
              const tron = await CryptoService.deriveAccount(seed, 'TRON', 0);
              addAccount({ id: 'evm-0', name: 'EVM #1', address: evm.address, chain: 'EVM' });
              addAccount({ id: 'tron-0', name: 'TRON #1', address: tron.address, chain: 'TRON' });
              selectAccount('evm-0');

              // 3) Route to dashboard (home)
              router.push('/');
            } catch (e) {
              alert('Failed to create wallet: ' + (e as Error).message);
            }
          }}>Verify & Create Wallet</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="bg-white rounded-2xl shadow p-6 w-full max-w-lg space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Create New Wallet</h1>
          <button onClick={() => router.push('/')} className="text-sm text-gray-500 underline">Back</button>
        </div>
        <p className="text-sm text-gray-600">This password encrypts your wallet locally. Never share it.</p>
        <div className="space-y-2">
          <label className="text-sm text-gray-600">Wallet Name</label>
          <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-gray-600">Password</label>
          <div className="flex gap-2">
            <input type={show1? 'text':'password'} value={pw} onChange={(e)=>setPw(e.target.value)} className="flex-1 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <Button variant="secondary" onClick={()=>setShow1(v=>!v)}>{show1? 'Hide':'Show'}</Button>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-gray-600">Confirm Password</label>
          <div className="flex gap-2">
            <input type={show2? 'text':'password'} value={pw2} onChange={(e)=>setPw2(e.target.value)} className="flex-1 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <Button variant="secondary" onClick={()=>setShow2(v=>!v)}>{show2? 'Hide':'Show'}</Button>
          </div>
        </div>
        <div className="space-y-1 text-sm">
          <div className={validLen? 'text-emerald-600':'text-gray-500'}>• Minimum 8 characters</div>
          <div className={hasUpper? 'text-emerald-600':'text-gray-500'}>• At least one uppercase</div>
          <div className={hasNum? 'text-emerald-600':'text-gray-500'}>• At least one number</div>
          <div className={match? 'text-emerald-600':'text-gray-500'}>• Passwords match</div>
        </div>
        <Button disabled={!valid} onClick={()=>{ setMnemonic(bip39.generateMnemonic(256)); setStep(2); }}>
          Continue
        </Button>
      </div>
    </main>
  );
}


