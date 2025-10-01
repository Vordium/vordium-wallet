'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/walletStore';
import QRCode from 'react-qr-code';
import { Settings, Copy, Plus, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { AddTokenModal } from '@/components/AddTokenModal';
import { BalanceService, type TokenBalance } from '@/services/balance.service';

export default function DashboardPage() {
  const router = useRouter();
  const { accounts } = useWalletStore();
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [totalBalance, setTotalBalance] = useState('0.00');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAddToken, setShowAddToken] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
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
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(() => loadWalletData(true), 30000);
      return () => clearInterval(interval);
    }
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
    } catch (error) {
      console.error('Failed to load wallet data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  if (!mounted || !evmAccount || !tronAccount) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-white">Vordium</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadWalletData()}
                disabled={refreshing}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <RefreshCw className={`w-5 h-5 text-white ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <Link href="/settings">
                <button className="p-2 hover:bg-white/10 rounded-lg">
                  <Settings className="w-5 h-5 text-white" />
                </button>
              </Link>
            </div>
          </div>

          <div className="text-center text-white mb-4">
            <p className="text-sm opacity-90">
              {localStorage.getItem('vordium_wallet_name') || 'My Wallet'}
            </p>
            <button
              onClick={() => setShowAddressModal(true)}
              className="text-sm opacity-80 hover:opacity-100 underline mt-1"
            >
              View Addresses
            </button>
          </div>
        </div>

        <div className="px-4 -mt-8 space-y-4">
          {/* Total Balance Card */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Total Balance</p>
            <p className="text-4xl font-bold">${loading ? '...' : totalBalance}</p>
            <p className="text-sm opacity-75 mt-1">All Chains</p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/send">
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl py-3 flex items-center justify-center gap-2 font-medium">
                <ArrowUp className="w-5 h-5" />
                Send
              </button>
            </Link>
            <Link href="/receive">
              <button className="w-full border-2 border-gray-300 hover:border-gray-400 rounded-xl py-3 flex items-center justify-center gap-2 font-medium">
                <ArrowDown className="w-5 h-5" />
                Receive
              </button>
            </Link>
          </div>

          {/* Tokens Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span>💰</span>
                Assets
              </h2>
              <button onClick={() => setShowAddToken(true)} className="p-1 hover:bg-gray-100 rounded-lg">
                <Plus className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-gray-100 rounded-xl h-20 animate-pulse" />
                ))}
              </div>
            ) : tokens.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
                <p className="text-sm">No tokens found</p>
                <p className="text-xs mt-1">Receive crypto to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tokens.map((token, index) => (
                  <div
                    key={`${token.chain}-${token.symbol}-${token.address || 'native'}`}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl">
                        {token.icon}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{token.symbol}</div>
                        <div className="text-sm text-gray-500">{token.name}</div>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {token.chain}
                        </span>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {parseFloat(token.balance).toFixed(4)}
                        </div>
                        <div className="text-sm text-gray-500">
                          ${token.usdValue}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity */}
          <div className="mb-20">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span>📊</span>
                Activity
              </h2>
              <button className="text-sm text-blue-600 hover:underline">View All</button>
            </div>

            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
              <p className="text-sm">No transactions yet</p>
              <p className="text-xs mt-1">Start by receiving crypto</p>
            </div>
          </div>
        </div>

        {/* Addresses Modal */}
        {showAddressModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddressModal(false)}>
            <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-gray-900">Your Addresses</h2>
              
              <div className="space-y-4">
                <div className="border rounded-xl p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span>⚡</span>
                    Ethereum
                  </h3>
                  <div className="bg-white inline-block p-2 rounded-lg">
                    <QRCode value={evmAccount.address} size={150} />
                  </div>
                  <p className="text-xs font-mono mt-2 break-all text-gray-700">{evmAccount.address}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(evmAccount.address);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="mt-2 text-sm text-blue-600 hover:underline"
                  >
                    {copied ? 'Copied!' : 'Copy Address'}
                  </button>
                </div>
                
                <div className="border rounded-xl p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span>🔺</span>
                    TRON
                  </h3>
                  <div className="bg-white inline-block p-2 rounded-lg">
                    <QRCode value={tronAccount.address} size={150} />
                  </div>
                  <p className="text-xs font-mono mt-2 break-all text-gray-700">{tronAccount.address}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(tronAccount.address);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="mt-2 text-sm text-blue-600 hover:underline"
                  >
                    {copied ? 'Copied!' : 'Copy Address'}
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => setShowAddressModal(false)}
                className="w-full border-2 border-gray-300 hover:border-gray-400 rounded-xl py-3 font-medium"
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
            onAdd={(token) => alert(`Adding ${token.symbol} - functionality coming soon`)}
          />
        )}
      </div>
    </main>
  );
}
