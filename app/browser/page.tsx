'use client';

import { useState } from 'react';
import { BottomNavigation } from '@/components/BottomNavigation';
import { SearchIcon, ArrowLeftIcon, RefreshIcon, HomeIcon } from '@/components/icons/GrayIcons';
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
    url: 'https://asterdex.com',
    logo: 'https://assets.coingecko.com/coins/images/32964/large/aster.png',
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
    logo: 'https://assets.coingecko.com/coins/images/38236/large/hype-logo-200-200.png',
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
    logo: 'https://assets.coingecko.com/coins/images/12504/large/uni.jpg',
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
    logo: 'https://assets.coingecko.com/coins/images/12645/large/AAVE.png',
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
    logo: 'https://assets.coingecko.com/coins/images/10775/large/COMP.png',
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
    logo: 'https://assets.coingecko.com/coins/images/12124/large/Curve.png',
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
    logo: 'https://assets.coingecko.com/coins/images/13573/large/Lido_DAO.png',
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
    logo: 'https://assets.coingecko.com/coins/images/1364/large/Mark_Maker.png',
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
    logo: 'https://assets.coingecko.com/coins/images/3406/large/SNX.png',
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
    logo: 'https://assets.coingecko.com/coins/images/11849/large/yearn.jpg',
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
  const [browserMode, setBrowserMode] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [urlInput, setUrlInput] = useState('');

  const filteredDApps = TRENDING_DAPPS.filter(dapp => {
    const matchesSearch = dapp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dapp.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || dapp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const trendingDApps = filteredDApps.filter(dapp => dapp.trending);

  // Browser functions
  const navigateToUrl = (url: string) => {
    let formattedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      formattedUrl = `https://${url}`;
    }
    setCurrentUrl(formattedUrl);
    setBrowserMode(true);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      navigateToUrl(urlInput.trim());
    }
  };

  const goBack = () => {
    setBrowserMode(false);
    setCurrentUrl('');
    setUrlInput('');
  };

  const refreshPage = () => {
    // In a real implementation, this would refresh the iframe
    window.location.reload();
  };

  const goHome = () => {
    setBrowserMode(false);
    setCurrentUrl('');
    setUrlInput('');
  };

  // Browser mode
  if (browserMode) {
    return (
      <div className="min-h-screen bg-gray-900 text-white pb-20">
        {/* Browser Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 z-10">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={goBack} className="p-2 hover:bg-gray-700 rounded-lg">
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <button onClick={goHome} className="p-2 hover:bg-gray-700 rounded-lg">
              <HomeIcon className="w-5 h-5" />
            </button>
            <button onClick={refreshPage} className="p-2 hover:bg-gray-700 rounded-lg">
              <RefreshIcon className="w-5 h-5" />
            </button>
          </div>
          
          {/* URL Bar */}
          <form onSubmit={handleUrlSubmit} className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Enter URL or search..."
              className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
            <button 
              type="submit"
              className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-500 transition"
            >
              Go
            </button>
          </form>
          
          <div className="mt-2 text-sm text-gray-400 truncate">
            {currentUrl}
          </div>
        </div>

        {/* Browser Content */}
        <div className="h-[calc(100vh-80px)]">
          {currentUrl ? (
            <div className="relative h-full">
              <iframe
                src={currentUrl}
                className="w-full h-full border-0"
                title="DApp Browser"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                onError={() => {
                  console.error('Failed to load:', currentUrl);
                }}
              />
              {/* Fallback message for blocked iframes */}
              <div className="absolute bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-3">
                <div className="text-xs text-gray-400 text-center">
                  If the site doesn&apos;t load, it may block embedding.
                  <button
                    onClick={() => window.open(currentUrl, '_blank')}
                    className="ml-2 text-blue-400 hover:text-blue-300 underline"
                  >
                    Open in new tab
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <div className="text-6xl mb-4">🌐</div>
                <p className="text-xl mb-2">Enter a URL to start browsing</p>
                <p className="text-sm">Or select a DApp from the list below</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

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
                <DAppCard key={dapp.id} dapp={dapp} featured onNavigate={navigateToUrl} />
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
                <DAppCard key={dapp.id} dapp={dapp} onNavigate={navigateToUrl} />
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="mt-8">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setBrowserMode(true)}
              className="p-4 bg-gray-800 rounded-xl border border-gray-700 hover:bg-gray-700 transition"
            >
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

function DAppCard({ dapp, featured = false, onNavigate }: { dapp: DApp; featured?: boolean; onNavigate: (url: string) => void }) {
  const handleOpen = () => {
    // Navigate to the DApp in the in-app browser
    onNavigate(dapp.url);
  };

  return (
    <button
      onClick={handleOpen}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 hover:bg-gray-700 hover:shadow-lg hover:shadow-gray-700/50 ${
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
            className="w-12 h-12 rounded-xl bg-gray-600 object-cover"
            onError={(e) => {
              e.currentTarget.src = `https://via.placeholder.com/48/6B7280/FFFFFF?text=${dapp.name.charAt(0)}`;
            }}
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