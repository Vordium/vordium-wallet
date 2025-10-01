'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/walletStore';
import QRCode from 'react-qr-code';
import { RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { AddTokenModal } from '@/components/AddTokenModal';
import { BalanceService, type TokenBalance } from '@/services/balance.service';
import { getTrustWalletLogo, NATIVE_LOGOS } from '@/lib/tokenLogos';

export default function DashboardPage() {
  const router = useRouter();
  const { accounts } = useWalletStore();
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [totalBalance, setTotalBalance] = useState('0.00');
  const [change24h, setChange24h] = useState({ value: '0.00', percent: '0.00' });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddToken, setShowAddToken] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [copied, setCopied] = useState('');
  const [mounted, setMounted] = useState(false);

  const evmAccount = accounts.find(a => a.chain === 'EVM');
  const tronAccount = accounts.find(a => a.chain === 'TRON');

  useEffect(() => {
    setMounted(true);
    const unlocked = localStorage.getItem('vordium_unlocked') === 'true';
    if (!unlocked) {
      router.replace('/unlock');
      return;
    }

    if (evmAccount && tronAccount) {
      loadWalletData();
      const interval = setInterval(() => loadWalletData(true), 30000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, evmAccount, tronAccount]);

  async function loadWalletData(silent = false) {
    if (!evmAccount || !tronAccount) return;
    
    if (!silent) setLoading(true);
    setRefreshing(true);

    try {
      const allTokens = await BalanceService.getAllTokens(evmAccount.address, tronAccount.address);
      setTokens(allTokens);
      
      const total = await BalanceService.getTotalBalance(allTokens);
      setTotalBalance(total);
      
      // TODO: Calculate 24h change
      setChange24h({ value: '0.00', percent: '0.00' });
    } catch (error) {
      console.error('Failed to load wallet data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  if (!mounted || !evmAccount || !tronAccount) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const isPositive = parseFloat(change24h.percent) >= 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <button
          onClick={() => setShowAddressModal(true)}
          className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold"
        >
          {(localStorage.getItem('vordium_wallet_name') || 'M')[0]}
        </button>
        <div className="flex gap-2">
          <Link href="/settings">
            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">⚙️</button>
          </Link>
          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">🔔</button>
        </div>
      </div>

      {/* Total Balance */}
      <div className="text-center py-8 px-4">
        <div className="text-5xl font-bold mb-2">
          ${loading ? '...' : totalBalance}
        </div>
        <div className={`text-lg font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}${change24h.value} ({change24h.percent}%)
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-4 gap-3">
          <ActionButton icon="📤" label="Send" onClick={() => router.push('/send')} />
          <ActionButton icon="📥" label="Receive" onClick={() => router.push('/receive')} />
          <ActionButton icon="💳" label="Buy" onClick={() => {}} disabled />
          <ActionButton icon="🔄" label="Swap" onClick={() => {}} disabled />
        </div>
      </div>

      {/* Tokens Section */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Tokens</h2>
          <div className="flex gap-2">
            <button
              onClick={() => loadWalletData()}
              disabled={refreshing}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">🔍</button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-1">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-50 rounded-2xl h-20 animate-pulse" />
            ))}
          </div>
        ) : tokens.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No tokens found</p>
            <p className="text-sm mt-2">Receive crypto to get started</p>
          </div>
        ) : (
          <div className="space-y-1">
            {tokens.map((token) => {
              const logoUrl = token.isNative
                ? NATIVE_LOGOS[token.symbol]
                : getTrustWalletLogo(token.chain, token.address || '');
              
              return (
                <TokenRow
                  key={`${token.chain}-${token.symbol}-${token.address || 'native'}`}
                  token={token}
                  logoUrl={logoUrl}
                  onClick={() => router.push(`/token/${token.chain.toLowerCase()}/${token.address || 'native'}/${token.symbol}`)}
                />
              );
            })}
          </div>
        )}

        {/* Add Token */}
        <button
          onClick={() => setShowAddToken(true)}
          className="w-full mt-4 py-4 border-2 border-dashed border-gray-300 rounded-2xl text-blue-600 font-semibold hover:bg-blue-50 transition"
        >
          + Add Token
        </button>
      </div>

      {/* Modals */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddressModal(false)}>
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold">Your Addresses</h2>
            
            {[
              { name: 'Ethereum', icon: '⚡', account: evmAccount },
              { name: 'TRON', icon: '🔺', account: tronAccount },
            ].map((item) => (
              <div key={item.name} className="border-2 border-gray-100 rounded-2xl p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-lg">
                  <span>{item.icon}</span>
                  {item.name}
                </h3>
                <div className="bg-white inline-block p-3 rounded-xl border border-gray-200">
                  <QRCode value={item.account.address} size={150} />
                </div>
                <p className="text-xs font-mono mt-3 break-all text-gray-600">{item.account.address}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(item.account.address);
                    setCopied(item.name);
                    setTimeout(() => setCopied(''), 2000);
                  }}
                  className="mt-3 w-full py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
                >
                  {copied === item.name ? 'Copied!' : 'Copy Address'}
                </button>
              </div>
            ))}
            
            <button
              onClick={() => setShowAddressModal(false)}
              className="w-full py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      {showAddToken && (
        <AddTokenModal
          chain="EVM"
          onClose={() => setShowAddToken(false)}
          onAdd={() => setShowAddToken(false)}
        />
      )}
    </div>
  );
}

function ActionButton({ icon, label, onClick, disabled = false }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center gap-2 py-4 bg-gray-50 rounded-2xl hover:bg-gray-100 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-semibold text-gray-700">{label}</span>
    </button>
  );
}

function TokenRow({ token, logoUrl, onClick }: { token: TokenBalance; logoUrl: string; onClick: () => void }) {
  const [logoError, setLogoError] = useState(false);

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 py-3 px-2 hover:bg-gray-50 rounded-2xl transition active:scale-98"
    >
      <div className="relative w-12 h-12 flex-shrink-0">
        {!logoError && logoUrl ? (
          <img
            src={logoUrl}
            alt={token.symbol}
            className="w-full h-full rounded-full"
            onError={() => setLogoError(true)}
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
            {token.symbol.charAt(0)}
          </div>
        )}
        
        {!token.isNative && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border-2 border-white flex items-center justify-center text-xs">
            {token.chain === 'Ethereum' ? '⚡' : '🔺'}
          </div>
        )}
      </div>

      <div className="flex-1 text-left min-w-0">
        <div className="font-semibold text-gray-900 truncate">{token.symbol}</div>
        <div className="text-sm text-gray-500 truncate">{token.name}</div>
        {!token.isNative && (
          <div className="text-xs text-gray-400 mt-0.5">{token.chain}</div>
        )}
      </div>

      <div className="text-right">
        <div className="font-semibold text-gray-900">
          {parseFloat(token.balance).toFixed(4)}
        </div>
        <div className="text-sm text-gray-500">
          ${token.usdValue}
        </div>
      </div>
    </button>
  );
}
