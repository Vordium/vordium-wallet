'use client';

import { useState } from 'react';
import { BottomNavigation } from '@/components/BottomNavigation';
import { SearchIcon, ArrowLeftIcon } from '@/components/icons/GrayIcons';
import { DAppCardSkeleton } from '@/components/ui/Skeleton';
import Image from 'next/image';

interface DApp {
  id: string;
  name: string;
  description: string;
  category: string;
  url: string;
  logo: string;
  trending: boolean;
  verified: boolean;
  tvl?: string;
  volume24h?: string;
}

const TRENDING_DAPPS: DApp[] = [
  {
    id: 'aster-dex',
    name: 'Aster DEX',
    description: 'Next-generation decentralized exchange with advanced trading features',
    category: 'DEX',
    url: 'https://aster.exchange',
    logo: 'https://via.placeholder.com/64/6B7280/FFFFFF?text=AD',
    trending: true,
    verified: true,
    tvl: '$125M',
    volume24h: '$45M'
  },
  {
    id: 'hyperliquid',
    name: 'Hyperliquid',
    description: 'High-performance perpetual futures trading platform',
    category: 'Derivatives',
    url: 'https://hyperliquid.xyz',
    logo: 'https://via.placeholder.com/64/6B7280/FFFFFF?text=HL',
    trending: true,
    verified: true,
    tvl: '$890M',
    volume24h: '$2.1B'
  },
  {
    id: 'uniswap',
    name: 'Uniswap',
    description: 'The largest decentralized trading protocol',
    category: 'DEX',
    url: 'https://app.uniswap.org',
    logo: 'https://via.placeholder.com/64/6B7280/FFFFFF?text=UNI',
    trending: true,
    verified: true,
    tvl: '$4.2B',
    volume24h: '$1.8B'
  },
  {
    id: 'aave',
    name: 'Aave',
    description: 'Decentralized lending and borrowing protocol',
    category: 'Lending',
    url: 'https://app.aave.com',
    logo: 'https://via.placeholder.com/64/6B7280/FFFFFF?text=AA',
    trending: false,
    verified: true,
    tvl: '$12.5B',
    volume24h: '$450M'
  },
  {
    id: 'compound',
    name: 'Compound',
    description: 'Algorithmic money markets protocol',
    category: 'Lending',
    url: 'https://app.compound.finance',
    logo: 'https://via.placeholder.com/64/6B7280/FFFFFF?text=CO',
    trending: false,
    verified: true,
    tvl: '$2.8B',
    volume24h: '$125M'
  },
  {
    id: 'curve',
    name: 'Curve Finance',
    description: 'Decentralized exchange for stablecoins',
    category: 'DEX',
    url: 'https://curve.fi',
    logo: 'https://via.placeholder.com/64/6B7280/FFFFFF?text=CRV',
    trending: false,
    verified: true,
    tvl: '$3.1B',
    volume24h: '$285M'
  },
  {
    id: 'lido',
    name: 'Lido',
    description: 'Liquid staking solution for Ethereum',
    category: 'Staking',
    url: 'https://lido.fi',
    logo: 'https://via.placeholder.com/64/6B7280/FFFFFF?text=LDO',
    trending: true,
    verified: true,
    tvl: '$32.1B',
    volume24h: '$890M'
  },
  {
    id: 'makerdao',
    name: 'MakerDAO',
    description: 'Decentralized stablecoin protocol',
    category: 'Stablecoin',
    url: 'https://makerdao.com',
    logo: 'https://via.placeholder.com/64/6B7280/FFFFFF?text=MKR',
    trending: false,
    verified: true,
    tvl: '$8.7B',
    volume24h: '$156M'
  },
  {
    id: 'synthetix',
    name: 'Synthetix',
    description: 'Decentralized synthetic assets protocol',
    category: 'Derivatives',
    url: 'https://synthetix.io',
    logo: 'https://via.placeholder.com/64/6B7280/FFFFFF?text=SNX',
    trending: false,
    verified: true,
    tvl: '$1.2B',
    volume24h: '$78M'
  },
  {
    id: 'yearn',
    name: 'Yearn Finance',
    description: 'Yield optimization protocol',
    category: 'Yield',
    url: 'https://yearn.finance',
    logo: 'https://via.placeholder.com/64/6B7280/FFFFFF?text=YFI',
    trending: false,
    verified: true,
    tvl: '$650M',
    volume24h: '$45M'
  }
];

const CATEGORIES = ['All', 'DEX', 'Lending', 'Derivatives', 'Staking', 'Yield', 'Stablecoin'];

export default function BrowserPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);

  const filteredDApps = TRENDING_DAPPS.filter(dapp => {
    const matchesSearch = dapp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dapp.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || dapp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const trendingDApps = filteredDApps.filter(dapp => dapp.trending);

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 z-10">
        <h1 className="text-2xl font-bold text-center mb-4">DApp Browser</h1>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search DApps..."
            className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                selectedCategory === category
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Trending Section */}
        {trendingDApps.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <h2 className="text-xl font-bold">🔥 Trending</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {trendingDApps.slice(0, 4).map(dapp => (
                <DAppCard key={dapp.id} dapp={dapp} featured />
              ))}
            </div>
          </section>
        )}

        {/* All DApps */}
        <section>
          <h2 className="text-xl font-bold mb-4">All DApps ({filteredDApps.length})</h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <DAppCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredDApps.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg">No DApps found</p>
              <p className="text-sm mt-2">Try adjusting your search or category filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDApps.map(dapp => (
                <DAppCard key={dapp.id} dapp={dapp} />
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="mt-8">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-gray-800 rounded-xl border border-gray-700 hover:bg-gray-700 transition">
              <div className="text-2xl mb-2">🌐</div>
              <div className="font-medium">Custom URL</div>
              <div className="text-sm text-gray-400">Enter any DApp URL</div>
            </button>
            <button className="p-4 bg-gray-800 rounded-xl border border-gray-700 hover:bg-gray-700 transition">
              <div className="text-2xl mb-2">📱</div>
              <div className="font-medium">WalletConnect</div>
              <div className="text-sm text-gray-400">Scan QR to connect</div>
            </button>
          </div>
        </section>
      </div>

      <BottomNavigation />
    </div>
  );
}

function DAppCard({ dapp, featured = false }: { dapp: DApp; featured?: boolean }) {
  const handleOpen = () => {
    // In a real implementation, this would open the DApp in an in-app browser
    window.open(dapp.url, '_blank');
  };

  return (
    <button
      onClick={handleOpen}
      className={`w-full text-left p-4 rounded-xl border transition hover:bg-gray-700 ${
        featured 
          ? 'bg-gray-800 border-gray-600 shadow-lg' 
          : 'bg-gray-800 border-gray-700'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Logo */}
        <div className="relative flex-shrink-0">
          <Image
            src={dapp.logo}
            alt={dapp.name}
            width={48}
            height={48}
            className="w-12 h-12 rounded-xl bg-gray-600"
          />
          {dapp.verified && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-xs">
              ✓
            </div>
          )}
          {dapp.trending && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs">
              🔥
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-white truncate">{dapp.name}</h3>
            <span className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded-full">
              {dapp.category}
            </span>
          </div>
          
          <p className="text-sm text-gray-400 mb-2 line-clamp-2">
            {dapp.description}
          </p>

          {/* Stats */}
          {(dapp.tvl || dapp.volume24h) && (
            <div className="flex gap-4 text-xs text-gray-500">
              {dapp.tvl && (
                <div>
                  <span className="text-gray-400">TVL:</span> {dapp.tvl}
                </div>
              )}
              {dapp.volume24h && (
                <div>
                  <span className="text-gray-400">24h Vol:</span> {dapp.volume24h}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}