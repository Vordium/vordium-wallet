'use client';

import { useState, useEffect } from 'react';
import { SearchIcon, ArrowLeftIcon } from './icons/GrayIcons';
import { type TokenBalance } from '@/services/balance.service';
import { FormInputSkeleton } from './ui/Skeleton';
import { TokenSearchService, type TokenSearchResult } from '@/services/tokenSearch.service';
import { EnhancedTokenSearchService, type EnhancedTokenSearchResult } from '@/services/enhancedTokenSearch.service';

interface TokenSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: TokenBalance) => void;
  tokens: TokenBalance[];
  selectedToken?: TokenBalance | null;
  title?: string;
}

export function TokenSelector({ 
  isOpen, 
  onClose, 
  onSelect, 
  tokens, 
  selectedToken,
  title = "Select Token"
}: TokenSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTokens, setFilteredTokens] = useState<TokenBalance[]>([]);
  const [searchResults, setSearchResults] = useState<EnhancedTokenSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchQuery && searchQuery.length >= 2) {
      setIsSearching(true);
      // Search in both dashboard tokens and popular tokens
      const dashboardFiltered = tokens.filter(token =>
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      // Get search results from Enhanced TokenSearchService
      EnhancedTokenSearchService.searchTokens(searchQuery)
        .then(popularResults => {
          setSearchResults(popularResults);
          setFilteredTokens(dashboardFiltered);
          setIsSearching(false);
        })
        .catch(error => {
          console.error('Error searching tokens:', error);
          // Fallback to static search
          const staticResults = TokenSearchService.searchTokens(searchQuery);
          setSearchResults(staticResults.map(result => ({
            symbol: result.symbol,
            name: result.name,
            address: result.address,
            chain: result.chain,
            decimals: result.decimals,
            logo: result.logo,
            verified: result.verified,
          })));
          setFilteredTokens(dashboardFiltered);
          setIsSearching(false);
        });
    } else {
      setFilteredTokens(tokens);
      setSearchResults([]);
    }
  }, [searchQuery, tokens]);

  const handleSelect = (token: TokenBalance) => {
    onSelect(token);
    onClose();
  };

  const handleSelectSearchResult = (searchResult: EnhancedTokenSearchResult) => {
    // Convert EnhancedTokenSearchResult to TokenBalance format
    const tokenBalance: TokenBalance = {
      symbol: searchResult.symbol,
      name: searchResult.name,
      balance: '0', // No balance for search results
      usdValue: '0',
      chain: searchResult.chain as 'Ethereum' | 'Tron' | 'Solana' | 'Bitcoin',
      address: searchResult.address,
      decimals: searchResult.decimals,
      isNative: searchResult.address === 'native',
      icon: searchResult.logo,
    };
    onSelect(tokenBalance);
    onClose();
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.0001) return '< 0.0001';
    return num.toFixed(4);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-gray-800 rounded-t-3xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 hover:bg-gray-600 transition"
          >
            <ArrowLeftIcon className="w-4 h-4" />
          </button>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <div className="w-8" /> {/* Spacer */}
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-700 text-white px-10 py-3 rounded-xl outline-none placeholder-gray-400"
            />
          </div>
        </div>

        {/* Token List */}
        <div className="flex-1 overflow-y-auto">
          {isSearching ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <div className="text-gray-400 text-sm">Searching tokens...</div>
            </div>
          ) : filteredTokens.length === 0 && searchResults.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-sm">No tokens found</div>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {/* Dashboard Tokens (with balances) */}
              {filteredTokens.length > 0 && (
                <>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Your Tokens
                  </div>
                  {filteredTokens.map((token) => (
                    <button
                      key={`dashboard-${token.chain}-${token.address || token.symbol}`}
                      onClick={() => handleSelect(token)}
                      className={`w-full p-3 rounded-xl hover:bg-gray-700 transition text-left ${
                        selectedToken?.symbol === token.symbol && selectedToken?.chain === token.chain
                          ? 'bg-gray-700'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={token.icon}
                          alt={token.symbol}
                          className="w-10 h-10 rounded-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://via.placeholder.com/40/374151/9CA3AF?text=${token.symbol.charAt(0)}`;
                          }}
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{token.symbol}</span>
                            <span className="text-xs px-2 py-1 bg-gray-600 text-gray-300 rounded-full">
                              {token.chain}
                            </span>
                          </div>
                          <div className="text-sm text-gray-400 truncate">{token.name}</div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm font-medium text-white">
                            {formatBalance(token.balance)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatCurrency(parseFloat(token.balance) * parseFloat(token.usdValue))}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </>
              )}

              {/* Search Results (popular tokens) */}
              {searchResults.length > 0 && (
                <>
                  {filteredTokens.length > 0 && <div className="h-px bg-gray-700 my-2"></div>}
                  <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Popular Tokens
                  </div>
                  {searchResults.map((searchResult) => (
                    <button
                      key={`search-${searchResult.chain}-${searchResult.address}`}
                      onClick={() => handleSelectSearchResult(searchResult)}
                      className="w-full p-3 rounded-xl hover:bg-gray-700 transition text-left"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={searchResult.logo}
                          alt={searchResult.symbol}
                          className="w-10 h-10 rounded-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://via.placeholder.com/40/374151/9CA3AF?text=${searchResult.symbol.charAt(0)}`;
                          }}
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{searchResult.symbol}</span>
                            <span className="text-xs px-2 py-1 bg-gray-600 text-gray-300 rounded-full">
                              {searchResult.chain}
                            </span>
                            {searchResult.verified && (
                              <span className="text-xs px-2 py-1 bg-green-600 text-white rounded-full">
                                ✓
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-400 truncate">{searchResult.name}</div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm text-gray-400">Add Token</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
