'use client';

import { useState } from 'react';
import { AlertTriangleIcon, CheckIcon, ArrowLeftIcon } from './icons/GrayIcons';
import { PINVerification } from './PINVerification';

interface TransactionDetails {
  from: string;
  to: string;
  amount: string;
  token: string;
  chain: string;
  gasFee?: string;
  total?: string;
}

interface SecureTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  transaction: TransactionDetails;
  isLoading?: boolean;
}

export function SecureTransactionModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  transaction,
  isLoading = false
}: SecureTransactionModalProps) {
  const [showPINVerification, setShowPINVerification] = useState(false);
  const [step, setStep] = useState<'review' | 'confirm'>('review');

  const handleConfirm = () => {
    // Check if PIN is enabled
    const securitySettings = localStorage.getItem('vordium-security-settings');
    const pinEnabled = securitySettings ? JSON.parse(securitySettings).pinEnabled : false;
    
    if (pinEnabled) {
      setShowPINVerification(true);
    } else {
      onConfirm();
    }
  };

  const handlePINSuccess = () => {
    setShowPINVerification(false);
    setStep('confirm');
    onConfirm();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
        <div className="bg-gray-800 rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gray-700 p-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-gray-600 hover:bg-gray-500 flex items-center justify-center transition"
              >
                <ArrowLeftIcon className="w-5 h-5 text-white" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-white">Confirm Transaction</h2>
                <p className="text-gray-300 text-sm">Review details before sending</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Security Warning */}
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangleIcon className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-400 mb-1">Security Notice</h3>
                  <p className="text-yellow-300 text-sm">
                    This transaction cannot be reversed. Please verify all details carefully before confirming.
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Transaction Details</h3>
              
              <div className="bg-gray-700 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">From</span>
                  <span className="text-white font-mono text-sm">{formatAddress(transaction.from)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">To</span>
                  <span className="text-white font-mono text-sm">{formatAddress(transaction.to)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Amount</span>
                  <span className="text-white font-semibold">
                    {transaction.amount} {transaction.token}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Network</span>
                  <span className="text-white">{transaction.chain}</span>
                </div>
                
                {transaction.gasFee && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Gas Fee</span>
                    <span className="text-white">{transaction.gasFee}</span>
                  </div>
                )}
                
                {transaction.total && (
                  <div className="flex justify-between items-center pt-2 border-t border-gray-600">
                    <span className="text-gray-300 font-semibold">Total</span>
                    <span className="text-white font-bold">{transaction.total}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 py-3 px-4 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-500 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex-1 py-3 px-4 bg-gray-500 text-white font-semibold rounded-xl hover:bg-gray-400 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    Confirm & Send
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PIN Verification Modal */}
      <PINVerification
        isOpen={showPINVerification}
        onClose={() => setShowPINVerification(false)}
        onSuccess={handlePINSuccess}
        title="Verify PIN"
        subtitle="Enter your PIN to confirm this transaction"
      />
    </>
  );
}
