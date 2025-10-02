'use client';

import { useState, useEffect } from 'react';
import { EyeIcon, EyeOffIcon, AlertTriangleIcon, CheckIcon } from './icons/GrayIcons';

interface PINVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  subtitle?: string;
  maxAttempts?: number;
}

export function PINVerification({ 
  isOpen, 
  onClose, 
  onSuccess, 
  title = "Enter PIN",
  subtitle = "Verify your identity to continue",
  maxAttempts = 3
}: PINVerificationProps) {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError('');
      setAttempts(0);
      setShowPin(false);
    }
  }, [isOpen]);

  const handleVerify = async () => {
    if (pin.length < 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }

    setIsVerifying(true);
    
    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const savedPin = localStorage.getItem('vordium-pin');
    const isCorrect = savedPin && atob(savedPin) === pin;
    
    if (isCorrect) {
      setError('');
      onSuccess();
      onClose();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= maxAttempts) {
        setError(`Too many failed attempts. Please try again later.`);
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setError(`Incorrect PIN. ${maxAttempts - newAttempts} attempts remaining.`);
      }
      setPin('');
    }
    
    setIsVerifying(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && pin.length === 4) {
      handleVerify();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-3xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangleIcon className="w-8 h-8 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          <p className="text-gray-400">{subtitle}</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Enter your 4-digit PIN
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                onKeyPress={handleKeyPress}
                className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-gray-500"
                placeholder="••••"
                maxLength={4}
                autoFocus
              />
              <button
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPin ? <EyeOffIcon className="w-5 h-5 text-gray-400" /> : <EyeIcon className="w-5 h-5 text-gray-400" />}
              </button>
            </div>
          </div>

          {error && (
            <div className={`p-3 rounded-lg text-sm ${
              error.includes('Too many') 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
            }`}>
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={isVerifying}
              className="flex-1 py-3 px-4 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-500 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleVerify}
              disabled={pin.length < 4 || isVerifying}
              className="flex-1 py-3 px-4 bg-gray-500 text-white font-semibold rounded-xl hover:bg-gray-400 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckIcon className="w-4 h-4" />
                  Verify
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
