'use client';

import { useState, useEffect } from 'react';
import { MultiChainTokenService, type MultiChainTokenInfo, type TokenSearchFilter } from '@/services/multiChainToken.service';
import { useWalletStore, type Token as WalletToken } from '@/store/walletStore';
import { SearchIcon, PlusIcon, XIcon } from './icons/GrayIcons';

export function EnhancedTokenSearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MultiChainTokenInfo[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedChains, setSelectedChains] = useState<('Ethereum' | 'Tron' | 'Solana' | 'Bitcoin' | 'BSC' | 'Polygon' | 'Arbitrum')[]>([]);
  const [successMessage, setSuccessMessage] = useState('');

  const { addToken } = useWalletStore();

  const availableChains = [
    { id: 'Ethereum', name: 'Ethereum', color: 'bg-blue-600' },
    { id: 'BSC', name: 'BNB Smart Chain', color: 'bg-yellow-600' },
    { id: 'Polygon', name: 'Polygon', color: 'bg-purple-600' },
    { id: 'Arbitrum', name: 'Arbitrum', color: 'bg-blue-500' },
    { id: 'Tron', name: 'TRON', color: 'bg-red-600' },
    { id: 'Solana', name: 'Solana', color: 'bg-purple-500' },
    { id: 'Bitcoin', name: 'Bitcoin', color: 'bg-orange-600' },
  ];

  // Search tokens when query changes
  useEffect(() => {
    const searchTokens = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      
      try {
        const filter: TokenSearchFilter = {
          chains: selectedChains.length > 0 ? selectedChains : undefined,
          verifiedOnly: false,
          includePrices: true,
        };

        const results = await MultiChainTokenService.searchTokens(searchQuery, filter);
        setSearchResults(results);
        console.log('Enhanced search results:', results.length, 'tokens found');
      } catch (error) {
        console.error('Enhanced search failed:', error);
        setSearchResults([]);
      }
      
      setSearching(false);
    };

    const timeoutId = setTimeout(searchTokens, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedChains]);

  const handleAddToken = async (token: MultiChainTokenInfo) => {
    try {
      setSearching(true);

      // Create token object for wallet store
      const tokenToAdd: WalletToken = {
        symbol: token.symbol,
        name: token.name,
        address: token.address,
        chain: token.chain,
        decimals: token.decimals,
        balance: '0',
        logo: token.logo,
        isNative: token.isNative,
        usdValue: '0'
      };

      console.log('Adding token to store:', tokenToAdd);
      addToken(tokenToAdd);
      console.log('Token added to store successfully');

      setSuccessMessage(`${token.symbol} added successfully!`);
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
        window.dispatchEvent(new CustomEvent('tokenAdded', { detail: { token: tokenToAdd } }));
      }, 1500);
      
    } catch (error) {
      setSuccessMessage('Failed to add token: ' + (error as Error).message);
    } finally {
      setSearching(false);
    }
  };

  const toggleChain = (chainId: string) => {
    const chain = chainId as 'Ethereum' | 'Tron' | 'Solana' | 'Bitcoin' | 'BSC' | 'Polygon' | 'Arbitrum';
    setSelectedChains(prev => 
      prev.includes(chain) 
        ? prev.filter(c => c !== chain)
        : [...prev, chain]
    );
  };

  const clearFilters = () => {
    setSelectedChains([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Add Token</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition"
            >
              <XIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or symbol..."
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>

          {/* Chain Filter */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Filter by Chain</span>
              {selectedChains.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {availableChains.map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => toggleChain(chain.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    selectedChains.includes(chain.id as any)
                      ? `${chain.color} text-white`
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {chain.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="px-6 py-3 bg-green-600 text-white text-center">
            {successMessage}
          </div>
        )}

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {searching ? (
            <div className="p-6 text-center text-gray-400">
              <div className="animate-spin w-6 h-6 border-2 border-gray-600 border-t-white rounded-full mx-auto mb-2"></div>
              Searching tokens...
            </div>
          ) : searchResults.length === 0 && searchQuery.length >= 2 ? (
            <div className="p-6 text-center text-gray-400">
              No tokens found for &quot;{searchQuery}&quot;
              {selectedChains.length > 0 && (
                <div className="text-sm mt-1">
                  on {selectedChains.join(', ')}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {searchResults.map((token, index) => (
                <button
                  key={index}
                  onClick={() => handleAddToken(token)}
                  disabled={searching}
                  className="w-full flex items-center gap-3 p-4 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 transition disabled:opacity-50"
                >
                  <img 
                    src={token.logo || `https://via.placeholder.com/40/6B7280/FFFFFF?text=${token.symbol.charAt(0)}`} 
                    alt={token.symbol} 
                    width={40} 
                    height={40} 
                    className="w-10 h-10 rounded-full bg-gray-600 object-cover" 
                    onError={(e) => {
                      e.currentTarget.src = `https://via.placeholder.com/40/6B7280/FFFFFF?text=${token.symbol.charAt(0)}`;
                    }}
                  />
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{token.symbol}</span>
                      <span className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded-full">
                        {token.chain}
                      </span>
                      {token.verified && (
                        <span className="text-xs text-green-400">✓</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-300">{token.name}</div>
                    <div className="text-sm text-gray-400">
                      {token.priceFormatted}
                      {token.change24h && (
                        <span className={`ml-2 ${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-gray-600 text-gray-300 text-xs font-bold rounded-full">
                    <PlusIcon className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <div className="text-xs text-gray-400 text-center">
            Select chains to filter results, or leave empty to search all chains
          </div>
        </div>
      </div>
    </div>
  );
}
