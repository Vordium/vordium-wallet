'use client';

import { useState } from 'react';
import { ArrowLeftIcon, CopyIcon, CheckIcon, AlertTriangleIcon, EyeIcon, EyeOffIcon, DownloadIcon } from './icons/GrayIcons';
import { PINVerification } from './PINVerification';

interface PrivateKeyExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  privateKeys: {
    evm?: string;
    tron?: string;
  };
}

export function PrivateKeyExportModal({ isOpen, onClose, privateKeys }: PrivateKeyExportModalProps) {
  const [step, setStep] = useState<'warning' | 'pin' | 'reveal'>('warning');
  const [showKeys, setShowKeys] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedChain, setSelectedChain] = useState<'evm' | 'tron' | 'all'>('all');

  const handleStartExport = () => {
    setStep('pin');
  };

  const handlePINSuccess = () => {
    setStep('reveal');
  };

  const handleCopy = async (key: string, type: string) => {
    await navigator.clipboard.writeText(key);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = (key: string, type: string) => {
    const blob = new Blob([key], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vordium-${type}-private-key.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    const content = `Vordium Wallet Private Keys Export
Generated: ${new Date().toISOString()}

EVM Private Key:
${privateKeys.evm || 'Not available'}

TRON Private Key:
${privateKeys.tron || 'Not available'}

⚠️ WARNING: Keep these keys secure and never share them with anyone.
Anyone with access to these keys can control your wallet.`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vordium-wallet-keys-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
        <div className="bg-gray-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
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
                <h2 className="text-2xl font-bold text-white">Export Private Keys</h2>
                <p className="text-gray-300 text-sm">
                  {step === 'warning' && 'Advanced security feature'}
                  {step === 'pin' && 'Verify your identity'}
                  {step === 'reveal' && 'Export your private keys'}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {step === 'warning' && (
              <div className="space-y-4">
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangleIcon className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-400 mb-2">⚠️ Critical Security Warning</h3>
                      <ul className="text-red-300 text-sm space-y-1">
                        <li>• Private keys give full control over your wallet</li>
                        <li>• Anyone with these keys can steal your funds</li>
                        <li>• Never share private keys with anyone</li>
                        <li>• Store them in a secure, offline location</li>
                        <li>• We cannot recover funds if keys are compromised</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangleIcon className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-yellow-400 mb-1">Advanced Users Only</h3>
                      <p className="text-yellow-300 text-sm">
                        This feature is for advanced users who understand the risks. 
                        Consider using the recovery phrase backup instead for better security.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-gray-300 mb-4">
                    By proceeding, you acknowledge that you understand the risks and will keep these keys secure.
                  </p>
                  <button
                    onClick={handleStartExport}
                    className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-500 transition"
                  >
                    I Understand the Risks, Continue
                  </button>
                </div>
              </div>
            )}

            {step === 'reveal' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Private Keys</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowKeys(!showKeys)}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition"
                    >
                      {showKeys ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      {showKeys ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={handleDownloadAll}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition"
                    >
                      <DownloadIcon className="w-4 h-4" />
                      Download All
                    </button>
                  </div>
                </div>

                {/* Chain Selection */}
                <div className="flex gap-2 bg-gray-700 rounded-xl p-1">
                  {[
                    { id: 'all', label: 'All Chains' },
                    { id: 'evm', label: 'EVM' },
                    { id: 'tron', label: 'TRON' },
                    { id: 'solana', label: 'Solana' },
                    { id: 'bitcoin', label: 'Bitcoin' }
                  ].map(chain => (
                    <button
                      key={chain.id}
                      onClick={() => setSelectedChain(chain.id as any)}
                      className={`flex-1 py-2 px-4 rounded-lg transition ${
                        selectedChain === chain.id
                          ? 'bg-gray-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {chain.label}
                    </button>
                  ))}
                </div>

                {/* EVM Private Key */}
                {(selectedChain === 'all' || selectedChain === 'evm') && privateKeys.evm && (
                  <div className="bg-gray-700 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-white">EVM Private Key</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopy(privateKeys.evm!, 'evm')}
                          className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition text-sm"
                        >
                          <CopyIcon className="w-3 h-3" />
                          {copied === 'evm' ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                          onClick={() => handleDownload(privateKeys.evm!, 'evm')}
                          className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition text-sm"
                        >
                          <DownloadIcon className="w-3 h-3" />
                          Download
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                      <code className="text-gray-300 text-sm break-all">
                        {showKeys ? privateKeys.evm : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                      </code>
                    </div>
                  </div>
                )}

                {/* TRON Private Key */}
                {(selectedChain === 'all' || selectedChain === 'tron') && privateKeys.tron && (
                  <div className="bg-gray-700 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-white">TRON Private Key</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopy(privateKeys.tron!, 'tron')}
                          className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition text-sm"
                        >
                          <CopyIcon className="w-3 h-3" />
                          {copied === 'tron' ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                          onClick={() => handleDownload(privateKeys.tron!, 'tron')}
                          className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition text-sm"
                        >
                          <DownloadIcon className="w-3 h-3" />
                          Download
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                      <code className="text-gray-300 text-sm break-all">
                        {showKeys ? privateKeys.tron : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                      </code>
                    </div>
                  </div>
                )}

                {(!privateKeys.evm && !privateKeys.tron) && (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No private keys available for export.</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setStep('warning')}
                    className="flex-1 py-3 px-4 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-500 transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 px-4 bg-gray-500 text-white font-semibold rounded-xl hover:bg-gray-400 transition flex items-center justify-center gap-2"
                  >
                    <CheckIcon className="w-4 h-4" />
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PIN Verification Modal */}
      <PINVerification
        isOpen={step === 'pin'}
        onClose={() => setStep('warning')}
        onSuccess={handlePINSuccess}
        title="Verify PIN"
        subtitle="Enter your PIN to export private keys"
      />
    </>
  );
}
