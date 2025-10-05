'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import TronWeb from 'tronweb';
import { useWalletStore } from '@/store/walletStore';
import { TokenSearchService, type TokenSearchResult } from '@/services/tokenSearch.service';
import { SearchIcon, PlusIcon, ArrowLeftIcon } from './icons/GrayIcons';
import { ModalSkeleton, FormInputSkeleton } from './ui/Skeleton';
import Image from 'next/image';

export function AddTokenModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<EnhancedTokenSearchResult[]>([]);
  const [customAddress, setCustomAddress] = useState('');
  const [selectedChain, setSelectedChain] = useState<'Ethereum' | 'Tron' | 'Solana' | 'Bitcoin'>('Ethereum');
  const [successMessage, setSuccessMessage] = useState('');
  
  const addToken = useWalletStore(state => state.addToken);
  const accounts = useWalletStore(state => state.accounts);

  // Search tokens using enhanced service with live API data
  useEffect(() => {
    const searchTokens = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      // Use live search via our API route (avoids CORS issues)
      console.log('AddTokenModal: Searching live tokens via API route');
      try {
        const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        
        const liveResults: TokenSearchResult[] = data.coins?.slice(0, 10).map((coin: any) => ({
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          address: coin.id, // Use CoinGecko ID as identifier
          chain: selectedChain, // Use selected chain
          decimals: 18,
          logo: coin.large || coin.small || coin.thumb || '',
          verified: true,
        })) || [];
        
        setSearchResults(liveResults);
        console.log('AddTokenModal live search results:', liveResults.length);
      } catch (error) {
        console.error('AddTokenModal live search failed, using static search:', error);
        // Fallback to static search
        const staticResults = TokenSearchService.searchTokens(searchQuery, selectedChain);
        setSearchResults(staticResults);
      }
      
      setSearching(false);
    };

    searchTokens();
  }, [searchQuery, selectedChain]);

  // Add token from search
  async function handleAddToken(token: TokenSearchResult) {
    try {
      setSearching(true);
      
      // Get user address
      const chainMap: Record<string, string> = {
        'Ethereum': 'EVM',
        'Tron': 'TRON',
        'Solana': 'SOLANA',
        'Bitcoin': 'BITCOIN'
      };
      const userAddress = accounts.find(a => 
        a.chain === chainMap[token.chain]
      )?.address;
      
      if (!userAddress) {
        setSuccessMessage('No account found for this chain');
        setTimeout(() => setSuccessMessage(''), 3000);
        return;
      }

      // Fetch balance
      let balance = '0';
      
      if (token.chain === 'Ethereum' && token.address !== 'native') {
        try {
          const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ETHEREUM_RPC || 'https://eth.llamarpc.com');
          const contract = new ethers.Contract(
            token.address,
            ['function balanceOf(address) view returns (uint256)'],
            provider
          );
          const bal = await contract.balanceOf(userAddress);
          balance = ethers.formatUnits(bal, token.decimals);
        } catch {
          balance = '0';
        }
      } else if (token.chain === 'Tron' && token.address !== 'native') {
        try {
          const tronWeb = new TronWeb({ fullHost: 'https://api.trongrid.io' });
          const contract = await tronWeb.contract().at(token.address);
          const bal = await contract.balanceOf(userAddress).call();
          balance = (bal / Math.pow(10, token.decimals)).toString();
        } catch {
          balance = '0';
        }
      }

      // Debug logging
      console.log('Adding token to store:', {
        symbol: token.symbol,
        name: token.name,
        address: token.address,
        chain: token.chain,
        decimals: token.decimals,
        balance,
        logo: token.logo,
        isNative: false,
        usdValue: '0'
      });

      // Add to store
      addToken({
        symbol: token.symbol,
        name: token.name,
        address: token.address,
        chain: token.chain,
        decimals: token.decimals,
        balance,
        logo: token.logo,
        isNative: false,
        usdValue: '0'
      });

      setSuccessMessage(`${token.symbol} added successfully!`);
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
        // Trigger a custom event to refresh dashboard
        window.dispatchEvent(new CustomEvent('tokenAdded'));
      }, 1500);
      
    } catch (error) {
      setSuccessMessage('Failed to add token: ' + (error as Error).message);
    } finally {
      setSearching(false);
    }
  }

  // Add custom token by address
  async function handleAddCustomToken() {
    if (!customAddress) {
      setSuccessMessage('Please enter a contract address');
      setTimeout(() => setSuccessMessage(''), 3000);
      return;
    }

    try {
      setSearching(true);
      
      const chainMap: Record<string, string> = {
        'Ethereum': 'EVM',
        'Tron': 'TRON',
        'Solana': 'SOLANA',
        'Bitcoin': 'BITCOIN'
      };
      const userAddress = accounts.find(a => 
        a.chain === chainMap[selectedChain]
      )?.address;

      if (!userAddress) {
        setSuccessMessage('No account found');
        setTimeout(() => setSuccessMessage(''), 3000);
        return;
      }

      let tokenInfo: TokenSearchResult;

      if (selectedChain === 'Ethereum') {
        if (!ethers.isAddress(customAddress)) {
          throw new Error('Invalid Ethereum address');
        }

        const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ETHEREUM_RPC || 'https://eth.llamarpc.com');
        const contract = new ethers.Contract(
          customAddress,
          [
            'function name() view returns (string)',
            'function symbol() view returns (string)',
            'function decimals() view returns (uint8)',
            'function balanceOf(address) view returns (uint256)'
          ],
          provider
        );

        const [name, symbol, decimals, balance] = await Promise.all([
          contract.name(),
          contract.symbol(),
          contract.decimals(),
          contract.balanceOf(userAddress)
        ]);

        const checksumAddress = ethers.getAddress(customAddress);
        const logo = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${checksumAddress}/logo.png`;

        tokenInfo = {
          symbol,
          name,
          address: checksumAddress,
          chain: 'Ethereum',
          decimals: Number(decimals),
          logo,
          balance: ethers.formatUnits(balance, decimals)
        };
      } else {
        const tronWeb = new TronWeb({ fullHost: 'https://api.trongrid.io' });
        const contract = await tronWeb.contract().at(customAddress);

        const [name, symbol, decimals, balance] = await Promise.all([
          contract.name().call(),
          contract.symbol().call(),
          contract.decimals().call(),
          contract.balanceOf(userAddress).call()
        ]);

        const logo = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/tron/assets/${customAddress}/logo.png`;

        tokenInfo = {
          symbol,
          name,
          address: customAddress,
          chain: 'Tron',
          decimals: Number(decimals),
          logo,
          balance: (balance / Math.pow(10, decimals)).toString()
        };
      }

      // Add token
      addToken({
        symbol: tokenInfo.symbol,
        name: tokenInfo.name,
        address: tokenInfo.address,
        chain: tokenInfo.chain,
        decimals: tokenInfo.decimals,
        balance: tokenInfo.balance!,
        logo: tokenInfo.logo,
        isNative: false,
        usdValue: '0'
      });

      setSuccessMessage(`${tokenInfo.symbol} added successfully!`);
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
        // Trigger a custom event to refresh dashboard
        window.dispatchEvent(new CustomEvent('tokenAdded'));
      }, 1500);

    } catch (error) {
      setSuccessMessage('Failed: ' + (error as Error).message);
    } finally {
      setSearching(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gray-700 p-6">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-600 hover:bg-gray-500 flex items-center justify-center transition">
              <ArrowLeftIcon className="w-5 h-5 text-white" />
            </button>
            <h2 className="text-2xl font-bold text-white">Add Token</h2>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-4 bg-gray-700 border border-gray-600 rounded-xl">
              <p className="text-white font-medium">{successMessage}</p>
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tokens (USDT, USDC, DAI, UNI...)"
                  className="w-full pl-10 pr-4 py-4 text-white bg-gray-700 border-2 border-gray-600 rounded-xl text-lg focus:border-gray-500 focus:ring-4 focus:ring-gray-500"
                />
            </div>
          </div>

              {/* Search Results */}
              {searching && searchQuery ? (
                <div className="mb-6 space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-full flex items-center gap-3 p-4 bg-gray-700 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-gray-600 animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-600 rounded animate-pulse w-20"></div>
                        <div className="h-3 bg-gray-600 rounded animate-pulse w-32"></div>
                      </div>
                      <div className="w-16 h-6 bg-gray-600 rounded-full animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : searchResults.length > 0 ? (
                <div className="mb-6 space-y-2">
                  {searchResults.map((token, index) => (
                    <button
                      key={index}
                      onClick={() => handleAddToken(token)}
                      disabled={searching}
                      className="w-full flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50"
                    >
                      <Image src={token.logo} alt={token.symbol} width={40} height={40} className="w-10 h-10 rounded-full" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/40'} />
                      <div className="flex-1 text-left">
                        <div className="font-bold text-gray-900 dark:text-white">{token.symbol}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">{token.name}</div>
                        {token.verified && (
                          <div className="text-xs text-green-600 dark:text-green-400">✓ Verified</div>
                        )}
                      </div>
                      <div className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-full">
                        {token.chain}
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}

          {/* Custom Token */}
          <div className="border-t-2 border-gray-200 dark:border-gray-600 pt-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Add Custom Token</h3>
            
            {/* Chain Selector */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => setSelectedChain('Ethereum')}
                className={`py-3 rounded-xl font-bold transition ${
                  selectedChain === 'Ethereum'
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Ethereum
              </button>
              <button
                onClick={() => setSelectedChain('Tron')}
                className={`py-3 rounded-xl font-bold transition ${
                  selectedChain === 'Tron'
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                TRON
              </button>
              <button
                onClick={() => setSelectedChain('Solana')}
                className={`py-3 rounded-xl font-bold transition ${
                  selectedChain === 'Solana'
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Solana
              </button>
              <button
                onClick={() => setSelectedChain('Bitcoin')}
                className={`py-3 rounded-xl font-bold transition ${
                  selectedChain === 'Bitcoin'
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Bitcoin
              </button>
            </div>

            {/* Contract Address Input */}
            <input
              type="text"
              value={customAddress}
              onChange={(e) => setCustomAddress(e.target.value)}
              placeholder={
                selectedChain === 'Ethereum' ? '0x...' :
                selectedChain === 'Tron' ? 'T...' :
                selectedChain === 'Solana' ? 'So...' :
                '1...'
              }
              className="w-full px-4 py-4 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-mono text-sm mb-4 focus:border-gray-500 dark:focus:border-gray-500 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-500"
            />

            <button
              onClick={handleAddCustomToken}
              disabled={!customAddress || searching}
              className="w-full py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold rounded-xl hover:from-gray-500 hover:to-gray-600 disabled:from-gray-400 disabled:to-gray-500 transition flex items-center justify-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              {searching ? 'Adding...' : 'Add Token'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}