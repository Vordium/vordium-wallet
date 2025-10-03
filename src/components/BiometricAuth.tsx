'use client';

import { useState, useEffect } from 'react';
import { ShieldIcon, ArrowLeftIcon } from '@/components/icons/GrayIcons';
import { biometricService, type BiometricResult } from '@/services/biometric.service';

interface BiometricAuthProps {
  onSuccess: () => void;
  onFallback: () => void;
  onClose?: () => void;
}

export function BiometricAuth({ onSuccess, onFallback, onClose }: BiometricAuthProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableMethods, setAvailableMethods] = useState<string[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    checkBiometricStatus();
  }, []);

  const checkBiometricStatus = async () => {
    try {
      const enrolled = await biometricService.isBiometricEnrolled();
      setIsEnrolled(enrolled);
      
      if (enrolled) {
        const methods = await biometricService.getAvailableMethods();
        setAvailableMethods(methods);
      }
    } catch (err) {
      console.error('Failed to check biometric status:', err);
    }
  };

  const handleBiometricAuth = async () => {
    setLoading(true);
    setError('');

    try {
      const result: BiometricResult = await biometricService.authenticateBiometric();
      
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Authentication failed');
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

  if (!isEnrolled) {
    return (
      <div className="text-center py-8">
        <ShieldIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Biometric Not Set Up</h3>
        <p className="text-gray-400 mb-6">Biometric authentication is not configured for this wallet.</p>
        <button
          onClick={onFallback}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Use PIN Instead
        </button>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      {/* Header */}
      {onClose && (
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 hover:bg-gray-600 transition"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-white">Biometric Authentication</h2>
          <div className="w-10" />
        </div>
      )}

      {/* Biometric Icon */}
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShieldIcon className="w-10 h-10 text-blue-600" />
      </div>

      {/* Available Methods */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Use {getMethodDisplayName(availableMethods[0] || 'biometric')} to unlock</h3>
        <p className="text-gray-400 text-sm">
          Place your {availableMethods.includes('fingerprint') ? 'finger on the sensor' : 'face in front of the camera'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4 mb-6">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleBiometricAuth}
          disabled={loading}
          className="w-full py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Authenticating...
            </>
          ) : (
            <>
              <ShieldIcon className="w-5 h-5" />
              Authenticate with {getMethodDisplayName(availableMethods[0] || 'biometric')}
            </>
          )}
        </button>

        <button
          onClick={onFallback}
          className="w-full py-3 text-gray-400 hover:text-white transition"
        >
          Use PIN instead
        </button>
      </div>
    </div>
  );
}
