'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeftIcon, PlusIcon, BellIcon, TrendingUpIcon, TrendingDownIcon, XIcon, EditIcon } from '@/components/icons/GrayIcons';
import { useWalletStore } from '@/store/walletStore';
import { BalanceService, type TokenBalance } from '@/services/balance.service';
import { PageSkeleton } from '@/components/ui/Skeleton';

interface PriceAlert {
  id: string;
  token: TokenBalance;
  condition: 'above' | 'below';
  targetPrice: number;
  currentPrice: number;
  isActive: boolean;
  createdAt: number;
  triggeredAt?: number;
}

function AlertsPageContent() {
  const router = useRouter();
  const { accounts } = useWalletStore();
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [editingAlert, setEditingAlert] = useState<PriceAlert | null>(null);

  const evmAccount = accounts.find(a => a.chain === 'EVM');
  const tronAccount = accounts.find(a => a.chain === 'TRON');

  useEffect(() => {
    loadData();
  }, [evmAccount, tronAccount, loadData]);

  const loadData = useCallback(async () => {
    if (!evmAccount || !tronAccount) return;
    
    setLoading(true);
    try {
      // Load tokens
      const tokenList = await BalanceService.getAllTokens(evmAccount.address, tronAccount.address);
      setTokens(tokenList);
      
      // Load alerts from localStorage
      const savedAlerts = localStorage.getItem('vordium-price-alerts');
      if (savedAlerts) {
        const parsedAlerts = JSON.parse(savedAlerts);
        setAlerts(parsedAlerts);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, [evmAccount, tronAccount]);

  const createAlert = (alert: Omit<PriceAlert, 'id' | 'createdAt'>) => {
    const newAlert: PriceAlert = {
      ...alert,
      id: Date.now().toString(),
      createdAt: Date.now()
    };
    
    const updatedAlerts = [...alerts, newAlert];
    setAlerts(updatedAlerts);
    localStorage.setItem('vordium-price-alerts', JSON.stringify(updatedAlerts));
    setShowCreateAlert(false);
  };

  const updateAlert = (id: string, updates: Partial<PriceAlert>) => {
    const updatedAlerts = alerts.map(alert => 
      alert.id === id ? { ...alert, ...updates } : alert
    );
    setAlerts(updatedAlerts);
    localStorage.setItem('vordium-price-alerts', JSON.stringify(updatedAlerts));
    setEditingAlert(null);
  };

  const deleteAlert = (id: string) => {
    const updatedAlerts = alerts.filter(alert => alert.id !== id);
    setAlerts(updatedAlerts);
    localStorage.setItem('vordium-price-alerts', JSON.stringify(updatedAlerts));
  };

  const toggleAlert = (id: string) => {
    const updatedAlerts = alerts.map(alert => 
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    );
    setAlerts(updatedAlerts);
    localStorage.setItem('vordium-price-alerts', JSON.stringify(updatedAlerts));
  };

  const formatPrice = (price: number) => {
    if (price >= 1) {
      return `$${price.toFixed(2)}`;
    } else if (price >= 0.01) {
      return `$${price.toFixed(4)}`;
    } else {
      return `$${price.toFixed(6)}`;
    }
  };

  const getPriceChange = (alert: PriceAlert) => {
    const change = ((alert.currentPrice - alert.targetPrice) / alert.targetPrice) * 100;
    return change;
  };

  const getAlertStatus = (alert: PriceAlert) => {
    const change = getPriceChange(alert);
    if (alert.condition === 'above' && change >= 0) {
      return { status: 'triggered', color: 'text-green-400', icon: TrendingUpIcon };
    } else if (alert.condition === 'below' && change <= 0) {
      return { status: 'triggered', color: 'text-red-400', icon: TrendingDownIcon };
    } else {
      return { status: 'active', color: 'text-gray-400', icon: BellIcon };
    }
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
        <h1 className="text-xl font-bold">Price Alerts</h1>
        <button
          onClick={() => setShowCreateAlert(true)}
          className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Stats */}
      <div className="p-4 border-b border-gray-700">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{alerts.length}</div>
            <div className="text-gray-400 text-sm">Total Alerts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {alerts.filter(alert => alert.isActive).length}
            </div>
            <div className="text-gray-400 text-sm">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {alerts.filter(alert => alert.triggeredAt).length}
            </div>
            <div className="text-gray-400 text-sm">Triggered</div>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="p-4">
        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <BellIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Price Alerts</h3>
            <p className="text-gray-400 text-sm mb-6">Create alerts to get notified when token prices change</p>
            <button
              onClick={() => setShowCreateAlert(true)}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
            >
              Create Alert
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const status = getAlertStatus(alert);
              const StatusIcon = status.icon;
              
              return (
                <div
                  key={alert.id}
                  className={`bg-gray-800 rounded-2xl p-4 hover:bg-gray-700 transition ${
                    !alert.isActive ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={alert.token.icon}
                      alt={alert.token.symbol}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://via.placeholder.com/48/374151/9CA3AF?text=${alert.token.symbol.charAt(0)}`;
                      }}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">{alert.token.symbol}</span>
                        <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded-full">
                          {alert.token.chain}
                        </span>
                        <StatusIcon className={`w-4 h-4 ${status.color}`} />
                      </div>
                      
                      <div className="text-sm text-gray-400">
                        Alert when price goes {alert.condition} {formatPrice(alert.targetPrice)}
                      </div>
                      
                      <div className="text-sm text-white mt-1">
                        Current: {formatPrice(alert.currentPrice)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingAlert(alert)}
                        className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 hover:bg-gray-600 transition"
                      >
                        <EditIcon className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => toggleAlert(alert.id)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                          alert.isActive
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                      >
                        <BellIcon className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => deleteAlert(alert.id)}
                        className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white transition"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Alert Modal */}
      {showCreateAlert && (
        <CreateAlertModal
          tokens={tokens}
          onClose={() => setShowCreateAlert(false)}
          onCreate={createAlert}
        />
      )}

      {/* Edit Alert Modal */}
      {editingAlert && (
        <EditAlertModal
          alert={editingAlert}
          tokens={tokens}
          onClose={() => setEditingAlert(null)}
          onUpdate={updateAlert}
        />
      )}
    </div>
  );
}

// Create Alert Modal Component
function CreateAlertModal({ 
  tokens, 
  onClose, 
  onCreate 
}: { 
  tokens: TokenBalance[]; 
  onClose: () => void; 
  onCreate: (alert: Omit<PriceAlert, 'id' | 'createdAt'>) => void; 
}) {
  const [selectedToken, setSelectedToken] = useState<TokenBalance | null>(null);
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [targetPrice, setTargetPrice] = useState('');
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedToken || !targetPrice) return;

    onCreate({
      token: selectedToken,
      condition,
      targetPrice: parseFloat(targetPrice),
      currentPrice: parseFloat(selectedToken.usdValue),
      isActive
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Create Price Alert</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 hover:bg-gray-600 transition"
          >
            <ArrowLeftIcon className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Token</label>
            <select
              value={selectedToken?.symbol || ''}
              onChange={(e) => {
                const token = tokens.find(t => t.symbol === e.target.value);
                setSelectedToken(token || null);
              }}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg outline-none"
              required
            >
              <option value="">Select a token</option>
              {tokens.map((token) => (
                <option key={`${token.chain}-${token.symbol}`} value={token.symbol}>
                  {token.symbol} ({token.chain})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-2 block">Condition</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCondition('above')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                  condition === 'above'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Above
              </button>
              <button
                type="button"
                onClick={() => setCondition('below')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                  condition === 'below'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Below
              </button>
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-2 block">Target Price (USD)</label>
            <input
              type="number"
              step="0.000001"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg outline-none"
              placeholder="0.00"
              required
            />
            {selectedToken && (
              <div className="text-gray-400 text-xs mt-1">
                Current: ${parseFloat(selectedToken.usdValue).toFixed(6)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-gray-300 text-sm">
              Alert is active
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
            >
              Create Alert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Alert Modal Component
function EditAlertModal({ 
  alert, 
  tokens, 
  onClose, 
  onUpdate 
}: { 
  alert: PriceAlert; 
  tokens: TokenBalance[]; 
  onClose: () => void; 
  onUpdate: (id: string, updates: Partial<PriceAlert>) => void; 
}) {
  const [condition, setCondition] = useState(alert.condition);
  const [targetPrice, setTargetPrice] = useState(alert.targetPrice.toString());
  const [isActive, setIsActive] = useState(alert.isActive);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(alert.id, {
      condition,
      targetPrice: parseFloat(targetPrice),
      isActive
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Edit Price Alert</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 hover:bg-gray-600 transition"
          >
            <ArrowLeftIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Image
            src={alert.token.icon}
            alt={alert.token.symbol}
            width={48}
            height={48}
            className="w-12 h-12 rounded-full"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://via.placeholder.com/48/374151/9CA3AF?text=${alert.token.symbol.charAt(0)}`;
            }}
          />
          <div>
            <div className="font-semibold text-white">{alert.token.symbol}</div>
            <div className="text-sm text-gray-400">{alert.token.chain}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Condition</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCondition('above')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                  condition === 'above'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Above
              </button>
              <button
                type="button"
                onClick={() => setCondition('below')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                  condition === 'below'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Below
              </button>
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-2 block">Target Price (USD)</label>
            <input
              type="number"
              step="0.000001"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg outline-none"
              required
            />
            <div className="text-gray-400 text-xs mt-1">
              Current: ${parseFloat(alert.token.usdValue).toFixed(6)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-gray-300 text-sm">
              Alert is active
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
            >
              Update Alert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AlertsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AlertsPageContent />
    </Suspense>
  );
}
