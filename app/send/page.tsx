'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { isValidAddress, isPositiveNumber } from '@/utils/safety.utils';
import { useWalletStore } from '@/store/walletStore';
import { ArrowLeftIcon, QRCodeIcon, SearchIcon } from '@/components/icons/GrayIcons';
import { BalanceService, type TokenBalance } from '@/services/balance.service';
import { TokenRowSkeleton, FormInputSkeleton } from '@/components/ui/Skeleton';
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
      console.log('Loading tokens for send page...');
      const allTokens = await BalanceService.getAllTokens(evmAccount.address, tronAccount.address);
      console.log('Loaded tokens:', allTokens);
      
      // Show all tokens, but we'll indicate which ones have insufficient balance in the UI
      setTokens(allTokens);

      // Check if token pre-selected from URL
      const tokenSymbol = searchParams.get('token');
      if (tokenSymbol) {
        const token = allTokens.find(t => t.symbol === tokenSymbol);
        if (token) setSelectedToken(token);
      }
    } catch (error) {
      console.error('Failed to load tokens:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredTokens = tokens
    .filter(
      t =>
        t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // Sort by balance (tokens with balance first)
      const aHasBalance = parseFloat(a.balance) > 0;
      const bHasBalance = parseFloat(b.balance) > 0;
      
      if (aHasBalance && !bHasBalance) return -1;
      if (!aHasBalance && bHasBalance) return 1;
      
      // If both have balance or both don't, sort by USD value descending
      return parseFloat(b.usdValue) - parseFloat(a.usdValue);
    });

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
      <div className="min-h-screen bg-gray-900">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-4 py-4 flex items-center justify-between z-10">
          <div className="w-9 h-9 bg-gray-600 rounded-lg animate-pulse"></div>
          <div className="h-6 w-24 bg-gray-600 rounded animate-pulse"></div>
          <div className="w-9"></div>
        </div>
        <div className="p-4 space-y-4">
          <div className="h-12 w-full bg-gray-700 rounded-xl animate-pulse"></div>
          <div className="space-y-1">
            {[1, 2, 3, 4, 5].map(i => (
              <TokenRowSkeleton key={i} />
            ))}
          </div>
        </div>
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
            {filteredTokens.length > 0 && (
              <div className="px-2 py-1">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Available Tokens ({filteredTokens.filter(t => parseFloat(t.balance) > 0).length} with balance)
                </div>
              </div>
            )}
              {filteredTokens.map((token) => {
                const logoUrl = token.icon || `https://via.placeholder.com/48/6B7280/FFFFFF?text=${token.symbol.charAt(0)}`;
                const hasBalance = parseFloat(token.balance) > 0;
                const balanceNum = parseFloat(token.balance);
                const usdValueNum = parseFloat(token.usdValue);
                
                return (
                  <button
                    key={`${token.chain}-${token.symbol}-${token.address || 'native'}`}
                    onClick={() => setSelectedToken(token)}
                    className={`w-full flex items-center gap-3 p-4 hover:bg-gray-700 hover:shadow-lg hover:shadow-gray-700/50 rounded-2xl transition-all duration-200 ${
                      !hasBalance ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <img
                        src={logoUrl}
                        alt={token.symbol}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = `https://via.placeholder.com/48/6B7280/FFFFFF?text=${token.symbol.charAt(0)}`;
                        }}
                      />
                      {!token.isNative && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gray-800 border-2 border-gray-900 flex items-center justify-center text-xs">
                          <span className="text-gray-300">{token.chain === 'Ethereum' ? 'E' : 'T'}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 text-left min-w-0">
                      <div className="font-semibold text-white truncate">{token.symbol}</div>
                      <div className="text-sm text-gray-400 truncate">{token.name}</div>
                      {!token.isNative && (
                        <div className="text-xs text-gray-500 mt-0.5">{token.chain}</div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className={`font-semibold ${hasBalance ? 'text-white' : 'text-gray-500'}`}>
                        {balanceNum.toFixed(4)}
                      </div>
                      <div className={`text-sm ${hasBalance ? 'text-gray-400' : 'text-gray-600'}`}>
                        ${usdValueNum.toFixed(2)}
                      </div>
                      {!hasBalance && (
                        <div className="text-xs text-gray-600 mt-0.5">No balance</div>
                      )}
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
        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-2xl border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 flex-shrink-0">
              <img
                src={selectedToken.icon || `https://via.placeholder.com/48/6B7280/FFFFFF?text=${selectedToken.symbol.charAt(0)}`}
                alt={selectedToken.symbol}
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://via.placeholder.com/48/6B7280/FFFFFF?text=${selectedToken.symbol.charAt(0)}`;
                }}
              />
              {!selectedToken.isNative && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gray-800 border-2 border-gray-900 flex items-center justify-center text-xs">
                  <span className="text-gray-300">{selectedToken.chain === 'Ethereum' ? 'E' : 'T'}</span>
                </div>
              )}
            </div>
            <div>
              <div className="font-semibold text-white">{selectedToken.symbol}</div>
              <div className="text-sm text-gray-400">{selectedToken.name}</div>
              <div className="text-xs text-gray-500">Balance: {parseFloat(selectedToken.balance).toFixed(4)}</div>
            </div>
          </div>
          <button 
            onClick={() => setSelectedToken(null)} 
            className="text-sm text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-1 rounded-lg transition"
          >
            Change
          </button>
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
