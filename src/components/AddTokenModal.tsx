'use client';

import { useState } from 'react';
import { X, Search } from 'lucide-react';
import { Button } from './ui/Button';

interface Token {
  address: string;
  symbol: string;
  name: string;
  icon?: string;
}

const POPULAR_TOKENS: Record<string, Token[]> = {
  EVM: [
    { address: '0xdac17f958d2ee523a2206206994597c13d831ec7', symbol: 'USDT', name: 'Tether USD', icon: '💲' },
    { address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', symbol: 'USDC', name: 'USD Coin', icon: '💲' },
    { address: '0x6b175474e89094c44da98b954eedeac495271d0f', symbol: 'DAI', name: 'Dai Stablecoin', icon: '🟡' },
    { address: '0x514910771af9ca656af840dff83e8264ecf986ca', symbol: 'LINK', name: 'Chainlink', icon: '🔗' },
  ],
  TRON: [
    { address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', symbol: 'USDT', name: 'Tether USD', icon: '💲' },
    { address: 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8', symbol: 'USDC', name: 'USD Coin', icon: '💲' },
  ],
};

interface AddTokenModalProps {
  chain: 'EVM' | 'TRON';
  onClose: () => void;
  onAdd: (token: Token) => void;
}

export function AddTokenModal({ chain, onClose, onAdd }: AddTokenModalProps) {
  const [search, setSearch] = useState('');
  const [customAddress, setCustomAddress] = useState('');

  const popular = POPULAR_TOKENS[chain] || [];
  const filtered = popular.filter(
    t => t.symbol.toLowerCase().includes(search.toLowerCase()) || 
         t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Add Token</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search or paste address"
            className="w-full border rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Popular Tokens */}
        {filtered.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Popular Tokens</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filtered.map((token) => (
                <button
                  key={token.address}
                  onClick={() => {
                    onAdd(token);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
                >
                  <span className="text-2xl">{token.icon}</span>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{token.symbol}</p>
                    <p className="text-xs text-gray-500">{token.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Token */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Custom Token</p>
          <input
            type="text"
            value={customAddress}
            onChange={(e) => setCustomAddress(e.target.value)}
            placeholder="Contract Address"
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button disabled={!customAddress} onClick={() => alert('Custom token import coming soon')}>
            Import Token
          </Button>
        </div>
      </div>
    </div>
  );
}

