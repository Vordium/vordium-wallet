'use client';

import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface BalanceCardProps {
  balance: string;
  change: string;
  isPositive: boolean;
  hideBalance: boolean;
  onToggleHide: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  change,
  isPositive,
  hideBalance,
  onToggleHide,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl p-6 text-white shadow-xl bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="absolute inset-0 backdrop-blur-[2px] bg-white/5" />
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/80">Total Balance</span>
          <button onClick={onToggleHide} className="p-1 rounded hover:bg-white/10">
            {hideBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
        </div>
        <div className="text-3xl font-bold tracking-tight">
          {hideBalance ? '••••••' : balance}
        </div>
        <div className={`mt-1 text-sm ${isPositive ? 'text-emerald-300' : 'text-rose-300'}`}>{change}</div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-lg py-2 text-center text-sm hover:bg-white/20 cursor-pointer">Send</div>
          <div className="bg-white/10 rounded-lg py-2 text-center text-sm hover:bg-white/20 cursor-pointer">Receive</div>
          <div className="bg-white/10 rounded-lg py-2 text-center text-sm hover:bg-white/20 cursor-pointer">Swap</div>
        </div>
      </div>
    </div>
  );
};


