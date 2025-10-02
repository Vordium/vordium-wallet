'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, TrendingUpIcon, LockIcon, UnlockIcon, RefreshIcon, ExternalLinkIcon } from '@/components/icons/GrayIcons';
import { useWalletStore } from '@/store/walletStore';
import { useNotifications } from '@/components/NotificationSystem';

interface StakingPool {
  id: string;
  name: string;
  symbol: string;
  apy: number;
  tvl: string;
  staked: string;
  rewards: string;
  logo: string;
  chain: string;
  minStake: string;
  lockPeriod: string;
}

interface YieldFarm {
  id: string;
  name: string;
  pair: string;
  apy: number;
  tvl: string;
  staked: string;
  rewards: string;
  logo1: string;
  logo2: string;
  chain: string;
  minStake: string;
}

export default function DeFiPage() {
  const router = useRouter();
  const { accounts } = useWalletStore();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<'staking' | 'farming' | 'lending'>('staking');
  const [loading, setLoading] = useState(true);
  const [stakingPools, setStakingPools] = useState<StakingPool[]>([]);
  const [yieldFarms, setYieldFarms] = useState<YieldFarm[]>([]);
  const [selectedPool, setSelectedPool] = useState<StakingPool | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [showStakeModal, setShowStakeModal] = useState(false);

  const evmAccount = accounts.find(a => a.chain === 'EVM');
  const tronAccount = accounts.find(a => a.chain === 'TRON');

  useEffect(() => {
    loadDeFiData();
  }, []);

  const loadDeFiData = async () => {
    setLoading(true);
    try {
      // Mock staking pools data
      const mockStakingPools: StakingPool[] = [
        {
          id: '1',
          name: 'Ethereum 2.0 Staking',
          symbol: 'ETH',
          apy: 4.2,
          tvl: '$12.5B',
          staked: '0.00',
          rewards: '0.00',
          logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
          chain: 'Ethereum',
          minStake: '0.1',
          lockPeriod: 'Indefinite'
        },
        {
          id: '2',
          name: 'Polygon Staking',
          symbol: 'MATIC',
          apy: 8.5,
          tvl: '$2.1B',
          staked: '0.00',
          rewards: '0.00',
          logo: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png',
          chain: 'Polygon',
          minStake: '100',
          lockPeriod: '7 days'
        },
        {
          id: '3',
          name: 'TRON Energy',
          symbol: 'TRX',
          apy: 6.8,
          tvl: '$850M',
          staked: '0.00',
          rewards: '0.00',
          logo: 'https://assets.coingecko.com/coins/images/1094/large/tron-logo.png',
          chain: 'TRON',
          minStake: '1000',
          lockPeriod: '3 days'
        }
      ];

      // Mock yield farms data
      const mockYieldFarms: YieldFarm[] = [
        {
          id: '1',
          name: 'ETH/USDC Farm',
          pair: 'ETH-USDC',
          apy: 12.5,
          tvl: '$45M',
          staked: '0.00',
          rewards: '0.00',
          logo1: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
          logo2: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
          chain: 'Ethereum',
          minStake: '0.1'
        },
        {
          id: '2',
          name: 'MATIC/USDT Farm',
          pair: 'MATIC-USDT',
          apy: 18.2,
          tvl: '$23M',
          staked: '0.00',
          rewards: '0.00',
          logo1: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png',
          logo2: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
          chain: 'Polygon',
          minStake: '100'
        }
      ];

      setStakingPools(mockStakingPools);
      setYieldFarms(mockYieldFarms);
    } catch (error) {
      console.error('Error loading DeFi data:', error);
      addNotification({
        type: 'error',
        title: 'Failed to Load DeFi Data',
        message: 'Please check your connection and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStake = (pool: StakingPool) => {
    setSelectedPool(pool);
    setShowStakeModal(true);
  };

  const handleConfirmStake = () => {
    if (!selectedPool || !stakeAmount) return;

    addNotification({
      type: 'success',
      title: 'Staking Successful',
      message: `Staked ${stakeAmount} ${selectedPool.symbol} in ${selectedPool.name}`,
    });

    setShowStakeModal(false);
    setStakeAmount('');
    setSelectedPool(null);
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(1)}B`;
    } else if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    } else {
      return `$${num.toFixed(2)}`;
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
          {[1, 2, 3].map(i => (
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
        <h1 className="text-xl font-bold text-white">DeFi</h1>
        <button
          onClick={loadDeFiData}
          className="p-2 hover:bg-gray-700 rounded-lg"
        >
          <RefreshIcon className="w-5 h-5 text-gray-300" />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="p-4">
        <div className="flex gap-2 bg-gray-800 rounded-xl p-1">
          {[
            { id: 'staking', label: 'Staking', icon: <LockIcon className="w-4 h-4" /> },
            { id: 'farming', label: 'Farming', icon: <TrendingUpIcon className="w-4 h-4" /> },
            { id: 'lending', label: 'Lending', icon: <UnlockIcon className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition ${
                activeTab === tab.id
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.icon}
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 space-y-4">
        {activeTab === 'staking' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Staking Pools</h2>
            {stakingPools.map((pool) => (
              <div key={pool.id} className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 hover:shadow-lg hover:shadow-gray-700/50 transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={pool.logo}
                      alt={pool.symbol}
                      className="w-12 h-12 rounded-full"
                      onError={(e) => {
                        e.currentTarget.src = `https://via.placeholder.com/48/6B7280/FFFFFF?text=${pool.symbol.charAt(0)}`;
                      }}
                    />
                    <div>
                      <h3 className="font-semibold text-white">{pool.name}</h3>
                      <p className="text-sm text-gray-400">{pool.chain}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">{pool.apy}%</div>
                    <div className="text-sm text-gray-400">APY</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-400">Total Value Locked</div>
                    <div className="font-semibold text-white">{pool.tvl}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Min Stake</div>
                    <div className="font-semibold text-white">{pool.minStake} {pool.symbol}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Lock Period</div>
                    <div className="font-semibold text-white">{pool.lockPeriod}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Your Staked</div>
                    <div className="font-semibold text-white">{pool.staked} {pool.symbol}</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleStake(pool)}
                    className="flex-1 py-3 px-4 bg-gray-700 rounded-xl hover:bg-gray-600 transition text-white font-semibold"
                  >
                    Stake
                  </button>
                  <button className="py-3 px-4 bg-gray-600 rounded-xl hover:bg-gray-500 transition text-white">
                    <ExternalLinkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'farming' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Yield Farms</h2>
            {yieldFarms.map((farm) => (
              <div key={farm.id} className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 hover:shadow-lg hover:shadow-gray-700/50 transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <img
                        src={farm.logo1}
                        alt="Token 1"
                        className="w-12 h-12 rounded-full border-2 border-gray-800"
                        onError={(e) => {
                          e.currentTarget.src = `https://via.placeholder.com/48/6B7280/FFFFFF?text=${farm.pair.split('-')[0].charAt(0)}`;
                        }}
                      />
                      <img
                        src={farm.logo2}
                        alt="Token 2"
                        className="w-12 h-12 rounded-full border-2 border-gray-800"
                        onError={(e) => {
                          e.currentTarget.src = `https://via.placeholder.com/48/6B7280/FFFFFF?text=${farm.pair.split('-')[1].charAt(0)}`;
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{farm.name}</h3>
                      <p className="text-sm text-gray-400">{farm.chain}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">{farm.apy}%</div>
                    <div className="text-sm text-gray-400">APY</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-400">Total Value Locked</div>
                    <div className="font-semibold text-white">{farm.tvl}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Min Stake</div>
                    <div className="font-semibold text-white">{farm.minStake}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Your Staked</div>
                    <div className="font-semibold text-white">{farm.staked}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Rewards</div>
                    <div className="font-semibold text-white">{farm.rewards}</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 py-3 px-4 bg-gray-700 rounded-xl hover:bg-gray-600 transition text-white font-semibold">
                    Farm
                  </button>
                  <button className="py-3 px-4 bg-gray-600 rounded-xl hover:bg-gray-500 transition text-white">
                    <ExternalLinkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'lending' && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <UnlockIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Lending Coming Soon</h3>
            <p className="text-gray-400">Lending features will be available in a future update.</p>
          </div>
        )}
      </div>

      {/* Stake Modal */}
      {showStakeModal && selectedPool && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-3xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Stake {selectedPool.symbol}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount to Stake
                </label>
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder={`Min: ${selectedPool.minStake} ${selectedPool.symbol}`}
                />
              </div>

              <div className="bg-gray-700 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">APY</span>
                  <span className="text-green-400 font-semibold">{selectedPool.apy}%</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Lock Period</span>
                  <span className="text-white">{selectedPool.lockPeriod}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Min Stake</span>
                  <span className="text-white">{selectedPool.minStake} {selectedPool.symbol}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowStakeModal(false)}
                  className="flex-1 py-3 px-4 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmStake}
                  disabled={!stakeAmount || parseFloat(stakeAmount) < parseFloat(selectedPool.minStake)}
                  className="flex-1 py-3 px-4 bg-gray-500 text-white font-semibold rounded-xl hover:bg-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Stake
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
