'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/walletStore';
import QRCode from 'react-qr-code';
import Link from 'next/link';
import { EnhancedTokenSearchModal } from '@/components/EnhancedTokenSearchModal';
import { WalletSwitcherModal } from '@/components/WalletSwitcherModal';
import { BottomNavigation } from '@/components/BottomNavigation';
import { WalletImportModal } from '@/components/WalletImportModal';
import { BalanceService, type TokenBalance } from '@/services/balance.service';
import { MultiChainTokenService, type MultiChainTokenInfo } from '@/services/multiChainToken.service';
import { MoralisTokenService } from '@/services/moralisToken.service';
import { NotificationCenter, useNotifications } from '@/components/NotificationSystem';
import { ethers } from 'ethers';
import { PageSkeleton, BalanceCardSkeleton, TokenRowSkeleton } from '@/components/ui/Skeleton';
import { getTrustWalletLogo, NATIVE_LOGOS } from '@/lib/tokenLogos';
import { 
  SettingsIcon, 
  BellIcon, 
  SendIcon, 
  ReceiveIcon, 
  BuyIcon, 
  SwapIcon, 
  SearchIcon, 
  PlusIcon, 
  MoreIcon, 
  RefreshIcon,
  FilterIcon,
  TrendingUpIcon,
  LockIcon,
  EyeIcon,
  GlobeIcon
} from '@/components/icons/GrayIcons';

export default function DashboardPage() {
  const router = useRouter();
  const { accounts } = useWalletStore();
  const { addNotification } = useNotifications();
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [totalBalance, setTotalBalance] = useState('0.00');
  const [change24h, setChange24h] = useState({ value: '0.00', percent: '0.00' });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddToken, setShowAddToken] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showImportWallet, setShowImportWallet] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'tokens' | 'nfts' | 'portfolio'>('tokens');

  const evmAccount = accounts.find(a => a.chain === 'EVM');
  const tronAccount = accounts.find(a => a.chain === 'TRON');
  const bitcoinAccount = accounts.find(a => a.chain === 'BITCOIN');
  const solanaAccount = accounts.find(a => a.chain === 'SOLANA');

  useEffect(() => {
    setMounted(true);
    const unlocked = localStorage.getItem('vordium_unlocked') === 'true';
    if (!unlocked) {
      router.replace('/unlock');
      return;
    }

    if (evmAccount && tronAccount) {
      loadWalletData();
      const interval = setInterval(() => loadWalletData(true), 30000);
      
      // Listen for token added events
      const handleTokenAdded = () => {
        loadWalletData();
      };

      window.addEventListener('tokenAdded', handleTokenAdded);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('tokenAdded', handleTokenAdded);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, evmAccount, tronAccount, bitcoinAccount, solanaAccount]);

  async function loadWalletData(silent = false) {
    if (!evmAccount || !tronAccount || !bitcoinAccount || !solanaAccount) return;
    
    if (!silent) setLoading(true);
    setRefreshing(true);

    try {
      // Use MultiChainTokenService for all chains
      const addresses = {
        ethereum: evmAccount.address,
        polygon: evmAccount.address, // Same address for Polygon
        bsc: evmAccount.address,     // Same address for BSC
        arbitrum: evmAccount.address, // Same address for Arbitrum
        tron: tronAccount.address,
        solana: solanaAccount.address,
        bitcoin: bitcoinAccount.address,
      };
      
      console.log('Loading tokens with MultiChainTokenService for all chains...');
      const multiChainTokens = await MultiChainTokenService.getAllTokensMultiChain(addresses);
      console.log('Dashboard loaded multi-chain tokens:', multiChainTokens);
      
      // Convert MultiChainTokenInfo to TokenBalance format
      const blockchainTokens: TokenBalance[] = multiChainTokens.map(token => ({
        symbol: token.symbol,
        name: token.name,
        balance: token.balanceFormatted,
        usdValue: token.usdValue,
        chain: token.chain,
        address: token.address,
        decimals: token.decimals,
        isNative: token.isNative,
        logo: token.logo,
        price: token.price,
        change24h: token.change24h,
      }));
      
      console.log('Dashboard loaded blockchain tokens:', blockchainTokens);
      
      // Get custom tokens from store
      const customTokens = useWalletStore.getState().getTokens();
      console.log('Dashboard loaded custom tokens:', customTokens);
      console.log('Available accounts:', accounts);
      console.log('Custom tokens count:', customTokens.length);
      
      // Combine blockchain tokens with custom tokens
      const allTokens = [...blockchainTokens];
      
      // Add custom tokens that aren't already in blockchain tokens
      console.log('Processing custom tokens...');
      for (const customToken of customTokens) {
        console.log('Processing custom token:', customToken);
        // Check if token already exists in blockchain tokens
        // Only consider it a duplicate if it's the exact same token (same address and chain)
        const exists = blockchainTokens.some(t => 
          t.symbol === customToken.symbol && 
          t.chain === customToken.chain && 
          t.address === customToken.address
        );
        
        console.log('Token exists in blockchain tokens:', exists);
        if (!exists) {
          // Try to get updated balance for custom token
          let updatedBalance = customToken.balance;
          let updatedUsdValue = customToken.usdValue;
          
          // Get token price and logo from Moralis if it's an EVM chain
          let tokenPrice = 0;
          let tokenLogo = customToken.logo;
          
          if (['Ethereum', 'BSC', 'Polygon', 'Arbitrum'].includes(customToken.chain) && customToken.address && customToken.address.startsWith('0x')) {
            try {
              const chainMap: { [key: string]: string } = {
                'Ethereum': 'eth',
                'BSC': 'bsc',
                'Polygon': 'polygon',
                'Arbitrum': 'arbitrum',
              };
              
              const moralisChain = chainMap[customToken.chain];
              if (moralisChain) {
                // Get token metadata from Moralis
                const tokenMetadata = await MoralisTokenService.getTokenMetadata(customToken.address, moralisChain);
                if (tokenMetadata) {
                  tokenPrice = tokenMetadata.price;
                  tokenLogo = tokenMetadata.logo;
                  console.log(`Got Moralis data for ${customToken.symbol}: price=${tokenPrice}, logo=${tokenLogo}`);
                }
              }
            } catch (error) {
              console.warn(`Failed to get Moralis data for ${customToken.symbol}:`, error);
            }
          }
          
          // Calculate USD value
          if (tokenPrice > 0) {
            updatedUsdValue = (parseFloat(updatedBalance) * tokenPrice).toFixed(2);
          }
          
          try {
            // Get user address for this chain
            const chainMap: Record<string, string> = {
              'Ethereum': 'EVM',
              'Tron': 'TRON',
              'Solana': 'SOLANA',
              'Bitcoin': 'BITCOIN',
              'BSC': 'EVM',        // BSC uses same address as Ethereum
              'Polygon': 'EVM',    // Polygon uses same address as Ethereum
              'Arbitrum': 'EVM'    // Arbitrum uses same address as Ethereum
            };
            
            const userAddress = accounts.find(a => 
              a.chain === chainMap[customToken.chain]
            )?.address;
            
                  if (userAddress && customToken.address !== 'native') {
                    // Try to fetch updated balance
                    if (customToken.chain === 'Ethereum' || customToken.chain === 'BSC' || customToken.chain === 'Polygon' || customToken.chain === 'Arbitrum') {
                      try {
                        // If address is not a contract address (e.g., CoinGecko ID), try to get contract address
                        let contractAddress = customToken.address;
                        if (!contractAddress.startsWith('0x') || contractAddress.length !== 42) {
                          console.log(`Token ${customToken.symbol} has non-contract address, skipping balance fetch`);
                          // Skip balance fetching for tokens without valid contract addresses
                        } else {
                          const provider = new ethers.JsonRpcProvider(
                            customToken.chain === 'Ethereum' ? (process.env.NEXT_PUBLIC_ETHEREUM_RPC || 'https://eth.llamarpc.com') :
                            customToken.chain === 'BSC' ? (process.env.NEXT_PUBLIC_BSC_RPC || 'https://bsc-dataseed.binance.org') :
                            customToken.chain === 'Polygon' ? (process.env.NEXT_PUBLIC_POLYGON_RPC || 'https://polygon-rpc.com') :
                            (process.env.NEXT_PUBLIC_ARBITRUM_RPC || 'https://arb1.arbitrum.io/rpc')
                          );
                          const contract = new ethers.Contract(
                            contractAddress,
                            ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'],
                            provider
                          );
                          const balance = await contract.balanceOf(userAddress);
                          const decimals = await contract.decimals();
                          updatedBalance = (Number(balance) / Math.pow(10, decimals)).toString();
                        }
                      } catch (error) {
                        console.warn(`Failed to fetch balance for ${customToken.symbol}:`, error);
                      }
                    }
                  }
          } catch (error) {
            console.warn(`Failed to update balance for ${customToken.symbol}:`, error);
          }
          
          // Convert store token to TokenBalance format
          const tokenBalance: TokenBalance = {
            symbol: customToken.symbol,
            name: customToken.name,
            balance: updatedBalance,
            usdValue: updatedUsdValue,
            chain: customToken.chain,
            address: customToken.address,
            decimals: customToken.decimals,
            isNative: customToken.isNative,
            logo: tokenLogo // Use Moralis logo if available
          };
          console.log('Adding custom token to dashboard:', tokenBalance);
          allTokens.push(tokenBalance);
        } else {
          console.log('Skipping custom token - already exists in blockchain tokens:', customToken.symbol);
        }
      }
      
      console.log('Dashboard combined tokens:', allTokens);
      console.log('Dashboard setting tokens, count:', allTokens.length);
      setTokens(allTokens);
      
      // Debug: Check if tokens are actually set
      setTimeout(() => {
        console.log('Dashboard tokens after setState:', tokens);
      }, 100);
      
      const total = await BalanceService.getTotalBalance(allTokens);
      setTotalBalance(total);
      
      // TODO: Calculate 24h change
      setChange24h({ value: '0.00', percent: '0.00' });
      
      // Add success notification
      if (!silent) {
        addNotification({
          type: 'success',
          title: 'Balances Updated',
          message: `Portfolio value: ${total}`,
        });
      }
    } catch (error) {
      console.error('Failed to load wallet data:', error);
      addNotification({
        type: 'error',
        title: 'Failed to Load Balances',
        message: 'Please check your connection and try again.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  if (!mounted || !evmAccount || !tronAccount || !bitcoinAccount || !solanaAccount) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const isPositive = parseFloat(change24h.percent) >= 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20 modern-scrollbar">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-black sticky top-0 z-40">
        <button
          onClick={() => setShowWalletModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full hover:bg-gray-700 transition"
        >
          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold">
            {(localStorage.getItem('vordium_wallet_name') || 'M')[0]}
          </div>
          <span className="font-semibold text-white">{localStorage.getItem('vordium_wallet_name') || 'My Wallet'}</span>
          <span className="text-gray-400">▼</span>
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImportWallet(true)}
            className="px-4 py-2 bg-gray-800 rounded-full hover:bg-gray-700 transition text-white text-sm font-medium"
          >
            Import
          </button>
          <button
            onClick={() => router.push('/settings')}
            className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-700 transition"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
          <NotificationCenter />
        </div>
      </div>

      {/* Main Card Container */}
      <div className="p-4">
        <div className="bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
          {/* Total Balance */}
          <div className="text-center py-6">
            <div className="text-5xl font-bold mb-2 text-white">
              {loading ? (
                <div className="animate-pulse bg-gray-700 rounded h-12 w-32 mx-auto"></div>
              ) : (
                `$${totalBalance}`
              )}
            </div>
            <div className="text-lg text-gray-300">
              {isPositive ? '+' : ''}${change24h.value} ({change24h.percent}%)
            </div>
          </div>

        {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => router.push('/send')}
              className="flex flex-col items-center gap-2 py-4 bg-gray-700 rounded-2xl hover:bg-gray-600 active:scale-95 transition border border-gray-600"
            >
              <SendIcon className="w-6 h-6 text-gray-300" />
              <span className="text-sm font-semibold text-gray-300">Send</span>
            </button>
            
            <button
              onClick={() => router.push('/receive')}
              className="flex flex-col items-center gap-2 py-4 bg-gray-700 rounded-2xl hover:bg-gray-600 active:scale-95 transition border border-gray-600"
            >
              <ReceiveIcon className="w-6 h-6 text-gray-300" />
              <span className="text-sm font-semibold text-gray-300">Receive</span>
            </button>
            
            <button
              onClick={() => router.push('/transactions')}
              className="flex flex-col items-center gap-2 py-4 bg-gray-700 rounded-2xl hover:bg-gray-600 active:scale-95 transition border border-gray-600"
            >
              <FilterIcon className="w-6 h-6 text-gray-300" />
              <span className="text-sm font-semibold text-gray-300">History</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('tokens')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                activeTab === 'tokens'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Tokens
            </button>
            <button
              onClick={() => setActiveTab('nfts')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                activeTab === 'nfts'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              NFTs
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                activeTab === 'portfolio'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Portfolio
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => loadWalletData()}
              disabled={refreshing}
              className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-700 transition"
            >
              <RefreshIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-700 transition">
              <SearchIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'tokens' && (
          <>
            {loading ? (
              <div className="space-y-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <TokenRowSkeleton key={i} />
                ))}
              </div>
            ) : tokens.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-lg">No tokens found</p>
                <p className="text-sm mt-2">Receive crypto to get started</p>
              </div>
            ) : (
              <div className="space-y-1">
                {tokens.map((token) => {
                  // Use token's icon property directly from BalanceService (which now uses CoinGecko)
                  const logoUrl = token.logo || `https://via.placeholder.com/48/6B7280/FFFFFF?text=${token.symbol.charAt(0)}`;
                  
                  return (
                    <TokenRow
                      key={`${token.chain}-${token.symbol}-${token.address || 'native'}`}
                      token={token}
                      logoUrl={logoUrl}
                      onClick={() => router.push(`/token/${token.chain.toLowerCase()}/${token.address || 'native'}/${token.symbol}`)}
                    />
                  );
                })}
              </div>
            )}

            {/* Add Token */}
            <button
              onClick={() => setShowAddToken(true)}
              className="w-full mt-4 py-4 border-2 border-dashed border-gray-600 rounded-2xl text-gray-400 font-semibold hover:bg-gray-700 hover:text-gray-300 transition flex items-center justify-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Add Token
            </button>
          </>
        )}

        {activeTab === 'nfts' && (
          <div className="text-center py-12 text-gray-400">
            <EyeIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-lg">No NFTs found</p>
            <p className="text-sm mt-2">Your NFT collection will appear here</p>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="space-y-4">
            {/* Portfolio Overview */}
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Portfolio Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Total Value</p>
                  <p className="text-2xl font-bold text-white">${totalBalance}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">24h Change</p>
                  <p className={`text-2xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}${change24h.value}
                  </p>
                </div>
              </div>
            </div>

            {/* Price Alerts */}
            <div className="bg-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Price Alerts</h3>
                <button
                  onClick={() => router.push('/alerts')}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  Manage
                </button>
              </div>
              <div className="text-center py-8 text-gray-400">
                <BellIcon className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                <p className="text-sm">No price alerts set</p>
                <p className="text-xs mt-1">Set alerts to track price movements</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <WalletSwitcherModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />
      
      <WalletImportModal
        isOpen={showImportWallet}
        onClose={() => setShowImportWallet(false)}
        onSuccess={() => {
          setShowImportWallet(false);
          window.location.reload();
        }}
      />
      
      {showAddToken && (
        <EnhancedTokenSearchModal
          isOpen={showAddToken}
          onClose={() => setShowAddToken(false)}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}


function TokenRow({ token, logoUrl, onClick }: { token: TokenBalance; logoUrl: string; onClick: () => void }) {
  const [logoError, setLogoError] = useState(false);

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 py-3 px-2 hover:bg-gray-700 hover:shadow-lg hover:shadow-gray-700/50 rounded-2xl transition-all duration-200 active:scale-98"
    >
      <div className="relative w-12 h-12 flex-shrink-0">
        {!logoError && logoUrl ? (
          <img
            src={logoUrl}
            alt={token.symbol}
            width={48}
            height={48}
            className="w-full h-full rounded-full object-cover"
            onError={() => {
              console.log(`Failed to load logo for ${token.symbol}: ${logoUrl}`);
              setLogoError(true);
            }}
            onLoad={() => {
              console.log(`Successfully loaded logo for ${token.symbol}: ${logoUrl}`);
            }}
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-xl">
            {token.symbol.charAt(0)}
          </div>
        )}
        
        {!token.isNative && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gray-800 border-2 border-gray-900 flex items-center justify-center text-xs">
            <span className="text-gray-300">{token.chain === 'Ethereum' ? 'E' : 'T'}</span>
          </div>
        )}
      </div>

      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white truncate">{token.symbol}</span>
          {!token.isNative && (
            <span className="px-2 py-0.5 bg-gray-600 text-gray-300 text-xs rounded-full">
              {token.chain}
            </span>
          )}
        </div>
        <div className="text-sm text-gray-400 truncate">{token.name}</div>
        {/* Show price and 24h change if available */}
        <div className="text-xs flex items-center gap-2 mt-1">
          <span className="text-gray-400">
            {token.price && token.price > 0 
              ? `$${token.price.toFixed(6)}`
              : parseFloat(token.balance) > 0 && parseFloat(token.usdValue) > 0
                ? `$${(parseFloat(token.usdValue) / parseFloat(token.balance)).toFixed(6)}`
                : 'Price N/A'
            }
          </span>
          {token.change24h !== undefined && (
            <span className={`${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
            </span>
          )}
        </div>
      </div>

      <div className="text-right">
        <div className="font-semibold text-white">
          {parseFloat(token.balance).toFixed(4)}
        </div>
        <div className="text-sm text-gray-400">
          ${token.usdValue}
        </div>
      </div>
    </button>
  );
}
