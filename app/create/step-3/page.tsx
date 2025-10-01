'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface VerificationWord {
  position: number;
  correctWord: string;
  options: string[];
}

// Common BIP39 words for wrong options
const COMMON_WORDS = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
  'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
  'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
  'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
];

export default function CreateStep3() {
  const router = useRouter();
  const [mnemonic, setMnemonic] = useState<string[]>([]);
  const [verifications, setVerifications] = useState<VerificationWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState<boolean[]>([]);

  useEffect(() => {
    const storedMnemonic = sessionStorage.getItem('temp_mnemonic');
    if (!storedMnemonic) {
      router.push('/create/step-1');
      return;
    }
    
    const words = storedMnemonic.split(' ');
    setMnemonic(words);
    
    // Generate 3 random positions
    const positions: number[] = [];
    while (positions.length < 3) {
      const pos = Math.floor(Math.random() * 24);
      if (!positions.includes(pos)) {
        positions.push(pos);
      }
    }
    
    // Create verification objects
    const verifs = positions.map(pos => {
      const correctWord = words[pos];
      // Generate wrong options
      const wrongWords = COMMON_WORDS
        .filter(w => w !== correctWord)
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);
      
      // Combine and shuffle
      const options = [correctWord, ...wrongWords].sort(() => Math.random() - 0.5);
      
      return {
        position: pos,
        correctWord,
        options,
      };
    });
    
    setVerifications(verifs);
    setCompleted(new Array(3).fill(false));
  }, [router]);

  const currentVerification = verifications[currentIndex];

  function handleSelect(word: string) {
    setSelected(word);
    setError('');
    
    if (word === currentVerification.correctWord) {
      // Correct!
      const newCompleted = [...completed];
      newCompleted[currentIndex] = true;
      setCompleted(newCompleted);
      
      setTimeout(() => {
        if (currentIndex < 2) {
          setCurrentIndex(currentIndex + 1);
          setSelected(null);
        } else {
          // All done! Complete wallet creation
          handleComplete();
        }
      }, 500);
    } else {
      // Wrong!
      setError('Incorrect word, please try again');
      setAttempts(attempts + 1);
      setTimeout(() => {
        setSelected(null);
        setError('');
      }, 1000);
    }
  }

  async function handleComplete() {
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
      localStorage.setItem('vordium_verified', 'true');
      
      // Derive accounts
      const seed = await CryptoService.mnemonicToSeed(mnemonicStr);
      const evm = await CryptoService.deriveAccount(seed, 'EVM', 0);
      const tron = await CryptoService.deriveAccount(seed, 'TRON', 0);
      
      // Store in Zustand
      const store = useWalletStore.getState();
      store.addAccount({ id: 'evm-0', name: 'Ethereum Account 1', address: evm.address, chain: 'EVM' });
      store.addAccount({ id: 'tron-0', name: 'TRON Account 1', address: tron.address, chain: 'TRON' });
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

  if (!currentVerification) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.push('/create/step-2')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-500">3 of 4</span>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Verify Recovery Phrase</h1>
            <p className="text-gray-600 mt-2">Select the correct word for each position</p>
          </div>

          {/* Progress Tracker */}
          <div className="flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                  completed[i]
                    ? 'bg-green-500 text-white'
                    : i === currentIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {completed[i] ? '✓' : i + 1}
              </div>
            ))}
          </div>

          {/* Current Verification */}
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">
                What is word #{currentVerification.position + 1}?
              </p>
              <p className="text-sm text-gray-500 mt-1">{currentIndex + 1} of 3</p>
            </div>

            {/* Word Options */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {currentVerification.options.map((word) => {
                const isSelected = selected === word;
                const isCorrect = isSelected && word === currentVerification.correctWord;
                const isWrong = isSelected && word !== currentVerification.correctWord;
                
                return (
                  <button
                    key={word}
                    onClick={() => !selected && handleSelect(word)}
                    disabled={!!selected}
                    className={`p-4 rounded-xl border-2 font-mono text-base font-medium transition transform hover:scale-105 ${
                      isCorrect
                        ? 'bg-green-100 border-green-500 text-green-900'
                        : isWrong
                        ? 'bg-red-100 border-red-500 text-red-900 animate-shake'
                        : isSelected
                        ? 'bg-blue-100 border-blue-500 text-blue-900'
                        : 'bg-white border-gray-300 hover:border-gray-400 text-gray-900'
                    }`}
                  >
                    {word}
                    {isCorrect && ' ✓'}
                    {isWrong && ' ✗'}
                  </button>
                );
              })}
            </div>

            {error && (
              <p className="text-center text-sm text-red-600 font-medium">{error}</p>
            )}
          </div>

          {/* Help Text */}
          {attempts >= 3 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
              <p className="text-sm text-amber-900 mb-2">Having trouble?</p>
              <button
                onClick={() => router.push('/create/step-2')}
                className="text-sm text-amber-700 underline font-medium"
              >
                Review Recovery Phrase
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

