'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, SearchIcon, FilterIcon, ExternalLinkIcon, CheckIcon, ClockIcon, XIcon, ArrowUpIcon, ArrowDownIcon } from '@/components/icons/GrayIcons';
import { useWalletStore } from '@/store/walletStore';

interface Transaction {
  id: string;
  hash: string;
  type: 'send' | 'receive' | 'swap' | 'stake' | 'unstake';
  status: 'pending' | 'confirmed' | 'failed';
  from: string;
  to: string;
  amount: string;
  token: string;
  chain: string;
  gasFee: string;
  timestamp: number;
  blockNumber?: number;
  confirmations?: number;
  explorerUrl: string;
}

export default function TransactionsPage() {
  const router = useRouter();
  const { accounts } = useWalletStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'send' | 'receive' | 'swap' | 'stake'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'failed'>('all');
  const [loading, setLoading] = useState(true);

  // Mock transaction data - in real app, this would come from blockchain APIs
  useEffect(() => {
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        type: 'send',
        status: 'confirmed',
        from: accounts.find(a => a.chain === 'EVM')?.address || '0x...',
        to: '0x9876543210fedcba9876543210fedcba98765432',
        amount: '0.5',
        token: 'ETH',
        chain: 'Ethereum',
        gasFee: '0.002',
        timestamp: Date.now() - 3600000, // 1 hour ago
        blockNumber: 18500000,
        confirmations: 12,
        explorerUrl: 'https://etherscan.io/tx/0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      },
      {
        id: '2',
        hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        type: 'receive',
        status: 'confirmed',
        from: '0x1111111111111111111111111111111111111111',
        to: accounts.find(a => a.chain === 'EVM')?.address || '0x...',
        amount: '1.2',
        token: 'USDC',
        chain: 'Ethereum',
        gasFee: '0.001',
        timestamp: Date.now() - 7200000, // 2 hours ago
        blockNumber: 18499950,
        confirmations: 15,
        explorerUrl: 'https://etherscan.io/tx/0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
      },
      {
        id: '3',
        hash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
        type: 'swap',
        status: 'pending',
        from: accounts.find(a => a.chain === 'EVM')?.address || '0x...',
        to: '0x2222222222222222222222222222222222222222',
        amount: '100',
        token: 'USDT',
        chain: 'Ethereum',
        gasFee: '0.003',
        timestamp: Date.now() - 300000, // 5 minutes ago
        explorerUrl: 'https://etherscan.io/tx/0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba'
      },
      {
        id: '4',
        hash: '0x5555555555555555555555555555555555555555555555555555555555555555',
        type: 'stake',
        status: 'confirmed',
        from: accounts.find(a => a.chain === 'EVM')?.address || '0x...',
        to: '0x3333333333333333333333333333333333333333',
        amount: '2.0',
        token: 'ETH',
        chain: 'Ethereum',
        gasFee: '0.004',
        timestamp: Date.now() - 86400000, // 1 day ago
        blockNumber: 18495000,
        confirmations: 100,
        explorerUrl: 'https://etherscan.io/tx/0x5555555555555555555555555555555555555555555555555555555555555555'
      },
      {
        id: '5',
        hash: '0x4444444444444444444444444444444444444444444444444444444444444444',
        type: 'receive',
        status: 'failed',
        from: '0x4444444444444444444444444444444444444444',
        to: accounts.find(a => a.chain === 'EVM')?.address || '0x...',
        amount: '0.1',
        token: 'ETH',
        chain: 'Ethereum',
        gasFee: '0.001',
        timestamp: Date.now() - 172800000, // 2 days ago
        explorerUrl: 'https://etherscan.io/tx/0x4444444444444444444444444444444444444444'
      }
    ];

    setTransactions(mockTransactions);
    setFilteredTransactions(mockTransactions);
    setLoading(false);
  }, [accounts]);

  useEffect(() => {
    let filtered = transactions;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(tx => 
        tx.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(tx => tx.type === filterType);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(tx => tx.status === filterStatus);
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchQuery, filterType, filterStatus]);

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckIcon className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <ClockIcon className="w-4 h-4 text-yellow-400" />;
      case 'failed':
        return <XIcon className="w-4 h-4 text-red-400" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'send':
        return <ArrowUpIcon className="w-4 h-4 text-red-400" />;
      case 'receive':
        return <ArrowDownIcon className="w-4 h-4 text-green-400" />;
      case 'swap':
        return <ExternalLinkIcon className="w-4 h-4 text-blue-400" />;
      case 'stake':
        return <CheckIcon className="w-4 h-4 text-purple-400" />;
      default:
        return <ExternalLinkIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-400 bg-green-400/20';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'failed':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-4 py-4 flex items-center justify-between z-10">
          <div className="w-9 h-9 bg-gray-600 rounded-lg animate-pulse"></div>
          <div className="h-6 w-32 bg-gray-600 rounded animate-pulse"></div>
          <div className="w-9"></div>
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-gray-800 rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-600 rounded w-24"></div>
                  <div className="h-3 bg-gray-600 rounded w-32"></div>
                </div>
                <div className="text-right space-y-2">
                  <div className="h-4 bg-gray-600 rounded w-16"></div>
                  <div className="h-3 bg-gray-600 rounded w-12"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between z-10">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-700 rounded-lg">
          <ArrowLeftIcon className="w-5 h-5 text-gray-300" />
        </button>
        <h1 className="text-xl font-bold text-white">Transactions</h1>
        <div className="w-9" />
      </div>

      {/* Search and Filters */}
      <div className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto">
          {/* Type Filter */}
          <div className="flex gap-1 bg-gray-800 rounded-xl p-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'send', label: 'Sent' },
              { id: 'receive', label: 'Received' },
              { id: 'swap', label: 'Swapped' },
              { id: 'stake', label: 'Staked' }
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setFilterType(type.id as any)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                  filterType === type.id
                    ? 'bg-gray-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex gap-1 bg-gray-800 rounded-xl p-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'confirmed', label: 'Confirmed' },
              { id: 'pending', label: 'Pending' },
              { id: 'failed', label: 'Failed' }
            ].map(status => (
              <button
                key={status.id}
                onClick={() => setFilterStatus(status.id as any)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                  filterStatus === status.id
                    ? 'bg-gray-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="px-4 space-y-2">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FilterIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No transactions found</h3>
            <p className="text-gray-400">
              {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your filters'
                : 'Your transaction history will appear here'
              }
            </p>
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-gray-800 rounded-xl p-4 hover:bg-gray-700 hover:shadow-lg hover:shadow-gray-700/50 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                {/* Type Icon */}
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                  {getTypeIcon(tx.type)}
                </div>

                {/* Transaction Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white capitalize">{tx.type}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                      {tx.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {tx.type === 'send' ? 'To' : 'From'}: {tx.type === 'send' ? tx.to.slice(0, 6) + '...' + tx.to.slice(-4) : tx.from.slice(0, 6) + '...' + tx.from.slice(-4)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {tx.chain} • {formatTime(tx.timestamp)}
                    {tx.confirmations && (
                      <span> • {tx.confirmations} confirmations</span>
                    )}
                  </div>
                </div>

                {/* Amount and Status */}
                <div className="text-right">
                  <div className={`font-semibold ${
                    tx.type === 'send' ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {tx.type === 'send' ? '-' : '+'}{tx.amount} {tx.token}
                  </div>
                  <div className="text-sm text-gray-400">
                    Gas: {tx.gasFee} ETH
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    {getStatusIcon(tx.status)}
                    <button
                      onClick={() => window.open(tx.explorerUrl, '_blank')}
                      className="text-gray-400 hover:text-white transition"
                    >
                      <ExternalLinkIcon className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
