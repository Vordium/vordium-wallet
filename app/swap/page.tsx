'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, RefreshIcon, SettingsIcon, ArrowUpDownIcon, InfoIcon } from '@/components/icons/GrayIcons';
import { useWalletStore } from '@/store/walletStore';
import { BalanceService, type TokenBalance } from '@/services/balance.service';
import { SwapIcon } from '@/components/icons/GrayIcons';
import { FormInputSkeleton, PageSkeleton } from '@/components/ui/Skeleton';
import { TokenSelector } from '@/components/TokenSelector';

interface SwapQuote {
  fromToken: TokenBalance;
  toToken: TokenBalance;
  fromAmount: string;
  toAmount: string;
  priceImpact: number;
  minimumReceived: string;
  gasFee: string;
  route: string[];
  slippage: number;
}

function SwapPageContent() {
  const router = useRouter();
  const { accounts } = useWalletStore();
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [swapping, setSwapping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [showFromTokenSelector, setShowFromTokenSelector] = useState(false);
  const [showToTokenSelector, setShowToTokenSelector] = useState(false);
  
  // Swap state
  const [fromToken, setFromToken] = useState<TokenBalance | null>(null);
  const [toToken, setToToken] = useState<TokenBalance | null>(null);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [deadline, setDeadline] = useState(20);
  
  // Quote state
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [error, setError] = useState('');

  const evmAccount = accounts.find(a => a.chain === 'EVM');
  const tronAccount = accounts.find(a => a.chain === 'TRON');

  useEffect(() => {
    loadTokens();
  }, [evmAccount, tronAccount]);

  const loadTokens = async () => {
    if (!evmAccount || !tronAccount) return;
    
    setLoading(true);
    try {
      const tokenList = await BalanceService.getAllTokens(evmAccount.address, tronAccount.address);
      setTokens(tokenList);
      
      // Set default tokens
      if (tokenList.length > 0) {
        setFromToken(tokenList[0]);
        if (tokenList.length > 1) {
          setToToken(tokenList[1]);
        }
      }
    } catch (error) {
      console.error('Failed to load tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    if (value && fromToken && toToken) {
      getQuote(value, fromToken, toToken);
    } else {
      setToAmount('');
      setQuote(null);
    }
  };

  const handleToAmountChange = (value: string) => {
    setToAmount(value);
    if (value && fromToken && toToken) {
      // Reverse quote calculation
      const reverseAmount = (parseFloat(value) / parseFloat(toToken.usdValue)) * parseFloat(fromToken.usdValue);
      setFromAmount(reverseAmount.toString());
    }
  };

  const getQuote = async (amount: string, from: TokenBalance, to: TokenBalance) => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    setQuoteLoading(true);
    setError('');
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock quote calculation
      const fromValue = parseFloat(amount) * parseFloat(from.usdValue);
      const toAmount = fromValue / parseFloat(to.usdValue);
      const priceImpact = Math.random() * 2; // 0-2% price impact
      const gasFee = from.chain === 'Ethereum' ? '0.005' : '0.001';
      
      const mockQuote: SwapQuote = {
        fromToken: from,
        toToken: to,
        fromAmount: amount,
        toAmount: toAmount.toString(),
        priceImpact,
        minimumReceived: (toAmount * (1 - slippage / 100)).toString(),
        gasFee,
        route: [from.symbol, 'USDC', to.symbol],
        slippage
      };
      
      setQuote(mockQuote);
      setToAmount(toAmount.toString());
    } catch (error) {
      setError('Failed to get quote. Please try again.');
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleSwapTokens = () => {
    if (!fromToken || !toToken) return;
    
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
    
    // Clear quote
    setQuote(null);
    setError('');
  };

  const handleSwap = async () => {
    if (!quote || !fromToken || !toToken) return;
    
    setSwapping(true);
    try {
      // Simulate swap transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success message
      alert('Swap completed successfully!');
      
      // Reset form
      setFromAmount('');
      setToAmount('');
      setQuote(null);
      
      // Refresh tokens
      loadTokens();
    } catch (error) {
      alert('Swap failed. Please try again.');
    } finally {
      setSwapping(false);
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
        <h1 className="text-xl font-bold">Swap</h1>
        <button
          onClick={() => setShowSettings(true)}
          className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-700 transition"
        >
          <SettingsIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* From Token */}
        <div className="bg-gray-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm">From</span>
            <span className="text-gray-400 text-sm">
              Balance: {fromToken ? parseFloat(fromToken.balance).toFixed(4) : '0.0000'}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <input
                type="number"
                placeholder="0.0"
                value={fromAmount}
                onChange={(e) => handleFromAmountChange(e.target.value)}
                className="w-full bg-transparent text-2xl font-semibold text-white placeholder-gray-500 outline-none"
              />
              <div className="text-gray-400 text-sm">
                {fromAmount && fromToken ? formatCurrency(parseFloat(fromAmount) * parseFloat(fromToken.usdValue)) : '$0.00'}
              </div>
            </div>
            
            <button
              onClick={() => setShowFromTokenSelector(true)}
              className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded-xl hover:bg-gray-600 transition"
            >
              {fromToken ? (
                <>
                  <img src={fromToken.icon} alt={fromToken.symbol} className="w-6 h-6 rounded-full" />
                  <span className="font-semibold">{fromToken.symbol}</span>
                </>
              ) : (
                <span className="text-gray-400">Select</span>
              )}
            </button>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSwapTokens}
            className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-700 transition border-2 border-gray-700"
          >
            <ArrowUpDownIcon className="w-5 h-5" />
          </button>
        </div>

        {/* To Token */}
        <div className="bg-gray-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm">To</span>
            <span className="text-gray-400 text-sm">
              Balance: {toToken ? parseFloat(toToken.balance).toFixed(4) : '0.0000'}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <input
                type="number"
                placeholder="0.0"
                value={toAmount}
                onChange={(e) => handleToAmountChange(e.target.value)}
                className="w-full bg-transparent text-2xl font-semibold text-white placeholder-gray-500 outline-none"
                disabled={quoteLoading}
              />
              <div className="text-gray-400 text-sm">
                {toAmount && toToken ? formatCurrency(parseFloat(toAmount) * parseFloat(toToken.usdValue)) : '$0.00'}
              </div>
            </div>
            
            <button
              onClick={() => setShowToTokenSelector(true)}
              className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded-xl hover:bg-gray-600 transition"
            >
              {toToken ? (
                <>
                  <img src={toToken.icon} alt={toToken.symbol} className="w-6 h-6 rounded-full" />
                  <span className="font-semibold">{toToken.symbol}</span>
                </>
              ) : (
                <span className="text-gray-400">Select</span>
              )}
            </button>
          </div>
        </div>

        {/* Quote Details */}
        {quote && (
          <div className="bg-gray-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Price Impact</span>
              <span className={`text-sm font-medium ${quote.priceImpact > 1 ? 'text-red-400' : 'text-green-400'}`}>
                {quote.priceImpact.toFixed(2)}%
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Minimum Received</span>
              <span className="text-white text-sm font-medium">
                {parseFloat(quote.minimumReceived).toFixed(6)} {quote.toToken.symbol}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Network Fee</span>
              <span className="text-white text-sm font-medium">
                {quote.gasFee} {quote.fromToken.chain === 'Ethereum' ? 'ETH' : 'TRX'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Route</span>
              <span className="text-white text-sm font-medium">
                {quote.route.join(' → ')}
              </span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 flex items-center gap-2">
            <InfoIcon className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          disabled={!quote || swapping || quoteLoading}
          className="w-full py-4 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          {swapping ? (
            <>
              <RefreshIcon className="w-5 h-5 animate-spin" />
              Swapping...
            </>
          ) : quoteLoading ? (
            <>
              <RefreshIcon className="w-5 h-5 animate-spin" />
              Getting Quote...
            </>
          ) : (
            <>
              <SwapIcon className="w-5 h-5" />
              Swap {fromToken?.symbol} for {toToken?.symbol}
            </>
          )}
        </button>

        {/* Info */}
        <div className="text-center text-gray-400 text-xs">
          <p>Swaps are powered by decentralized exchanges</p>
          <p>Always verify transaction details before confirming</p>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Swap Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 hover:bg-gray-600 transition"
              >
                <ArrowLeftIcon className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Slippage Tolerance</label>
                <div className="flex gap-2">
                  {[0.1, 0.5, 1.0, 3.0].map((value) => (
                    <button
                      key={value}
                      onClick={() => setSlippage(value)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                        slippage === value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {value}%
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Transaction Deadline</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={deadline}
                    onChange={(e) => setDeadline(Number(e.target.value))}
                    className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg outline-none"
                  />
                  <span className="text-gray-400 text-sm">minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Token Selectors */}
      <TokenSelector
        isOpen={showFromTokenSelector}
        onClose={() => setShowFromTokenSelector(false)}
        onSelect={setFromToken}
        tokens={tokens}
        selectedToken={fromToken}
        title="Select Token to Swap From"
      />

      <TokenSelector
        isOpen={showToTokenSelector}
        onClose={() => setShowToTokenSelector(false)}
        onSelect={setToToken}
        tokens={tokens}
        selectedToken={toToken}
        title="Select Token to Swap To"
      />
    </div>
  );
}

export default function SwapPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <SwapPageContent />
    </Suspense>
  );
}
