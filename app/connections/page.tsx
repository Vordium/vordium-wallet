'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeftIcon, PlusIcon, ExternalLinkIcon, XIcon, GlobeIcon } from '@/components/icons/GrayIcons';
import { WalletConnectService, type DAppSession } from '@/services/walletconnect.service';
import { PageSkeleton } from '@/components/ui/Skeleton';

function ConnectionsPageContent() {
  const router = useRouter();
  const [sessions, setSessions] = useState<DAppSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [walletConnect, setWalletConnect] = useState<WalletConnectService | null>(null);

  useEffect(() => {
    initializeWalletConnect();
  }, []);

  const initializeWalletConnect = async () => {
    try {
      const wc = WalletConnectService.getInstance();
      await wc.initialize({
        projectId: 'your-project-id', // Replace with actual project ID
        chains: [1],
        optionalChains: [137, 56, 42161, 10],
        rpcMap: {
          1: 'https://eth-mainnet.g.alchemy.com/v2/demo',
          137: 'https://polygon-rpc.com',
          56: 'https://bsc-dataseed.binance.org',
          42161: 'https://arb1.arbitrum.io/rpc',
          10: 'https://mainnet.optimism.io',
        },
      });
      
      setWalletConnect(wc);
      setSessions(wc.getSessions());
    } catch (error) {
      console.error('Failed to initialize WalletConnect:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!walletConnect) return;
    
    setConnecting(true);
    try {
      await walletConnect.connect();
      setSessions(walletConnect.getSessions());
    } catch (error) {
      console.error('Failed to connect:', error);
      alert('Failed to connect to DApp. Please try again.');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (sessionTopic: string) => {
    if (!walletConnect) return;
    
    try {
      await walletConnect.disconnect(sessionTopic);
      setSessions(walletConnect.getSessions());
    } catch (error) {
      console.error('Failed to disconnect:', error);
      alert('Failed to disconnect from DApp. Please try again.');
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getChainName = (chainId: number) => {
    const chains: Record<number, string> = {
      1: 'Ethereum',
      137: 'Polygon',
      56: 'BSC',
      42161: 'Arbitrum',
      10: 'Optimism',
    };
    return chains[chainId] || `Chain ${chainId}`;
  };

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-700 transition"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">DApp Connections</h1>
        <button
          onClick={handleConnect}
          disabled={connecting}
          className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Stats */}
      <div className="p-4 border-b border-gray-700">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{sessions.length}</div>
            <div className="text-gray-400 text-sm">Connected DApps</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {walletConnect?.isConnected() ? '1' : '0'}
            </div>
            <div className="text-gray-400 text-sm">Active Sessions</div>
          </div>
        </div>
      </div>

      {/* Connections List */}
      <div className="p-4">
        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <GlobeIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No DApp Connections</h3>
            <p className="text-gray-400 text-sm mb-6">Connect to DApps to start using them with your wallet</p>
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition"
            >
              {connecting ? 'Connecting...' : 'Connect to DApp'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.topic}
                className="bg-gray-800 rounded-2xl p-4 hover:bg-gray-700 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                    {session.peer.metadata.icons[0] ? (
                      <Image
                        src={session.peer.metadata.icons[0]}
                        alt={session.peer.metadata.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/32/2a2a2a/d1d5db?text=D';
                        }}
                      />
                    ) : (
                      <GlobeIcon className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white truncate">
                        {session.peer.metadata.name}
                      </h3>
                      <span className="text-xs px-2 py-1 bg-green-600 text-white rounded-full">
                        Connected
                      </span>
                    </div>
                    
                    <p className="text-gray-400 text-sm truncate mb-2">
                      {session.peer.metadata.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Connected: {formatDate(session.expiry)}</span>
                      <span>•</span>
                      <span>Expires: {formatDate(session.expiry)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.open(session.peer.metadata.url, '_blank')}
                      className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 hover:bg-gray-600 transition"
                    >
                      <ExternalLinkIcon className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDisconnect(session.topic)}
                      className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white transition"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-4 border-t border-gray-700">
        <div className="bg-gray-800 rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-2">About DApp Connections</h3>
          <p className="text-gray-400 text-sm mb-3">
            Connect your wallet to decentralized applications (DApps) to interact with them securely.
            You can revoke access at any time.
          </p>
          <div className="text-xs text-gray-500">
            <p>• DApps can request to view your wallet address</p>
            <p>• DApps can request to send transactions on your behalf</p>
            <p>• You can disconnect from DApps at any time</p>
            <p>• Your private keys never leave your device</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConnectionsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ConnectionsPageContent />
    </Suspense>
  );
}
