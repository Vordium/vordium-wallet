'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { ArrowLeftIcon, ShieldIcon, WalletIcon, BellIcon, GlobeIcon, LockIcon, KeyIcon, EyeIcon, EyeOffIcon, CheckIcon, AlertTriangleIcon } from '@/components/icons/GrayIcons';
import { useWalletStore } from '@/store/walletStore';
import { BackupModal } from '@/components/BackupModal';
import { PrivateKeyExportModal } from '@/components/PrivateKeyExportModal';
import { BiometricSetupModal } from '@/components/BiometricSetupModal';
import { biometricService } from '@/services/biometric.service';

interface SecuritySettings {
  pinEnabled: boolean;
  biometricEnabled: boolean;
  autoLock: number; // minutes
  secureTransaction: boolean;
  transactionConfirmation: boolean;
  dappSecurity: boolean;
}

interface PrivacySettings {
  analyticsEnabled: boolean;
  crashReporting: boolean;
  marketingEmails: boolean;
}

interface DisplaySettings {
  currency: string;
  language: string;
  theme: 'dark' | 'light' | 'auto';
  notifications: boolean;
  priceAlerts: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const { wallets, accounts } = useWalletStore();
  const [activeTab, setActiveTab] = useState<'security' | 'privacy' | 'display' | 'advanced' | 'dapps'>('security');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showPrivateKeyModal, setShowPrivateKeyModal] = useState(false);
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);
  const [biometricEnrolled, setBiometricEnrolled] = useState(false);

  const [security, setSecurity] = useState<SecuritySettings>({
    pinEnabled: false,
    biometricEnabled: false,
    autoLock: 5,
    secureTransaction: true,
    transactionConfirmation: true,
    dappSecurity: true,
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    analyticsEnabled: true,
    crashReporting: true,
    marketingEmails: false,
  });

  const [display, setDisplay] = useState<DisplaySettings>({
    currency: 'USD',
    language: 'English',
    theme: 'dark',
    notifications: true,
    priceAlerts: true,
  });

  useEffect(() => {
    // Load settings from localStorage
    const savedSecurity = localStorage.getItem('vordium-security-settings');
    const savedPrivacy = localStorage.getItem('vordium-privacy-settings');
    const savedDisplay = localStorage.getItem('vordium-display-settings');

    if (savedSecurity) setSecurity(JSON.parse(savedSecurity));
    if (savedPrivacy) setPrivacy(JSON.parse(savedPrivacy));
    if (savedDisplay) setDisplay(JSON.parse(savedDisplay));

    // Check biometric enrollment status
    checkBiometricStatus();
  }, []);

  const checkBiometricStatus = async () => {
    try {
      const enrolled = await biometricService.isBiometricEnrolled();
      setBiometricEnrolled(enrolled);
    } catch (err) {
      console.error('Failed to check biometric status:', err);
    }
  };

  const saveSettings = (type: 'security' | 'privacy' | 'display', data: any) => {
    localStorage.setItem(`vordium-${type}-settings`, JSON.stringify(data));
  };

  const handlePinSetup = () => {
    if (pin.length < 4) {
      setPinError('PIN must be at least 4 digits');
      return;
    }
    if (pin !== confirmPin) {
      setPinError('PINs do not match');
      return;
    }
    
    // Save PIN (in real app, this would be encrypted)
    localStorage.setItem('vordium-pin', btoa(pin));
    setSecurity(prev => ({ ...prev, pinEnabled: true }));
    saveSettings('security', { ...security, pinEnabled: true });
    setShowPinSetup(false);
    setPin('');
    setConfirmPin('');
    setPinError('');
  };

  const handleResetWallet = () => {
    if (showResetConfirm) {
      localStorage.clear();
      sessionStorage.clear();
      router.replace('/');
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 5000);
    }
  };

  const getPrivateKeys = () => {
    const evmAccount = accounts.find(a => a.chain === 'EVM');
    const tronAccount = accounts.find(a => a.chain === 'TRON');
    
    return {
      evm: evmAccount?.privateKey,
      tron: tronAccount?.privateKey
    };
  };

  const handleBiometricSetup = () => {
    setShowBiometricSetup(true);
  };

  const handleBiometricSuccess = () => {
    setSecurity(prev => ({ ...prev, biometricEnabled: true }));
    saveSettings('security', { ...security, biometricEnabled: true });
    setBiometricEnrolled(true);
  };

  const toggleSetting = (type: 'security' | 'privacy' | 'display', key: string) => {
    const newSettings = { ...(type === 'security' ? security : type === 'privacy' ? privacy : display) };
    (newSettings as any)[key] = !(newSettings as any)[key];
    
    if (type === 'security') {
      setSecurity(newSettings as SecuritySettings);
    } else if (type === 'privacy') {
      setPrivacy(newSettings as PrivacySettings);
    } else {
      setDisplay(newSettings as DisplaySettings);
    }
    
    saveSettings(type, newSettings);
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    value, 
    onToggle, 
    onPress, 
    danger = false 
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    value?: boolean;
    onToggle?: () => void;
    onPress?: () => void;
    danger?: boolean;
  }) => (
    <div 
      className={`flex items-center gap-4 p-4 rounded-xl hover:bg-gray-700 transition-all duration-200 ${
        danger ? 'border border-red-500/30' : ''
      }`}
      onClick={onPress}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
        danger ? 'bg-red-500/20' : 'bg-gray-600'
      }`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className={`font-semibold ${danger ? 'text-red-400' : 'text-white'}`}>
          {title}
        </div>
        {subtitle && (
          <div className="text-sm text-gray-400">{subtitle}</div>
        )}
      </div>
      {onToggle && (
        <div className={`w-12 h-6 rounded-full transition-colors ${
          value ? 'bg-gray-500' : 'bg-gray-600'
        }`}>
          <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
            value ? 'translate-x-6' : 'translate-x-0.5'
          } mt-0.5`} />
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between z-10">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-700 rounded-lg">
          <ArrowLeftIcon className="w-5 h-5 text-gray-300" />
        </button>
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <div className="w-9" />
      </div>

      {/* Tab Navigation */}
      <div className="p-4">
        <div className="flex gap-2 bg-gray-800 rounded-xl p-1">
          {[
            { id: 'security', label: 'Security', icon: <ShieldIcon className="w-4 h-4" /> },
            { id: 'privacy', label: 'Privacy', icon: <LockIcon className="w-4 h-4" /> },
            { id: 'display', label: 'Display', icon: <GlobeIcon className="w-4 h-4" /> },
            { id: 'dapps', label: 'DApps', icon: <GlobeIcon className="w-4 h-4" /> },
            { id: 'advanced', label: 'Advanced', icon: <KeyIcon className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition ${
                activeTab === tab.id
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.icon}
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Settings Content */}
      <div className="px-4 space-y-4">
        {activeTab === 'security' && (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-xl p-4">
              <h2 className="text-lg font-semibold text-white mb-4">Security & Protection</h2>
              
              <SettingItem
                icon={<KeyIcon className="w-5 h-5 text-gray-300" />}
                title="PIN Protection"
                subtitle={security.pinEnabled ? "PIN is enabled" : "Add an extra layer of security"}
                value={security.pinEnabled}
                onPress={() => setShowPinSetup(true)}
              />
              
              <SettingItem
                icon={<ShieldIcon className="w-5 h-5 text-gray-300" />}
                title="Biometric Authentication"
                subtitle={biometricEnrolled ? "Fingerprint/Face ID enabled" : "Use biometric authentication"}
                value={biometricEnrolled}
                onPress={handleBiometricSetup}
              />
              
              <SettingItem
                icon={<ShieldIcon className="w-5 h-5 text-gray-300" />}
                title="Secure Transactions"
                subtitle="Require confirmation for all transactions"
                value={security.secureTransaction}
                onToggle={() => toggleSetting('security', 'secureTransaction')}
              />
              
              <SettingItem
                icon={<AlertTriangleIcon className="w-5 h-5 text-gray-300" />}
                title="Transaction Confirmation"
                subtitle="Double-check before sending"
                value={security.transactionConfirmation}
                onToggle={() => toggleSetting('security', 'transactionConfirmation')}
              />
              
              <SettingItem
                icon={<GlobeIcon className="w-5 h-5 text-gray-300" />}
                title="DApp Security"
                subtitle="Warn about suspicious DApps"
                value={security.dappSecurity}
                onToggle={() => toggleSetting('security', 'dappSecurity')}
              />
            </div>

            <div className="bg-gray-800 rounded-xl p-4">
              <h2 className="text-lg font-semibold text-white mb-4">Auto-Lock</h2>
              <div className="space-y-2">
                {[1, 5, 15, 30, 60].map(minutes => (
                  <button
                    key={minutes}
                    onClick={() => {
                      setSecurity(prev => ({ ...prev, autoLock: minutes }));
                      saveSettings('security', { ...security, autoLock: minutes });
                    }}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      security.autoLock === minutes
                        ? 'bg-gray-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    {minutes === 1 ? '1 minute' : `${minutes} minutes`}
                    {security.autoLock === minutes && (
                      <CheckIcon className="w-4 h-4 text-gray-300 float-right mt-0.5" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-xl p-4">
              <h2 className="text-lg font-semibold text-white mb-4">Privacy & Data</h2>
              
              <SettingItem
                icon={<BellIcon className="w-5 h-5 text-gray-300" />}
                title="Analytics"
                subtitle="Help improve the app (anonymous data only)"
                value={privacy.analyticsEnabled}
                onToggle={() => toggleSetting('privacy', 'analyticsEnabled')}
              />
              
              <SettingItem
                icon={<AlertTriangleIcon className="w-5 h-5 text-gray-300" />}
                title="Crash Reporting"
                subtitle="Send crash reports to help fix bugs"
                value={privacy.crashReporting}
                onToggle={() => toggleSetting('privacy', 'crashReporting')}
              />
              
              <SettingItem
                icon={<BellIcon className="w-5 h-5 text-gray-300" />}
                title="Marketing Emails"
                subtitle="Receive updates and promotions"
                value={privacy.marketingEmails}
                onToggle={() => toggleSetting('privacy', 'marketingEmails')}
              />
            </div>
          </div>
        )}

        {activeTab === 'display' && (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-xl p-4">
              <h2 className="text-lg font-semibold text-white mb-4">Appearance</h2>
              
              <SettingItem
                icon={<GlobeIcon className="w-5 h-5 text-gray-300" />}
                title="Currency"
                subtitle={display.currency}
                onPress={() => {/* Currency selector */}}
              />
              
              <SettingItem
                icon={<GlobeIcon className="w-5 h-5 text-gray-300" />}
                title="Language"
                subtitle={display.language}
                onPress={() => {/* Language selector */}}
              />
              
              <SettingItem
                icon={<GlobeIcon className="w-5 h-5 text-gray-300" />}
                title="Theme"
                subtitle="Dark (Fixed)"
                onPress={() => {/* Theme selector - disabled for now */}}
              />
            </div>

            <div className="bg-gray-800 rounded-xl p-4">
              <h2 className="text-lg font-semibold text-white mb-4">Notifications</h2>
              
              <SettingItem
                icon={<BellIcon className="w-5 h-5 text-gray-300" />}
                title="Push Notifications"
                subtitle="Receive important updates"
                value={display.notifications}
                onToggle={() => toggleSetting('display', 'notifications')}
              />
              
              <SettingItem
                icon={<BellIcon className="w-5 h-5 text-gray-300" />}
                title="Price Alerts"
                subtitle="Get notified of price changes"
                value={display.priceAlerts}
                onToggle={() => toggleSetting('display', 'priceAlerts')}
              />
            </div>
          </div>
        )}

        {activeTab === 'dapps' && (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-xl p-4">
              <h2 className="text-lg font-semibold text-white mb-4">DApp Connections</h2>
              
              <SettingItem
                icon={<GlobeIcon className="w-5 h-5 text-gray-300" />}
                title="Connected DApps"
                subtitle="Manage your DApp connections"
                onPress={() => router.push('/connections')}
              />
              
              <SettingItem
                icon={<BellIcon className="w-5 h-5 text-gray-300" />}
                title="DApp Notifications"
                subtitle="Get notified about DApp activities"
                value={true}
                onToggle={() => {}}
              />
            </div>

            <div className="bg-gray-800 rounded-xl p-4">
              <h2 className="text-lg font-semibold text-white mb-4">Browser Settings</h2>
              
              <SettingItem
                icon={<GlobeIcon className="w-5 h-5 text-gray-300" />}
                title="Open Browser"
                subtitle="Access the in-wallet browser"
                onPress={() => router.push('/browser')}
              />
              
              <SettingItem
                icon={<ShieldIcon className="w-5 h-5 text-gray-300" />}
                title="Security Warnings"
                subtitle="Show warnings for suspicious sites"
                value={security.dappSecurity}
                onToggle={() => toggleSetting('security', 'dappSecurity')}
              />
            </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-xl p-4">
              <h2 className="text-lg font-semibold text-white mb-4">Wallet Management</h2>
              
              <SettingItem
                icon={<WalletIcon className="w-5 h-5 text-gray-300" />}
                title="Manage Wallets"
                subtitle={`${wallets.length} wallet${wallets.length !== 1 ? 's' : ''} total`}
                onPress={() => router.push('/dashboard')}
              />
              
              <SettingItem
                icon={<KeyIcon className="w-5 h-5 text-gray-300" />}
                title="Backup Recovery Phrase"
                subtitle="Export your seed phrase"
                onPress={() => setShowBackupModal(true)}
              />
              
              <SettingItem
                icon={<ShieldIcon className="w-5 h-5 text-gray-300" />}
                title="Export Private Keys"
                subtitle="Advanced: Export individual keys"
                onPress={() => setShowPrivateKeyModal(true)}
              />
            </div>

            <div className="bg-gray-800 rounded-xl p-4">
              <h2 className="text-lg font-semibold text-white mb-4">About</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Version</span>
                  <span className="text-white">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Build</span>
                  <span className="text-white">2024.1.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Network</span>
                  <span className="text-white">Ethereum + TRON</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-4">
              <h2 className="text-lg font-semibold text-white mb-4">Danger Zone</h2>
              
              <SettingItem
                icon={<AlertTriangleIcon className="w-5 h-5 text-red-400" />}
                title="Reset Wallet"
                subtitle="Delete all data and start over"
                danger={true}
                onPress={handleResetWallet}
              />
              
              {showResetConfirm && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">
                    ⚠️ This will permanently delete all wallet data, including your recovery phrase. 
                    Make sure you have backed up your seed phrase before proceeding.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* PIN Setup Modal */}
      {showPinSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-3xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Setup PIN</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Enter 4-digit PIN
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white text-center text-2xl tracking-widest"
                    placeholder="••••"
                    maxLength={4}
                  />
                  <button
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPin ? <EyeOffIcon className="w-5 h-5 text-gray-400" /> : <EyeIcon className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm PIN
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPin ? 'text' : 'password'}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white text-center text-2xl tracking-widest"
                    placeholder="••••"
                    maxLength={4}
                  />
                  <button
                    onClick={() => setShowConfirmPin(!showConfirmPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showConfirmPin ? <EyeOffIcon className="w-5 h-5 text-gray-400" /> : <EyeIcon className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
              </div>

              {pinError && (
                <p className="text-red-400 text-sm">{pinError}</p>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowPinSetup(false);
                    setPin('');
                    setConfirmPin('');
                    setPinError('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handlePinSetup}
                  disabled={pin.length < 4 || confirmPin.length < 4}
                  className="flex-1"
                >
                  Setup PIN
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backup Modal */}
      <BackupModal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        mnemonic={wallets[0]?.mnemonic}
      />

      {/* Private Key Export Modal */}
      <PrivateKeyExportModal
        isOpen={showPrivateKeyModal}
        onClose={() => setShowPrivateKeyModal(false)}
        privateKeys={getPrivateKeys()}
      />

      {/* Biometric Setup Modal */}
      <BiometricSetupModal
        isOpen={showBiometricSetup}
        onClose={() => setShowBiometricSetup(false)}
        onSuccess={handleBiometricSuccess}
      />
    </div>
  );
}