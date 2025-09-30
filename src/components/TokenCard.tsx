'use client';

import React from 'react';

interface TokenCardProps {
  icon?: string;
  symbol: string;
  name: string;
  balance: string;
  value?: string;
  change?: string;
}

export function TokenCard({ icon, symbol, name, balance, value, change }: TokenCardProps) {
  const isUp = (change || '').trim().startsWith('+');
  return (
    <div className="flex items-center justify-between p-3 border rounded-xl hover:bg-gray-50 transition">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold">
          {icon || symbol}
        </div>
        <div>
          <div className="text-sm font-medium">{name}</div>
          <div className="text-xs text-gray-500">{symbol}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-medium">{balance}</div>
        <div className="text-xs text-gray-500 flex items-center gap-2 justify-end">
          {value && <span>{value}</span>}
          {change && (
            <span className={isUp ? 'text-emerald-600' : 'text-rose-600'}>{change}</span>
          )}
        </div>
      </div>
    </div>
  );
}


