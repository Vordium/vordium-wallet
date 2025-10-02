'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, TrendingUpIcon, TrendingDownIcon, RefreshIcon, EyeIcon, EyeOffIcon } from '@/components/icons/GrayIcons';
import { useWalletStore } from '@/store/walletStore';
import { BalanceService, type TokenBalance } from '@/services/balance.service';

interface PortfolioData {
  totalValue: number;
  totalChange24h: number;
  totalChangePercent: number;
  topGainers: TokenBalance[];
  topLosers: TokenBalance[];
  portfolioDistribution: Array<{
    token: string;
    symbol: string;
    value: number;
    percentage: number;
    color: string;
  }>;
}

export default function PortfolioPage() {
  const router = useRouter();
  const { accounts } = useWalletStore();
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showValues, setShowValues] = useState(true);
  const [timeRange, setTimeRange] = useState<'1D' | '7D' | '30D' | '1Y'>('7D');

  const evmAccount = accounts.find(a => a.chain === 'EVM');
  const tronAccount = accounts.find(a => a.chain === 'TRON');

  useEffect(() => {
    loadPortfolioData();
  }, [evmAccount, tronAccount, timeRange]);

  const loadPortfolioData = async () => {
    if (!evmAccount || !tronAccount) return;
    
    setLoading(true);
    try {
      const tokens = await BalanceService.getAllTokens(evmAccount.address, tronAccount.address);
      
      const totalValue = tokens.reduce((sum, token) => sum + parseFloat(token.usdValue), 0);
      const totalChange24h = tokens.reduce((sum, token) => sum + (parseFloat(token.usdValue) * 0.05), 0); // Mock 5% change
      const totalChangePercent = totalValue > 0 ? (totalChange24h / totalValue) * 100 : 0;

      // Sort tokens by USD value
      const sortedTokens = tokens.sort((a, b) => parseFloat(b.usdValue) - parseFloat(a.usdValue));
      
      // Get top gainers and losers (mock data)
      const topGainers = sortedTokens.slice(0, 3).map(token => ({
        ...token,
        change24h: Math.random() * 20 + 5 // Mock 5-25% gain
      }));
      
      const topLosers = sortedTokens.slice(-3).map(token => ({
        ...token,
        change24h: -(Math.random() * 15 + 2) // Mock 2-17% loss
      }));

      // Calculate portfolio distribution
      const portfolioDistribution = sortedTokens.slice(0, 5).map((token, index) => ({
        token: token.name,
        symbol: token.symbol,
        value: parseFloat(token.usdValue),
        percentage: totalValue > 0 ? (parseFloat(token.usdValue) / totalValue) * 100 : 0,
        color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index]
      }));

      setPortfolioData({
        totalValue,
        totalChange24h,
        totalChangePercent,
        topGainers,
        topLosers,
        portfolioDistribution
      });
    } catch (error) {
      console.error('Error loading portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    } else {
      return `$${value.toFixed(2)}`;
    }
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
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
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-gray-800 rounded-xl p-6 animate-pulse">
              <div className="space-y-4">
                <div className="h-6 bg-gray-600 rounded w-32"></div>
                <div className="h-4 bg-gray-600 rounded w-24"></div>
                <div className="h-4 bg-gray-600 rounded w-16"></div>
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
        <h1 className="text-xl font-bold text-white">Portfolio</h1>
        <button
          onClick={() => setShowValues(!showValues)}
          className="p-2 hover:bg-gray-700 rounded-lg"
        >
          {showValues ? <EyeIcon className="w-5 h-5 text-gray-300" /> : <EyeOffIcon className="w-5 h-5 text-gray-300" />}
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Total Portfolio Value */}
        <div className="bg-gray-800 rounded-2xl p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              {showValues ? formatCurrency(portfolioData?.totalValue || 0) : '••••••'}
            </h2>
            <div className="flex items-center justify-center gap-2">
              {portfolioData?.totalChangePercent && portfolioData.totalChangePercent >= 0 ? (
                <TrendingUpIcon className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDownIcon className="w-4 h-4 text-red-400" />
              )}
              <span className={`text-sm font-medium ${
                portfolioData?.totalChangePercent && portfolioData.totalChangePercent >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {showValues ? formatPercent(portfolioData?.totalChangePercent || 0) : '••••'}
              </span>
              <span className="text-gray-400 text-sm">24h</span>
            </div>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 bg-gray-800 rounded-xl p-1">
          {['1D', '7D', '30D', '1Y'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range as any)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
                timeRange === range
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Portfolio Distribution */}
        <div className="bg-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Portfolio Distribution</h3>
          <div className="space-y-3">
            {portfolioData?.portfolioDistribution.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{item.symbol}</span>
                    <span className="text-gray-300 text-sm">
                      {showValues ? formatCurrency(item.value) : '••••'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full"
                        style={{ 
                          backgroundColor: item.color,
                          width: `${item.percentage}%`
                        }}
                      />
                    </div>
                    <span className="text-gray-400 text-xs">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Gainers */}
        <div className="bg-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Gainers</h3>
          <div className="space-y-3">
            {portfolioData?.topGainers.map((token, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {token.symbol.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{token.symbol}</span>
                    <span className="text-green-400 text-sm font-medium">
                      +{token.change24h?.toFixed(2)}%
                    </span>
                  </div>
                  <div className="text-gray-400 text-sm">
                    {showValues ? formatCurrency(parseFloat(token.usdValue)) : '••••'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="bg-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Losers</h3>
          <div className="space-y-3">
            {portfolioData?.topLosers.map((token, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {token.symbol.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{token.symbol}</span>
                    <span className="text-red-400 text-sm font-medium">
                      {token.change24h?.toFixed(2)}%
                    </span>
                  </div>
                  <div className="text-gray-400 text-sm">
                    {showValues ? formatCurrency(parseFloat(token.usdValue)) : '••••'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={loadPortfolioData}
          className="w-full py-3 px-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition flex items-center justify-center gap-2"
        >
          <RefreshIcon className="w-5 h-5 text-gray-300" />
          <span className="text-white font-medium">Refresh Data</span>
        </button>
      </div>
    </div>
  );
}
