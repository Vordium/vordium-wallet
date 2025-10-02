'use client';

import { useState, useEffect } from 'react';
import { SearchIcon, ArrowLeftIcon } from './icons/GrayIcons';
import { type TokenBalance } from '@/services/balance.service';
import { FormInputSkeleton } from './ui/Skeleton';

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

  useEffect(() => {
    if (searchQuery) {
      const filtered = tokens.filter(token =>
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTokens(filtered);
    } else {
      setFilteredTokens(tokens);
    }
  }, [searchQuery, tokens]);

  const handleSelect = (token: TokenBalance) => {
    onSelect(token);
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
          {filteredTokens.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-sm">No tokens found</div>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredTokens.map((token) => (
                <button
                  key={`${token.chain}-${token.address || token.symbol}`}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
