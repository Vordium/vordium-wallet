'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

interface Network {
  id: string;
  name: string;
  icon: string;
  chainType: 'EVM' | 'TRON';
}

const NETWORKS: Network[] = [
  { id: 'ethereum', name: 'Ethereum', icon: '⚡', chainType: 'EVM' },
  { id: 'polygon', name: 'Polygon', icon: '🟣', chainType: 'EVM' },
  { id: 'bsc', name: 'BSC', icon: '🟡', chainType: 'EVM' },
  { id: 'arbitrum', name: 'Arbitrum', icon: '🔵', chainType: 'EVM' },
  { id: 'tron', name: 'TRON', icon: '🔺', chainType: 'TRON' },
];

interface NetworkSelectorProps {
  selected: string;
  onSelect: (chainType: 'EVM' | 'TRON') => void;
  onClose: () => void;
}

export function NetworkSelector({ selected, onSelect, onClose }: NetworkSelectorProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-t-3xl md:rounded-2xl w-full md:max-w-md p-6 space-y-4 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-gray-900">Select Network</h3>
        
        <div className="space-y-2">
          {NETWORKS.map((network) => {
            const isSelected = selected === network.chainType;
            return (
              <button
                key={network.id}
                onClick={() => {
                  onSelect(network.chainType);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{network.icon}</span>
                  <span className="font-medium text-gray-900">{network.name}</span>
                </div>
                {isSelected && <Check className="w-5 h-5 text-blue-600" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

