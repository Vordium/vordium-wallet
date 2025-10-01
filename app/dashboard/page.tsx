'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/walletStore';
import QRCode from 'react-qr-code';
import { Settings, Share2, Copy, Plus, ArrowUp, ArrowDown, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { NetworkSelector } from '@/components/NetworkSelector';
import { AddTokenModal } from '@/components/AddTokenModal';

export default function DashboardPage() {
  const router = useRouter();
  const { accounts, selectedAccountId, selectAccount } = useWalletStore();
  const [selectedChain, setSelectedChain] = useState<'EVM' | 'TRON'>('EVM');
  const [copied, setCopied] = useState(false);
  const [showNetworkSelector, setShowNetworkSelector] = useState(false);
  const [showAddToken, setShowAddToken] = useState(false);
  const [showVerificationWarning, setShowVerificationWarning] = useState(false);
  const [mounted, setMounted] = useState(false);

  const currentAccount = useMemo(() => {
    return accounts.find(a => a.chain === selectedChain) || accounts[0];
  }, [accounts, selectedChain]);

  useEffect(() => {
    setMounted(true);
    const unlocked = localStorage.getItem('vordium_unlocked') === 'true';
    if (!unlocked) {
      router.replace('/unlock');
      return;
    }
    
    const skipped = sessionStorage.getItem('verification_skipped') === 'true';
    const verified = localStorage.getItem('vordium_verified') === 'true';
    setShowVerificationWarning(skipped && !verified);
  }, [router]);

  function handleCopy() {
    if (currentAccount) {
      navigator.clipboard.writeText(currentAccount.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleShare() {
    if (navigator.share && currentAccount) {
      navigator.share({
        title: 'My Wallet Address',
        text: currentAccount.address,
      });
    }
  }

  if (!mounted || !currentAccount) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const shortAddress = `${currentAccount.address.slice(0, 6)}...${currentAccount.address.slice(-4)}`;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => setShowNetworkSelector(true)}
              className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2 text-white"
            >
              <span className="font-medium">{selectedChain === 'EVM' ? '⚡ Ethereum' : '🔺 TRON'}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <Link href="/settings">
                <button className="p-2 hover:bg-white/10 rounded-lg">
                  <Settings className="w-5 h-5 text-white" />
                </button>
              </Link>
            </div>
          </div>

          {/* Account Info */}
          <div className="text-center text-white mb-4">
            <p className="text-sm opacity-90">{currentAccount.name}</p>
            <button onClick={handleCopy} className="flex items-center gap-1 mx-auto mt-1 hover:opacity-80">
              <span className="text-sm font-mono">{shortAddress}</span>
              {copied ? <span className="text-xs">✓</span> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>

        <div className="px-4 -mt-8">
          {/* Verification Warning Banner */}
          {showVerificationWarning && (
            <div className="bg-amber-100 border-2 border-amber-500 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-900">Action Required</p>
                  <p className="text-sm text-amber-800 mt-1">Verify your recovery phrase to secure your wallet</p>
                  <button 
                    onClick={() => router.push('/create/step-3')}
                    className="mt-2 text-sm font-medium text-amber-900 underline"
                  >
                    Verify Now
                  </button>
                </div>
                <button 
                  onClick={() => setShowVerificationWarning(false)}
                  className="text-amber-900 hover:text-amber-700"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
          
          {/* QR Code Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
            <div className="bg-white inline-block p-4 rounded-xl mx-auto">
              <QRCode value={currentAccount.address} size={180} />
            </div>
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500 mb-2">Your {selectedChain} Address</p>
              <p className="font-mono text-xs text-gray-900 break-all px-4">{currentAccount.address}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Link href="/send" className="block">
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl py-3 flex items-center justify-center gap-2 font-medium">
                <ArrowUp className="w-5 h-5" />
                Send
              </button>
            </Link>
            <Link href="/receive" className="block">
              <button className="w-full border-2 border-gray-300 hover:border-gray-400 rounded-xl py-3 flex items-center justify-center gap-2 font-medium">
                <ArrowDown className="w-5 h-5" />
                Receive
              </button>
            </Link>
          </div>

          {/* Balance */}
          <div className="mb-6">
            <p className="text-3xl font-bold text-gray-900">$0.00</p>
            <p className="text-sm text-gray-500">Total Balance</p>
          </div>

          {/* Assets */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span>💰</span>
                Assets
              </h2>
              <button onClick={() => setShowAddToken(true)} className="p-1 hover:bg-gray-100 rounded-lg">
                <Plus className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Native Token */}
            <div className="space-y-2">
              <div className="bg-white border rounded-xl p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                      {selectedChain === 'EVM' ? '⚡' : '🔺'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedChain === 'EVM' ? 'ETH' : 'TRX'}</p>
                      <p className="text-xs text-gray-500">{selectedChain === 'EVM' ? 'Ethereum' : 'TRON'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">0.00</p>
                    <p className="text-xs text-gray-500">$0.00</p>
                  </div>
                </div>
              </div>

              {/* Empty State */}
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No other tokens yet</p>
                <p className="text-xs mt-1">Tap + to add tokens</p>
              </div>
            </div>
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

            {/* Empty State */}
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
              <p className="text-sm">No transactions yet</p>
              <p className="text-xs mt-1">Start by receiving crypto</p>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showNetworkSelector && (
          <NetworkSelector
            selected={selectedChain}
            onSelect={setSelectedChain}
            onClose={() => setShowNetworkSelector(false)}
          />
        )}
        
        {showAddToken && (
          <AddTokenModal
            chain={selectedChain}
            onClose={() => setShowAddToken(false)}
            onAdd={(token) => alert(`Adding ${token.symbol} - functionality coming soon`)}
          />
        )}
      </div>
    </main>
  );
}

