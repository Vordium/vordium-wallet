'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { isValidAddress, isPositiveNumber } from '@/utils/safety.utils';
import { useWalletStore } from '@/store/walletStore';
import { ArrowLeft, QrCode } from 'lucide-react';

export default function SendPage() {
  const router = useRouter();
  const { accounts } = useWalletStore();
  const [selectedChain, setSelectedChain] = useState<'EVM' | 'TRON'>('EVM');
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [showReview, setShowReview] = useState(false);

  const from = accounts.find(a => a.chain === selectedChain);

  function validate() {
    if (!from) return 'No account selected';
    if (!to.trim()) return 'Recipient required';
    if (!isValidAddress(to, from.chain)) return `Invalid ${from.chain} address`;
    if (!amount || !isPositiveNumber(amount)) return 'Enter a valid amount';
    return '';
  }

  function onReview() {
    const e = validate();
    setError(e);
    if (!e) {
      setShowReview(true);
    }
  }

  function onConfirmSend() {
    alert('Transaction signing coming soon. This will prompt for password and send the transaction.');
    setShowReview(false);
    router.push('/dashboard');
  }

  if (!from) {
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
          <h1 className="text-lg font-semibold">Send</h1>
          <div className="w-9" />
        </div>

        <div className="p-4 space-y-6">
          {/* Network Selector */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Network</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedChain('EVM')}
                className={`p-3 rounded-xl border-2 font-medium transition ${
                  selectedChain === 'EVM'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                ⚡ {from.chain === 'EVM' ? 'Ethereum' : 'Ethereum'}
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

          {/* From Account */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">From</p>
            <p className="font-medium text-gray-900">{from.name}</p>
            <p className="text-xs text-gray-500 font-mono">{from.address.slice(0, 10)}...{from.address.slice(-8)}</p>
          </div>

          {/* Recipient */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">To Address</label>
            <div className="relative">
              <input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder={`Enter ${selectedChain} address`}
                className="w-full border border-gray-300 rounded-lg p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded">
                <QrCode className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Amount</label>
            <div className="flex gap-2">
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                type="number"
                step="any"
                className="flex-1 border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              />
              <button
                onClick={() => setAmount('0')}
                className="px-4 border-2 border-gray-300 hover:border-gray-400 rounded-lg font-medium"
              >
                Max
              </button>
            </div>
            <p className="text-sm text-gray-500">≈ $0.00</p>
            <p className="text-xs text-gray-500">Available: 0.00 {selectedChain === 'EVM' ? 'ETH' : 'TRX'}</p>
          </div>

          {/* Fee Estimate */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Network Fee</span>
              <span className="font-medium text-gray-900">~0.002 {selectedChain === 'EVM' ? 'ETH' : 'TRX'}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">{(Number(amount) || 0).toFixed(4)} {selectedChain === 'EVM' ? 'ETH' : 'TRX'}</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Review Button */}
          <button
            onClick={onReview}
            className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Review
          </button>
        </div>

        {/* Review Modal */}
        {showReview && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowReview(false)}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-semibold text-gray-900">Review Transaction</h3>
              
              <div className="space-y-3 bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">From</span>
                  <span className="font-mono text-gray-900">{from.address.slice(0, 10)}...</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">To</span>
                  <span className="font-mono text-gray-900">{to.slice(0, 10)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-semibold text-gray-900">{amount} {selectedChain === 'EVM' ? 'ETH' : 'TRX'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Network Fee</span>
                  <span className="text-gray-900">~0.002 {selectedChain === 'EVM' ? 'ETH' : 'TRX'}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">{(Number(amount) + 0.002).toFixed(4)} {selectedChain === 'EVM' ? 'ETH' : 'TRX'}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowReview(false)}
                  className="flex-1 border-2 border-gray-300 hover:border-gray-400 rounded-xl py-3 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirmSend}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-semibold"
                >
                  Confirm & Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}


