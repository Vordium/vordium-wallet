'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import * as bip39 from 'bip39';

export default function CreateStep1() {
  const router = useRouter();
  const [name, setName] = useState('My Wallet');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [understood, setUnderstood] = useState(false);

  // Password validation
  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  const passwordsMatch = password && password === confirmPassword;
  
  const allValid = hasLength && hasUpper && hasLower && hasNumber && hasSpecial && passwordsMatch && understood;

  // Password strength
  const criteriaMetCount = [hasLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  const strength = criteriaMetCount <= 2 ? 'weak' : criteriaMetCount <= 4 ? 'medium' : 'strong';
  const strengthColor = strength === 'weak' ? 'bg-red-500' : strength === 'medium' ? 'bg-yellow-500' : 'bg-green-500';
  const strengthWidth = strength === 'weak' ? 'w-1/3' : strength === 'medium' ? 'w-2/3' : 'w-full';

  function handleContinue() {
    if (!allValid) return;
    
    // Generate mnemonic
    const mnemonic = bip39.generateMnemonic(256); // 24 words
    
    // Store temporarily
    sessionStorage.setItem('temp_password', password);
    sessionStorage.setItem('temp_wallet_name', name);
    sessionStorage.setItem('temp_mnemonic', mnemonic);
    
    // Navigate to step 2
    router.push('/create/step-2');
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.push('/welcome')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-500">1 of 4</span>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Password</h1>
            <div className="flex items-start gap-2 mt-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-xl">🔒</span>
              <div className="text-sm text-gray-700">
                <p className="font-medium">This password unlocks your wallet on this device only.</p>
                <p className="text-gray-600 mt-1">Vordium cannot recover this password.</p>
              </div>
            </div>
          </div>

          {/* Wallet Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Wallet Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Wallet"
              className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500">Choose a name to identify this wallet</p>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full border border-gray-300 rounded-lg p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full border border-gray-300 rounded-lg p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
              >
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Password Strength */}
          {password && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Password Strength</span>
                <span className={`font-medium ${strength === 'weak' ? 'text-red-600' : strength === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                  {strength.charAt(0).toUpperCase() + strength.slice(1)}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full ${strengthColor} ${strengthWidth} transition-all duration-300`} />
              </div>
            </div>
          )}

          {/* Requirements Checklist */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Password Requirements</p>
            <div className="space-y-1">
              {[
                { met: hasLength, text: 'At least 8 characters' },
                { met: hasUpper, text: 'Contains uppercase letter (A-Z)' },
                { met: hasLower, text: 'Contains lowercase letter (a-z)' },
                { met: hasNumber, text: 'Contains number (0-9)' },
                { met: hasSpecial, text: 'Contains special character (!@#$%^&*)' },
                { met: passwordsMatch, text: 'Passwords match' },
              ].map((req, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className={`w-5 h-5 flex items-center justify-center rounded-full ${req.met ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {req.met ? '✓' : '○'}
                  </span>
                  <span className={req.met ? 'text-gray-700' : 'text-gray-500'}>{req.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Terms Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer p-3 hover:bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              checked={understood}
              onChange={(e) => setUnderstood(e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">I understand this password cannot be recovered</span>
          </label>

          {/* Create Button */}
          <button
            onClick={handleContinue}
            disabled={!allValid}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Create Wallet
          </button>
        </div>
      </div>
    </main>
  );
}

