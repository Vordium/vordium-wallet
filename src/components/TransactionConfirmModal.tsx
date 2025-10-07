'use client';

import { useState, useEffect } from 'react';
import { XIcon, AlertTriangleIcon, CheckIcon } from './icons/GrayIcons';
import type { TransactionRequest, FeeEstimate } from '@/services/unifiedTransaction.service';
import { UnifiedTransactionService } from '@/services/unifiedTransaction.service';

interface TransactionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  transaction: TransactionRequest;
  balance: string;
}

export function TransactionConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  transaction,
  balance
}: TransactionConfirmModalProps) {
  const [fees, setFees] = useState<FeeEstimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [tokenPrice, setTokenPrice] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      loadFees();
      loadTokenPrice();
    }
  }, [isOpen, transaction]);

  const loadFees = async () => {
    setLoading(true);
    try {
      const feeEstimate = await UnifiedTransactionService.estimateFees(transaction);
      setFees(feeEstimate);
    } catch (error) {
      console.error('Failed to estimate fees:', error);
    }
    setLoading(false);
  };

  const loadTokenPrice = async () => {
    try {
      // Fetch token price for USD conversion
      const symbol = transaction.token ? 'token' : getNativeSymbol(transaction.chain);
      const response = await fetch(`/api/prices?ids=${symbol.toLowerCase()}`);
      const data = await response.json();
      setTokenPrice(data[symbol.toLowerCase()]?.usd || 0);
    } catch (error) {
      console.error('Failed to load token price:', error);
    }
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Transaction failed:', error);
    }
    setConfirming(false);
  };

  const getNativeSymbol = (chain: string): string => {
    const symbols: Record<string, string> = {
      'Ethereum': 'ethereum',
      'BSC': 'binancecoin',
      'Polygon': 'matic-network',
      'Arbitrum': 'ethereum',
      'Tron': 'tron',
      'Solana': 'solana',
      'Bitcoin': 'bitcoin'
    };
    return symbols[chain] || 'ethereum';
  };

  const getDangerLevel = (): 'low' | 'medium' | 'high' => {
    const amount = parseFloat(transaction.amount);
    const usdValue = amount * tokenPrice;
    
    if (usdValue > 10000) return 'high';
    if (usdValue > 1000) return 'medium';
    return 'low';
  };

  const getTotalCost = (): string => {
    if (!fees) return transaction.amount;
    const amount = parseFloat(transaction.amount);
    const fee = parseFloat(fees.estimated);
    return (amount + fee).toFixed(8);
  };

  const getUSDValue = (value: string): string => {
    if (!tokenPrice) return '$0.00';
    const usd = parseFloat(value) * tokenPrice;
    return `$${usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const dangerLevel = getDangerLevel();
  const dangerColors = {
    low: 'border-green-600 bg-green-600/10',
    medium: 'border-yellow-600 bg-yellow-600/10',
    high: 'border-red-600 bg-red-600/10'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Confirm Transaction</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition"
            >
              <XIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Danger Level Warning */}
        {dangerLevel !== 'low' && (
          <div className={`p-4 border-b ${dangerColors[dangerLevel]} border-gray-700 flex items-start gap-3`}>
            <AlertTriangleIcon className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">
                {dangerLevel === 'high' ? 'High Value Transaction' : 'Medium Value Transaction'}
              </div>
              <div className="text-sm text-gray-300 mt-1">
                Please carefully review all transaction details before confirming.
              </div>
            </div>
          </div>
        )}

        {/* Transaction Details */}
        <div className="p-6 space-y-4">
          {/* From Address */}
          <div>
            <div className="text-sm text-gray-400 mb-1">From</div>
            <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
              <div className="text-white font-mono text-sm truncate">
                {transaction.from}
              </div>
            </div>
          </div>

          {/* To Address */}
          <div>
            <div className="text-sm text-gray-400 mb-1">To</div>
            <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
              <div className="text-white font-mono text-sm truncate">
                {transaction.to}
              </div>
            </div>
          </div>

          {/* Amount */}
          <div>
            <div className="text-sm text-gray-400 mb-1">Amount</div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="text-2xl font-bold text-white">
                {transaction.amount} {transaction.token ? 'TOKEN' : getNativeSymbol(transaction.chain).toUpperCase()}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {getUSDValue(transaction.amount)}
              </div>
            </div>
          </div>

          {/* Network Fee */}
          <div>
            <div className="text-sm text-gray-400 mb-1">Network Fee</div>
            <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
              {loading ? (
                <div className="animate-pulse h-6 bg-gray-700 rounded"></div>
              ) : fees ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-white">
                      {fees.estimated} {fees.currency}
                    </span>
                    <span className="text-sm text-gray-400">
                      {getUSDValue(fees.estimated)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Low: {fees.low} • High: {fees.high}
                  </div>
                </>
              ) : (
                <div className="text-red-400 text-sm">Failed to estimate fees</div>
              )}
            </div>
          </div>

          {/* Total Cost */}
          <div>
            <div className="text-sm text-gray-400 mb-1">Total Cost</div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="text-xl font-bold text-white">
                {getTotalCost()} {fees?.currency || 'TOKEN'}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {getUSDValue(getTotalCost())}
              </div>
            </div>
          </div>

          {/* Current Balance */}
          <div className="text-sm text-gray-400">
            Your balance: {balance} {fees?.currency || 'TOKEN'}
          </div>

          {/* Warning if insufficient balance */}
          {parseFloat(balance) < parseFloat(getTotalCost()) && (
            <div className="bg-red-600/10 border border-red-600 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-400">
                Insufficient balance to complete this transaction including fees.
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-700 flex gap-3">
          <button
            onClick={onClose}
            disabled={confirming}
            className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirming || loading || parseFloat(balance) < parseFloat(getTotalCost())}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {confirming ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                Confirming...
              </>
            ) : (
              <>
                <CheckIcon className="w-5 h-5" />
                Confirm
              </>
            )}
          </button>
        </div>

        {/* Security Notice */}
        <div className="px-6 pb-6 text-xs text-gray-500 text-center">
          Double-check all details. Transactions cannot be reversed.
        </div>
      </div>
    </div>
  );
}

