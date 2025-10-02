'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { useWalletStore } from '@/store/walletStore';
import QRCode from 'react-qr-code';
import { ArrowLeftIcon, CopyIcon, ShareIcon, SearchIcon } from '@/components/icons/GrayIcons';
import { BalanceService, type TokenBalance } from '@/services/balance.service';
import { TokenRowSkeleton } from '@/components/ui/Skeleton';
import { getTrustWalletLogo, NATIVE_LOGOS } from '@/lib/tokenLogos';

function ReceivePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { accounts } = useWalletStore();
  
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [selectedToken, setSelectedToken] = useState<TokenBalance | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
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
      setTokens(allTokens);

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

  const filteredTokens = tokens.filter(
    t =>
      t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentAddress = selectedToken
    ? selectedToken.chain === 'Ethereum'
      ? evmAccount?.address
      : tronAccount?.address
    : '';

  function handleCopy() {
    if (currentAddress) {
      navigator.clipboard.writeText(currentAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleShare() {
    if (navigator.share && currentAddress) {
      navigator.share({
        title: `My ${selectedToken?.chain} Address`,
        text: currentAddress,
      });
    }
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
      <div className="min-h-screen bg-white">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between z-10">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-50 rounded-lg">
            <ArrowLeftIcon className="w-5 h-5 text-gray-300" />
          </button>
          <h1 className="text-lg font-semibold">Select Asset</h1>
          <div className="w-9" />
        </div>

        <div className="p-4 space-y-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search token..."
              className="w-full border border-gray-300 rounded-2xl pl-10 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            {filteredTokens.map((token) => {
              const logoUrl = token.icon || `https://via.placeholder.com/48/6B7280/FFFFFF?text=${token.symbol.charAt(0)}`;

              return (
                <button
                  key={`${token.chain}-${token.symbol}-${token.address || 'native'}`}
                  onClick={() => setSelectedToken(token)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-gray-700 hover:shadow-lg hover:shadow-gray-700/50 rounded-2xl transition-all duration-200"
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
                    <div className="font-semibold text-white">
                      {parseFloat(token.balance).toFixed(4)}
                    </div>
                    <div className="text-sm text-gray-400">
                      ${parseFloat(token.usdValue).toFixed(2)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Receive View
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-4 py-4 flex items-center justify-between z-10">
        <button onClick={() => setSelectedToken(null)} className="p-2 hover:bg-gray-700 rounded-lg">
          <ArrowLeftIcon className="w-5 h-5 text-gray-300" />
        </button>
        <h1 className="text-lg font-semibold text-white">Receive {selectedToken.symbol}</h1>
        <div className="w-9" />
      </div>

      <div className="p-4 space-y-6">
        <div className="text-center space-y-4">
          <div className="inline-block bg-white p-6 rounded-3xl border-2 border-gray-200">
            <QRCode value={currentAddress || ''} size={220} />
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">{selectedToken.chain} Address</p>
            <p className="font-mono text-sm text-gray-900 break-all px-4">{currentAddress}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-gray-400 rounded-2xl py-4 font-semibold transition"
          >
            <CopyIcon className="w-5 h-5 text-gray-300" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-gray-400 rounded-2xl py-4 font-semibold transition"
          >
            <ShareIcon className="w-5 h-5 text-gray-300" />
            Share
          </button>
        </div>

        <div
          className={`border-l-4 ${
            selectedToken.chain === 'Ethereum' ? 'border-blue-500 bg-blue-50' : 'border-red-500 bg-red-50'
          } rounded-2xl p-4`}
        >
          <p className="text-sm font-semibold text-gray-900 mb-1">⚠️ Important</p>
          <p className="text-sm text-gray-700">
            Only send {selectedToken.chain} assets{' '}
            {selectedToken.chain === 'Ethereum' ? 'and ERC-20 tokens' : 'and TRC-20 tokens'} to this address.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ReceivePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    }>
      <ReceivePageContent />
    </Suspense>
  );
}
