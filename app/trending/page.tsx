'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, TrendingIcon, TrendingUpIcon, TrendingDownIcon, RefreshIcon } from '@/components/icons/GrayIcons';
import { PageSkeleton } from '@/components/ui/Skeleton';

interface TrendingToken {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  market_cap_rank: number;
  sparkline_in_7d: {
    price: number[];
  };
}

export default function TrendingPage() {
  const router = useRouter();
  const [trendingTokens, setTrendingTokens] = useState<TrendingToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'volume' | 'market_cap' | 'price_change'>('volume');

  const loadTrendingTokens = async () => {
    try {
      setRefreshing(true);
      // Fetch trending tokens by volume from CoinGecko
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=50&page=1&sparkline=true&price_change_percentage=24h'
      );
      
      if (response.ok) {
        const data = await response.json();
        setTrendingTokens(data);
      } else {
        console.error('Failed to fetch trending tokens');
        // Fallback mock data
        setTrendingTokens(getMockTrendingTokens());
      }
    } catch (error) {
      console.error('Error fetching trending tokens:', error);
      // Fallback mock data
      setTrendingTokens(getMockTrendingTokens());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getMockTrendingTokens = (): TrendingToken[] => [
    {
      id: 'bitcoin',
      symbol: 'BTC',
      name: 'Bitcoin',
      image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
      current_price: 43250.50,
      price_change_percentage_24h: 2.45,
      market_cap: 847500000000,
      total_volume: 28500000000,
      market_cap_rank: 1,
      sparkline_in_7d: { price: [42000, 42500, 43000, 42800, 43250] }
    },
    {
      id: 'ethereum',
      symbol: 'ETH',
      name: 'Ethereum',
      image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
      current_price: 2650.30,
      price_change_percentage_24h: 3.12,
      market_cap: 318000000000,
      total_volume: 15200000000,
      market_cap_rank: 2,
      sparkline_in_7d: { price: [2500, 2550, 2600, 2620, 2650] }
    },
    {
      id: 'solana',
      symbol: 'SOL',
      name: 'Solana',
      image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
      current_price: 98.45,
      price_change_percentage_24h: -1.25,
      market_cap: 42500000000,
      total_volume: 3200000000,
      market_cap_rank: 5,
      sparkline_in_7d: { price: [100, 102, 98, 96, 98.45] }
    }
  ];

  useEffect(() => {
    loadTrendingTokens();
  }, []);

  const formatPrice = (price: number) => {
    if (price >= 1) {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `$${price.toFixed(6)}`;
    }
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(1)}B`;
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(1)}M`;
    } else if (volume >= 1e3) {
      return `$${(volume / 1e3).toFixed(1)}K`;
    } else {
      return `$${volume.toFixed(0)}`;
    }
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(1)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(1)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(1)}M`;
    } else {
      return `$${marketCap.toFixed(0)}`;
    }
  };

  const sortedTokens = [...trendingTokens].sort((a, b) => {
    switch (sortBy) {
      case 'volume':
        return b.total_volume - a.total_volume;
      case 'market_cap':
        return b.market_cap - a.market_cap;
      case 'price_change':
        return b.price_change_percentage_24h - a.price_change_percentage_24h;
      default:
        return 0;
    }
  });

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="sticky top-0 bg-gray-900 border-b border-gray-700 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-700 transition"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <TrendingIcon className="w-6 h-6 text-orange-400" />
              <h1 className="text-xl font-bold">Trending</h1>
            </div>
          </div>
          <button
            onClick={loadTrendingTokens}
            disabled={refreshing}
            className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-700 transition"
          >
            <RefreshIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Sort Options */}
        <div className="px-4 pb-4">
          <div className="flex gap-2 bg-gray-800 rounded-lg p-1">
            {[
              { id: 'volume', label: 'Volume' },
              { id: 'market_cap', label: 'Market Cap' },
              { id: 'price_change', label: '24h Change' }
            ].map(option => (
              <button
                key={option.id}
                onClick={() => setSortBy(option.id as any)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition ${
                  sortBy === option.id
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trending Tokens List */}
      <div className="p-4 space-y-3">
        {sortedTokens.map((token, index) => (
          <div
            key={token.id}
            className="bg-gray-800 rounded-2xl p-4 hover:bg-gray-700 hover:shadow-lg hover:shadow-gray-700/50 transition cursor-pointer"
            onClick={() => router.push(`/token/evm/native/${token.symbol.toLowerCase()}`)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={token.image}
                    alt={token.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover bg-gray-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://via.placeholder.com/48/6B7280/FFFFFF?text=${token.symbol.charAt(0)}`;
                    }}
                  />
                  <div className="absolute -top-1 -right-1 bg-gray-700 text-gray-300 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {index + 1}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{token.symbol}</h3>
                    <span className="text-gray-400 text-sm">#{token.market_cap_rank}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{token.name}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-white font-semibold">
                  {formatPrice(token.current_price)}
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  token.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {token.price_change_percentage_24h >= 0 ? (
                    <TrendingUpIcon className="w-4 h-4" />
                  ) : (
                    <TrendingDownIcon className="w-4 h-4" />
                  )}
                  {Math.abs(token.price_change_percentage_24h).toFixed(2)}%
                </div>
              </div>
            </div>
            
            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Volume:</span>
                <span className="text-white ml-2">{formatVolume(token.total_volume)}</span>
              </div>
              <div>
                <span className="text-gray-400">Market Cap:</span>
                <span className="text-white ml-2">{formatMarketCap(token.market_cap)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
