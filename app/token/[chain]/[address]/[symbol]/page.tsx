'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createChart, ColorType } from 'lightweight-charts';
import { getTrustWalletLogo, NATIVE_LOGOS } from '@/lib/tokenLogos';

interface Transaction {
  hash: string;
  type: 'send' | 'receive';
  from: string;
  to: string;
  value: string;
  timestamp: number;
  status: string;
}

export default function TokenDetailPage({
  params
}: {
  params: { chain: string; address: string; symbol: string }
}) {
  const router = useRouter();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  
  const [currentPrice, setCurrentPrice] = useState('0.00');
  const [priceChange, setPriceChange] = useState({ value: '0.00', percent: '0.00' });
  const [balance, setBalance] = useState('0.00');
  const [usdValue, setUsdValue] = useState('0.00');
  const [priceHistory, setPriceHistory] = useState<Array<{ time: number; value: number }>>([]);
  const [timeframe, setTimeframe] = useState<'1H' | '1D' | '1W' | '1M' | '1Y' | 'All'>('1D');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const chainNameMap: Record<string, string> = {
    'ethereum': 'Ethereum',
    'tron': 'Tron',
    'solana': 'Solana',
    'bitcoin': 'Bitcoin',
    'bsc': 'BSC',
    'polygon': 'Polygon',
    'arbitrum': 'Arbitrum'
  };
  const chainName = chainNameMap[params.chain] || params.chain;
  const isNative = params.address === 'native';

  // Open blockchain scanner
  const openBlockchainScanner = () => {
    const scannerUrls: Record<string, string> = {
      'ethereum': params.address === 'native' 
        ? `https://etherscan.io`
        : `https://etherscan.io/token/${params.address}`,
      'bsc': params.address === 'native'
        ? `https://bscscan.com`
        : `https://bscscan.com/token/${params.address}`,
      'polygon': params.address === 'native'
        ? `https://polygonscan.com`
        : `https://polygonscan.com/token/${params.address}`,
      'arbitrum': params.address === 'native'
        ? `https://arbiscan.io`
        : `https://arbiscan.io/token/${params.address}`,
      'solana': params.address === 'native'
        ? `https://solscan.io`
        : `https://solscan.io/token/${params.address}`,
      'tron': params.address === 'native'
        ? `https://tronscan.org`
        : `https://tronscan.org/#/token20/${params.address}`,
      'bitcoin': `https://blockchair.com/bitcoin/address/${params.address}`
    };

    const url = scannerUrls[params.chain.toLowerCase()] || scannerUrls['ethereum'];
    window.open(url, '_blank', 'width=1200,height=800,toolbar=no,location=no,status=no,menubar=no');
  };

  // Add token to portfolio
  const handleAddToPortfolio = async () => {
    try {
      const { useWalletStore } = await import('@/store/walletStore');
      const { addToken } = useWalletStore.getState();
      
      // Check if token is already in portfolio
      const existingTokens = useWalletStore.getState().getTokens();
      const exists = existingTokens.some(t => 
        t.symbol === params.symbol.toUpperCase() && 
        t.chain === chainName as any &&
        t.address === params.address
      );
      
      if (exists) {
        alert('Token already in your portfolio!');
        return;
      }

      // Add token to portfolio
      addToken({
        symbol: params.symbol.toUpperCase(),
        name: params.symbol.toUpperCase(),
        address: params.address,
        chain: chainName as any,
        decimals: 18,
        balance: balance,
        logo: NATIVE_LOGOS[params.symbol.toUpperCase()] || getTrustWalletLogo(params.address, chainName),
        isNative: isNative,
        usdValue: usdValue
      });

      // Dispatch event to refresh dashboard
      window.dispatchEvent(new CustomEvent('tokenAdded'));
      
      alert('Token added to portfolio!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to add token:', error);
      alert('Failed to add token to portfolio');
    }
  };

  useEffect(() => {
    loadTokenData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  useEffect(() => {
    loadPriceData(timeframe);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe]);

  useEffect(() => {
    if (priceHistory.length > 0 && chartContainerRef.current) {
      renderChart();
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceHistory]);

  async function loadTokenData() {
    try {
      // Get token from balance service or store
      const { BalanceService } = await import('@/services/balance.service');
      const { useWalletStore } = await import('@/store/walletStore');
      
      const accounts = useWalletStore.getState().accounts;
      const account = accounts.find(a => a.chain === (chainName === 'Ethereum' ? 'EVM' : 'TRON'));
      
      if (!account) {
        router.push('/dashboard');
        return;
      }

      // For now, set basic data
      setBalance('0.00');
      setUsdValue('0.00');
      setTransactions([]);
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load token:', error);
      setLoading(false);
    }
  }

  async function loadPriceData(tf: typeof timeframe) {
    try {
      const coinIds: Record<string, string> = {
        ETH: 'ethereum',
        TRX: 'tron',
        SOL: 'solana',
        BTC: 'bitcoin',
        USDT: 'tether',
        USDC: 'usd-coin',
        DAI: 'dai',
      };

      const coinId = coinIds[params.symbol];
      if (!coinId) return;

      const daysMap: Record<string, string | number> = {
        '1H': 1,
        '1D': 1,
        '1W': 7,
        '1M': 30,
        '1Y': 365,
        'All': 'max',
      };

      const days = daysMap[tf];
      // Use our API route instead of direct CoinGecko calls to avoid CORS issues
      const url = `/api/prices/chart?coinId=${coinId}&days=${days}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.prices && data.prices.length > 0) {
        const chartData = data.prices.map(([timestamp, price]: [number, number]) => ({
          time: Math.floor(timestamp / 1000),
          value: price,
        }));

        setPriceHistory(chartData);

        if (chartData.length > 0) {
          const latestPrice = chartData[chartData.length - 1].value;
          const oldestPrice = chartData[0].value;
          const change = latestPrice - oldestPrice;
          const changePercent = (change / oldestPrice) * 100;

          setCurrentPrice(latestPrice.toFixed(2));
          setPriceChange({
            value: change.toFixed(2),
            percent: changePercent.toFixed(2),
          });
        }
      } else {
        // Fallback data when no chart data is available
        console.warn('No chart data available, using fallback');
        const fallbackPrice = 100; // Fallback price
        setCurrentPrice(fallbackPrice.toFixed(2));
        setPriceChange({ value: '0.00', percent: '0.00' });
        setPriceHistory([{
          time: Math.floor(Date.now() / 1000),
          value: fallbackPrice
        }]);
      }
    } catch (error) {
      console.error('Failed to load price data:', error);
      // Set fallback data on error
      const fallbackPrice = 100;
      setCurrentPrice(fallbackPrice.toFixed(2));
      setPriceChange({ value: '0.00', percent: '0.00' });
      setPriceHistory([{
        time: Math.floor(Date.now() / 1000),
        value: fallbackPrice
      }]);
    }
  }

  function renderChart() {
    if (!chartContainerRef.current || priceHistory.length === 0) return;

    if (chartRef.current) {
      chartRef.current.remove();
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'white' },
        textColor: '#6B7280',
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      timeScale: {
        borderVisible: false,
        visible: true,
      },
      rightPriceScale: {
        borderVisible: false,
      },
      crosshair: {
        vertLine: {
          labelVisible: false,
        },
        horzLine: {
          labelVisible: false,
        },
      },
    });

    const isPositive = parseFloat(priceChange.percent) >= 0;

    const areaSeries = chart.addAreaSeries({
      lineColor: isPositive ? '#6B7280' : '#9CA3AF',
      topColor: isPositive ? 'rgba(107, 114, 128, 0.4)' : 'rgba(156, 163, 175, 0.4)',
      bottomColor: isPositive ? 'rgba(107, 114, 128, 0.0)' : 'rgba(156, 163, 175, 0.0)',
      lineWidth: 3,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    areaSeries.setData(priceHistory as any);
    chart.timeScale().fitContent();

    chartRef.current = chart;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const isPositive = parseFloat(priceChange.percent) >= 0;
  const logoUrl = isNative ? NATIVE_LOGOS[params.symbol] : getTrustWalletLogo(chainName, params.address);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-blue-600 font-semibold">
          <span className="text-xl">←</span>
          <span>{params.symbol}</span>
        </button>
        <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">⋮</button>
      </div>

      {/* Chart */}
      <div className="p-4">
        <div ref={chartContainerRef} className="w-full" />
      </div>

      {/* Timeframe Selector */}
      <div className="px-4 pb-4">
        <div className="flex gap-2 overflow-x-auto">
          {(['1H', '1D', '1W', '1M', '1Y', 'All'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                timeframe === tf ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Price Info */}
      <div className="px-4 py-6 border-t border-gray-100">
        <div className="text-4xl font-bold mb-2">${currentPrice}</div>
        <div className={`text-lg font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}${priceChange.value} ({priceChange.percent}%)
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-6">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push(`/send?token=${params.symbol}&chain=${params.chain}`)}
            className="flex items-center justify-center gap-2 py-4 bg-gray-700 text-white rounded-2xl font-semibold hover:bg-gray-800"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
            <span>Send</span>
          </button>
          <button
            onClick={() => router.push(`/receive?token=${params.symbol}&chain=${params.chain}`)}
            className="flex items-center justify-center gap-2 py-4 bg-gray-600 text-white rounded-2xl font-semibold hover:bg-gray-700"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span>Receive</span>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <button 
            onClick={handleAddToPortfolio}
            className="flex items-center justify-center gap-2 py-4 bg-gray-600 text-white rounded-2xl font-semibold hover:bg-gray-700 transition-all"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>Add to Portfolio</span>
          </button>
          <button 
            onClick={openBlockchainScanner}
            className="flex items-center justify-center gap-2 py-4 bg-gray-600 text-white rounded-2xl font-semibold hover:bg-gray-700 transition-all"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
            <span>Check on Chain</span>
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="px-4 py-6 border-t border-gray-100">
        <h3 className="text-lg font-bold mb-4">Info</h3>
        <div className="space-y-3">
          <InfoRow label="Balance" value={`${parseFloat(balance).toFixed(4)} ${params.symbol}`} />
          <InfoRow label="Network" value={chainName} />
          {params.address !== 'native' && (
            <InfoRow
              label="Contract"
              value={`${params.address.slice(0, 6)}...${params.address.slice(-4)}`}
              copyable={params.address}
            />
          )}
        </div>
      </div>

      {/* Transactions */}
      <div className="px-4 py-6 border-t border-gray-100 pb-20">
        <h3 className="text-lg font-bold mb-4">Transactions</h3>

        {transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => {
              const explorerUrls: Record<string, string> = {
                'ethereum': `https://etherscan.io/tx/${tx.hash}`,
                'tron': `https://tronscan.org/#/transaction/${tx.hash}`,
                'solana': `https://explorer.solana.com/tx/${tx.hash}`,
                'bitcoin': `https://blockstream.info/tx/${tx.hash}`
              };
              const explorerUrl = explorerUrls[params.chain] || `https://etherscan.io/tx/${tx.hash}`;

              return (
                <button
                  key={tx.hash}
                  onClick={() => window.open(explorerUrl, '_blank')}
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                      tx.type === 'receive' ? 'bg-green-100' : 'bg-blue-100'
                    }`}
                  >
                    {tx.type === 'receive' ? '↓' : '↑'}
                  </div>

                  <div className="flex-1 text-left">
                    <div className="font-semibold">{tx.type === 'receive' ? 'Received' : 'Sent'}</div>
                    <div className="text-sm text-gray-500">
                      {tx.type === 'receive' ? 'From' : 'To'}: {tx[tx.type === 'receive' ? 'from' : 'to'].slice(0, 6)}
                      ...{tx[tx.type === 'receive' ? 'from' : 'to'].slice(-4)}
                    </div>
                    <div className="text-xs text-gray-400">{new Date(tx.timestamp).toLocaleDateString()}</div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`font-semibold ${tx.type === 'receive' ? 'text-green-600' : 'text-gray-900'}`}
                    >
                      {tx.type === 'receive' ? '+' : '-'}
                      {parseFloat(tx.value).toFixed(4)}
                    </div>
                    <div className="text-xs text-gray-500">{tx.status}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value, copyable }: { label: string; value: string; copyable?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (copyable) {
      navigator.clipboard.writeText(copyable);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-gray-500">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-semibold">{value}</span>
        {copyable && (
          <button onClick={handleCopy} className="text-blue-600 text-sm">
            {copied ? '✓' : '📋'}
          </button>
        )}
      </div>
    </div>
  );
}

