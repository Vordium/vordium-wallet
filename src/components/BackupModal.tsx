'use client';

import { useState, useEffect } from 'react';
import { ArrowLeftIcon, CopyIcon, CheckIcon, AlertTriangleIcon, EyeIcon, EyeOffIcon } from './icons/GrayIcons';
import { PINVerification } from './PINVerification';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  mnemonic?: string;
}

export function BackupModal({ isOpen, onClose, mnemonic }: BackupModalProps) {
  const [step, setStep] = useState<'warning' | 'pin' | 'reveal' | 'confirm'>('warning');
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmWords, setConfirmWords] = useState<string[]>([]);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && mnemonic) {
      const words = mnemonic.split(' ');
      setShuffledWords([...words].sort(() => Math.random() - 0.5));
      setConfirmWords([]);
      setSelectedWords([]);
      setStep('warning');
    }
  }, [isOpen, mnemonic]);

  const handleCopy = async () => {
    if (mnemonic) {
      await navigator.clipboard.writeText(mnemonic);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWordSelect = (word: string) => {
    if (selectedWords.includes(word)) return;
    
    const newSelected = [...selectedWords, word];
    setSelectedWords(newSelected);
    
    if (newSelected.length === 3) {
      const isCorrect = newSelected.every((word, index) => 
        word === mnemonic?.split(' ')[index]
      );
      
      if (isCorrect) {
        setStep('confirm');
      } else {
        setSelectedWords([]);
        alert('Incorrect order. Please try again.');
      }
    }
  };

  const handleStartBackup = () => {
    setStep('pin');
  };

  const handlePINSuccess = () => {
    setStep('reveal');
  };

  const handleReveal = () => {
    setShowMnemonic(true);
  };

  const handleNext = () => {
    if (step === 'warning') {
      handleStartBackup();
    } else if (step === 'reveal') {
      setStep('confirm');
    }
  };

  if (!isOpen || !mnemonic) return null;

  const words = mnemonic.split(' ');

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
        <div className="bg-gray-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gray-700 p-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-gray-600 hover:bg-gray-500 flex items-center justify-center transition"
              >
                <ArrowLeftIcon className="w-5 h-5 text-white" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-white">Backup Recovery Phrase</h2>
                <p className="text-gray-300 text-sm">
                  {step === 'warning' && 'Secure your wallet'}
                  {step === 'pin' && 'Verify your identity'}
                  {step === 'reveal' && 'Write down your phrase'}
                  {step === 'confirm' && 'Verify your backup'}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {step === 'warning' && (
              <div className="space-y-4">
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangleIcon className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-400 mb-2">Important Security Information</h3>
                      <ul className="text-red-300 text-sm space-y-1">
                        <li>• Never share your recovery phrase with anyone</li>
                        <li>• Store it in a secure, offline location</li>
                        <li>• Anyone with this phrase can access your wallet</li>
                        <li>• We cannot recover your funds if you lose this phrase</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-gray-300 mb-4">
                    Your recovery phrase is the only way to restore your wallet if you lose access to this device.
                  </p>
                  <button
                    onClick={handleNext}
                    className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-500 transition"
                  >
                    I Understand, Continue
                  </button>
                </div>
              </div>
            )}

            {step === 'reveal' && (
              <div className="space-y-4">
                <div className="bg-gray-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white">Your Recovery Phrase</h3>
                    <button
                      onClick={() => setShowMnemonic(!showMnemonic)}
                      className="flex items-center gap-2 text-gray-400 hover:text-white transition"
                    >
                      {showMnemonic ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      {showMnemonic ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  
                  {showMnemonic ? (
                    <div className="grid grid-cols-3 gap-2">
                      {words.map((word, index) => (
                        <div key={index} className="bg-gray-600 rounded-lg p-3 text-center">
                          <span className="text-xs text-gray-400">{index + 1}</span>
                          <div className="text-white font-mono text-sm">{word}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {words.map((_, index) => (
                        <div key={index} className="bg-gray-600 rounded-lg p-3 text-center">
                          <span className="text-xs text-gray-400">{index + 1}</span>
                          <div className="text-gray-500 font-mono text-sm">••••••</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {showMnemonic && (
                  <div className="flex gap-3">
                    <button
                      onClick={handleCopy}
                      className="flex-1 py-3 px-4 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-500 transition flex items-center justify-center gap-2"
                    >
                      <CopyIcon className="w-4 h-4" />
                      {copied ? 'Copied!' : 'Copy Phrase'}
                    </button>
                    <button
                      onClick={handleNext}
                      className="flex-1 py-3 px-4 bg-gray-500 text-white font-semibold rounded-xl hover:bg-gray-400 transition"
                    >
                      I've Saved It
                    </button>
                  </div>
                )}
              </div>
            )}

            {step === 'confirm' && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-semibold text-white mb-2">Verify Your Backup</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Select the words in the correct order to confirm you've saved them.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-700 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Selected Words:</h4>
                    <div className="flex gap-2 flex-wrap">
                      {selectedWords.map((word, index) => (
                        <div key={index} className="bg-gray-600 px-3 py-1 rounded-lg text-white text-sm">
                          {index + 1}. {word}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Select Words:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {shuffledWords.map((word, index) => (
                        <button
                          key={index}
                          onClick={() => handleWordSelect(word)}
                          disabled={selectedWords.includes(word)}
                          className="p-3 bg-gray-600 rounded-lg text-white text-sm hover:bg-gray-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {word}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setStep('reveal')}
                    className="flex-1 py-3 px-4 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-500 transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 px-4 bg-gray-500 text-white font-semibold rounded-xl hover:bg-gray-400 transition flex items-center justify-center gap-2"
                  >
                    <CheckIcon className="w-4 h-4" />
                    Complete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PIN Verification Modal */}
      <PINVerification
        isOpen={step === 'pin'}
        onClose={() => setStep('warning')}
        onSuccess={handlePINSuccess}
        title="Verify PIN"
        subtitle="Enter your PIN to view your recovery phrase"
      />
    </>
  );
}
