'use client';

import { useState, useEffect } from 'react';
import { ArrowLeftIcon, CheckIcon, XIcon, ShieldIcon } from '@/components/icons/GrayIcons';
import { biometricService, type BiometricCapabilities } from '@/services/biometric.service';

interface BiometricSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BiometricSetupModal({ isOpen, onClose, onSuccess }: BiometricSetupModalProps) {
  const [step, setStep] = useState<'check' | 'register' | 'success' | 'error'>('check');
  const [capabilities, setCapabilities] = useState<BiometricCapabilities | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableMethods, setAvailableMethods] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      checkBiometricSupport();
    }
  }, [isOpen]);

  const checkBiometricSupport = async () => {
    setLoading(true);
    try {
      const caps = await biometricService.checkCapabilities();
      setCapabilities(caps);
      
      if (caps.isSupported) {
        const methods = await biometricService.getAvailableMethods();
        setAvailableMethods(methods);
        setStep('register');
      } else {
        setError('Biometric authentication is not supported on this device');
        setStep('error');
      }
    } catch (err) {
      setError('Failed to check biometric support');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const result = await biometricService.registerBiometric(
        'vordium_user',
        'Vordium Wallet User'
      );

      if (result.success) {
        setStep('success');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setError(result.error || 'Registration failed');
        setStep('error');
      }
    } catch (err) {
      setError('Registration failed');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const getMethodDisplayName = (method: string) => {
    switch (method) {
      case 'fingerprint': return 'Fingerprint';
      case 'face': return 'Face ID';
      case 'iris': return 'Iris';
      case 'voice': return 'Voice';
      default: return method;
    }
  };

  const getMethodIcon = (method: string) => {
    return <ShieldIcon className="w-6 h-6 text-blue-400" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 hover:bg-gray-600 transition"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-white">Biometric Setup</h2>
          <div className="w-10" />
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'check' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Checking Biometric Support</h3>
              <p className="text-gray-400 mb-6">Please wait while we check your device capabilities...</p>
              {loading && (
                <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
              )}
            </div>
          )}

          {step === 'register' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Enable Biometric Authentication</h3>
              <p className="text-gray-400 mb-6">
                Your device supports biometric authentication. This will make it easier and more secure to access your wallet.
              </p>

              {/* Available Methods */}
              <div className="space-y-3 mb-6">
                {availableMethods.map((method) => (
                  <div key={method} className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                    {getMethodIcon(method)}
                    <span className="text-white font-medium">{getMethodDisplayName(method)}</span>
                    <CheckIcon className="w-5 h-5 text-green-400 ml-auto" />
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-gray-700 text-gray-300 rounded-lg font-medium hover:bg-gray-600 transition"
                >
                  Skip
                </button>
                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {loading ? 'Setting up...' : 'Enable Biometric'}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Biometric Enabled!</h3>
              <p className="text-gray-400">
                You can now use biometric authentication to quickly and securely access your wallet.
              </p>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XIcon className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Setup Failed</h3>
              <p className="text-gray-400 mb-6">{error}</p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-gray-700 text-gray-300 rounded-lg font-medium hover:bg-gray-600 transition"
                >
                  Close
                </button>
                <button
                  onClick={checkBiometricSupport}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
