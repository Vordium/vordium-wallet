'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useWalletStore } from '@/store/walletStore';
import QRCode from 'react-qr-code';
import { ArrowLeft, Copy, Share2 } from 'lucide-react';

export default function ReceivePage() {
  const router = useRouter();
  const { accounts } = useWalletStore();
  const [selectedChain, setSelectedChain] = useState<'EVM' | 'TRON'>('EVM');
  const [copied, setCopied] = useState(false);

  const current = accounts.find(a => a.chain === selectedChain) || accounts[0];

  function handleCopy() {
    if (current) {
      navigator.clipboard.writeText(current.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleShare() {
    if (navigator.share && current) {
      navigator.share({
        title: `My ${selectedChain} Address`,
        text: current.address,
      });
    }
  }

  if (!current) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-4 py-4 flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Receive</h1>
          <div className="w-9" />
        </div>

        <div className="p-4 space-y-6">
          {/* Token/Network Selector */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Select Network</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedChain('EVM')}
                className={`p-3 rounded-xl border-2 font-medium transition ${
                  selectedChain === 'EVM'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                ⚡ Ethereum
              </button>
              <button
                onClick={() => setSelectedChain('TRON')}
                className={`p-3 rounded-xl border-2 font-medium transition ${
                  selectedChain === 'TRON'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                🔺 TRON
              </button>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 text-center space-y-4">
            <div className="inline-block bg-white p-4 rounded-xl">
              <QRCode value={current.address} size={200} />
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-2">{selectedChain} Address</p>
              <p className="font-mono text-sm text-gray-900 break-all px-2">{current.address}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-gray-400 rounded-xl py-3 font-medium transition"
            >
              <Copy className="w-5 h-5" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-gray-400 rounded-xl py-3 font-medium transition"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </div>

          {/* Warning */}
          <div className={`border-l-4 ${selectedChain === 'EVM' ? 'border-blue-500 bg-blue-50' : 'border-red-500 bg-red-50'} rounded-lg p-4`}>
            <p className="text-sm font-medium text-gray-900 mb-1">⚠️ Important</p>
            <p className="text-sm text-gray-700">
              Only send {selectedChain} assets {selectedChain === 'EVM' ? 'and ERC-20 tokens' : 'and TRC-20 tokens'} to this address.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}


