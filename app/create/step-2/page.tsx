'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, Copy, Download } from 'lucide-react';

export default function CreateStep2() {
  const router = useRouter();
  const [mnemonic, setMnemonic] = useState<string[]>([]);
  const [isBlurred, setIsBlurred] = useState(false);
  const [copied, setCopied] = useState(false);
  const [checks, setChecks] = useState({ saved: false, understand: false, neverShare: false });

  useEffect(() => {
    const storedMnemonic = sessionStorage.getItem('temp_mnemonic');
    if (!storedMnemonic) {
      router.push('/create/step-1');
      return;
    }
    setMnemonic(storedMnemonic.split(' '));
  }, [router]);

  const allChecked = checks.saved && checks.understand && checks.neverShare;

  function handleCopy() {
    navigator.clipboard.writeText(mnemonic.join(' '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const content = `VORDIUM WALLET - SECRET RECOVERY PHRASE

⚠️ WARNING ⚠️
• This is your ONLY way to recover your wallet
• NEVER share these words with anyone
• Anyone with these words can steal your funds
• Store this in a safe place (not on your computer)

Your 24-word recovery phrase:

${mnemonic.map((word, i) => `${i + 1}. ${word}`).join('\n')}

Keep this backup safe and secure!`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vordium-recovery-phrase.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleContinue() {
    router.push('/create/step-3');
  }

  async function handleSkip() {
    if (confirm('⚠️ Skipping verification is risky. You won&apos;t be able to prove you saved your phrase. Are you sure?')) {
      sessionStorage.setItem('verification_skipped', 'true');
      // Complete wallet creation without verification
      await completeWalletCreation();
    }
  }

  async function completeWalletCreation() {
    try {
      const { CryptoService } = await import('@/services/crypto.service');
      const { useWalletStore } = await import('@/store/walletStore');
      
      const password = sessionStorage.getItem('temp_password');
      const walletName = sessionStorage.getItem('temp_wallet_name');
      const mnemonicStr = sessionStorage.getItem('temp_mnemonic');
      
      if (!password || !mnemonicStr) {
        throw new Error('Missing required data');
      }
      
      // Encrypt and store vault
      const vault = await CryptoService.encrypt(mnemonicStr, password);
      localStorage.setItem('vordium_vault', JSON.stringify(vault));
      localStorage.setItem('vordium_wallet_name', walletName || 'My Wallet');
      localStorage.setItem('vordium_created_at', Date.now().toString());
      
      // Derive accounts
      const seed = await CryptoService.mnemonicToSeed(mnemonicStr);
      const evm = await CryptoService.deriveAccount(seed, 'EVM', 0);
      const tron = await CryptoService.deriveAccount(seed, 'TRON', 0);
      const bitcoin = await CryptoService.deriveAccount(seed, 'BITCOIN', 0);
      const solana = await CryptoService.deriveAccount(seed, 'SOLANA', 0);
      
      // Store in Zustand
      const store = useWalletStore.getState();
      store.addAccount({ id: 'evm-0', name: 'Ethereum Account 1', address: evm.address, chain: 'EVM' });
      store.addAccount({ id: 'tron-0', name: 'TRON Account 1', address: tron.address, chain: 'TRON' });
      store.addAccount({ id: 'bitcoin-0', name: 'Bitcoin Account 1', address: bitcoin.address, chain: 'BITCOIN' });
      store.addAccount({ id: 'solana-0', name: 'Solana Account 1', address: solana.address, chain: 'SOLANA' });
      store.selectAccount('evm-0');
      
      // Mark as unlocked
      localStorage.setItem('vordium_unlocked', 'true');
      
      // Clear temp data
      sessionStorage.removeItem('temp_password');
      sessionStorage.removeItem('temp_wallet_name');
      sessionStorage.removeItem('temp_mnemonic');
      
      // Navigate to success
      router.push('/create/success');
    } catch (e) {
      alert('Failed to create wallet: ' + (e as Error).message);
    }
  }

  if (mnemonic.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.push('/create/step-1')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-500">2 of 4</span>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Secret Recovery Phrase</h1>
            <p className="text-gray-600 mt-2">Write down these 24 words in order and store them safely.</p>
          </div>

          {/* Critical Warning Banner */}
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="text-sm text-red-900 space-y-1">
                <p className="font-bold">WARNING: This is your ONLY way to recover your wallet</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Write down these words IN ORDER</li>
                  <li>NEVER share with anyone</li>
                  <li>Store in a safe place (not on your computer)</li>
                  <li>Anyone with these words can steal your funds</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Blur Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Hide/Show Recovery Phrase</span>
            <button
              onClick={() => setIsBlurred(!isBlurred)}
              className="p-2 rounded-lg hover:bg-gray-200 transition"
            >
              {isBlurred ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>

          {/* Seed Phrase Display */}
          <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6">
            {isBlurred && (
              <div className="absolute inset-0 backdrop-blur-lg rounded-xl flex items-center justify-center z-10 bg-black/20">
                <p className="text-white font-medium">Tap to reveal</p>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {mnemonic.map((word, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-3 flex items-center gap-3 hover:shadow-md transition"
                >
                  <span className="text-gray-400 text-sm w-6">{index + 1}.</span>
                  <span className="font-mono text-base font-medium text-gray-900">{word}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-gray-400 rounded-xl py-3 font-medium transition"
            >
              <Copy className="w-5 h-5" />
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-gray-400 rounded-xl py-3 font-medium transition"
            >
              <Download className="w-5 h-5" />
              Download Backup
            </button>
          </div>

          {/* Confirmation Checklist */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Please confirm:</p>
            {[
              { key: 'saved', text: 'I saved my recovery phrase in a secure location' },
              { key: 'understand', text: 'I understand Vordium cannot recover this phrase' },
              { key: 'neverShare', text: 'I understand anyone with this phrase can access my funds' },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-start gap-3 cursor-pointer p-3 hover:bg-gray-50 rounded-lg"
              >
                <input
                  type="checkbox"
                  checked={checks[item.key as keyof typeof checks]}
                  onChange={(e) => setChecks({ ...checks, [item.key]: e.target.checked })}
                  className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{item.text}</span>
              </label>
            ))}
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={!allChecked}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Continue to Verification
          </button>

          {/* Skip Button */}
          <button
            onClick={handleSkip}
            className="w-full text-sm text-gray-500 hover:text-gray-700 underline py-2"
          >
            I&apos;ll do this later
          </button>
        </div>
      </div>
    </main>
  );
}

