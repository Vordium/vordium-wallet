'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { isValidAddress, isPositiveNumber } from '@/utils/safety.utils';
import { useWalletStore } from '@/store/walletStore';
import { ArrowLeftIcon, QRCodeIcon, SearchIcon } from '@/components/icons/GrayIcons';
import { BalanceService, type TokenBalance } from '@/services/balance.service';
import { getTrustWalletLogo, NATIVE_LOGOS } from '@/lib/tokenLogos';

function SendPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { accounts } = useWalletStore();
  
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [selectedToken, setSelectedToken] = useState<TokenBalance | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [showReview, setShowReview] = useState(false);
  const [loading, setLoading] = useState(true);

  const evmAccount = accounts.find(a => a.chain === 'EVM');
  const tronAccount = accounts.find(a => a.chain === 'TRON');

  useEffect(() => {
    loadTokens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evmAccount, tronAccount]);

  async function loadTokens() {
    if (!evmAccount || !tronAccount) return;

    try {
      const allTokens = await BalanceService.getAllTokens(evmAccount.address, tronAccount.address);
      const available = allTokens.filter(t => parseFloat(t.balance) > 0);
      setTokens(available);

      // Check if token pre-selected from URL
      const tokenSymbol = searchParams.get('token');
      if (tokenSymbol) {
        const token = available.find(t => t.symbol === tokenSymbol);
        if (token) setSelectedToken(token);
      }
    } catch (error) {
      console.error('Failed to load tokens:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredTokens = tokens.filter(
    t =>
      t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function validate() {
    if (!selectedToken) return 'Select a token';
    if (!to.trim()) return 'Recipient required';
    const chain = selectedToken.chain === 'Ethereum' ? 'EVM' : 'TRON';
    if (!isValidAddress(to, chain)) return `Invalid ${selectedToken.chain} address`;
    if (!amount || !isPositiveNumber(amount)) return 'Enter a valid amount';
    if (parseFloat(amount) > parseFloat(selectedToken.balance)) return 'Insufficient balance';
    return '';
  }

  function onReview() {
    const e = validate();
    setError(e);
    if (!e) setShowReview(true);
  }

  function onConfirmSend() {
    alert('Transaction signing will be implemented. This requires password prompt and blockchain interaction.');
    setShowReview(false);
    router.push('/dashboard');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-600 border-t-transparent"></div>
      </div>
    );
  }

  // Token Selection View
  if (!selectedToken) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-4 py-4 flex items-center justify-between z-10">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-700 rounded-lg">
            <ArrowLeftIcon className="w-5 h-5 text-gray-300" />
          </button>
          <h1 className="text-lg font-semibold text-white">Select Asset</h1>
          <div className="w-9" />
        </div>

        <div className="p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search token..."
              className="w-full border border-gray-600 bg-gray-700 text-white rounded-2xl pl-10 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>

          {/* Token List */}
          <div className="space-y-1">
            {filteredTokens.map((token) => {
              const logoUrl = token.isNative ? NATIVE_LOGOS[token.symbol] : getTrustWalletLogo(token.chain, token.address || '');

              return (
                <button
                  key={`${token.chain}-${token.symbol}-${token.address || 'native'}`}
                  onClick={() => setSelectedToken(token)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-gray-700 rounded-2xl transition"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-xl">
                    {token.symbol.charAt(0)}
                  </div>

                  <div className="flex-1 text-left">
                    <div className="font-semibold text-white">{token.symbol}</div>
                    <div className="text-sm text-gray-400">{token.name} • {token.chain}</div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold text-white">{parseFloat(token.balance).toFixed(4)}</div>
                    <div className="text-sm text-gray-400">${token.usdValue}</div>
                  </div>
                </button>
              );
            })}

            {filteredTokens.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No tokens found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Send Form View
  const fromAccount = selectedToken.chain === 'Ethereum' ? evmAccount : tronAccount;
  const logoUrl = selectedToken.isNative ? NATIVE_LOGOS[selectedToken.symbol] : getTrustWalletLogo(selectedToken.chain, selectedToken.address || '');

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-4 py-4 flex items-center justify-between z-10">
        <button onClick={() => setSelectedToken(null)} className="p-2 hover:bg-gray-700 rounded-lg">
          <ArrowLeftIcon className="w-5 h-5 text-gray-300" />
        </button>
        <h1 className="text-lg font-semibold text-white">Send {selectedToken.symbol}</h1>
        <div className="w-9" />
      </div>

      <div className="p-4 space-y-6">
        {/* Selected Token Display */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
              {selectedToken.icon || selectedToken.symbol.charAt(0)}
            </div>
            <div>
              <div className="font-semibold">{selectedToken.symbol}</div>
              <div className="text-sm text-gray-500">{selectedToken.chain}</div>
            </div>
          </div>
          <button onClick={() => setSelectedToken(null)} className="text-sm text-blue-600">Change</button>
        </div>

        {/* To Address */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">To</label>
          <div className="relative">
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder={`Enter ${selectedToken.chain} address`}
              className="w-full border border-gray-300 rounded-2xl p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
              <QRCodeIcon className="w-5 h-5 text-gray-500" />
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
              className="flex-1 border border-gray-300 rounded-2xl p-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setAmount(selectedToken.balance)}
              className="px-5 bg-gray-100 hover:bg-gray-200 rounded-2xl font-semibold"
            >
              Max
            </button>
          </div>
          <p className="text-sm text-gray-500">
            ≈ ${amount ? (parseFloat(amount) * parseFloat(selectedToken.usdValue) / parseFloat(selectedToken.balance)).toFixed(2) : '0.00'}
          </p>
          <p className="text-xs text-gray-500">
            Available: {parseFloat(selectedToken.balance).toFixed(4)} {selectedToken.symbol}
          </p>
        </div>

        {/* Fee */}
        <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Network Fee</span>
            <span className="font-medium">~0.002 {selectedToken.chain === 'Ethereum' ? 'ETH' : 'TRX'}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{(parseFloat(amount) || 0).toFixed(4)} {selectedToken.symbol}</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">{error}</div>
        )}

        <button
          onClick={onReview}
          className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold transition"
        >
          Review
        </button>
      </div>

      {/* Review Modal */}
      {showReview && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowReview(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold">Review Transaction</h3>

            <div className="space-y-3 bg-gray-50 rounded-2xl p-4">
              <div className="flex justify-between">
                <span className="text-gray-600">From</span>
                <span className="font-mono text-sm">{fromAccount?.address.slice(0, 10)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">To</span>
                <span className="font-mono text-sm">{to.slice(0, 10)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount</span>
                <span className="font-semibold">{amount} {selectedToken.symbol}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Network Fee</span>
                <span>~0.002 {selectedToken.chain === 'Ethereum' ? 'ETH' : 'TRX'}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>{(parseFloat(amount) + 0.002).toFixed(4)} {selectedToken.symbol}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReview(false)}
                className="flex-1 border-2 border-gray-300 hover:border-gray-400 rounded-2xl py-3 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={onConfirmSend}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-3 font-semibold"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SendPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    }>
      <SendPageContent />
    </Suspense>
  );
}
