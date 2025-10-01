'use client';

import { useState } from 'react';
import { ArrowLeftIcon, RefreshIcon } from '@/components/icons/GrayIcons';

export default function BrowserPage() {
  const [url, setUrl] = useState('https://app.uniswap.org');
  const [currentUrl, setCurrentUrl] = useState('https://app.uniswap.org');
  const [loading, setLoading] = useState(false);

  const handleGo = () => {
    setLoading(true);
    setCurrentUrl(url);
    setTimeout(() => setLoading(false), 1000);
  };

  const handleBack = () => {
    window.history.back();
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Browser Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-700 rounded-lg transition"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-400" />
          </button>
          
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-gray-700 rounded-lg transition"
          >
            <RefreshIcon className="w-5 h-5 text-gray-400" />
          </button>

          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleGo()}
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
              placeholder="Enter URL..."
            />
            <button
              onClick={handleGo}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition"
            >
              Go
            </button>
          </div>
        </div>
      </div>

      {/* Browser Content */}
      <div className="h-[calc(100vh-140px)] bg-white">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-600"></div>
          </div>
        ) : (
          <iframe
            src={currentUrl}
            className="w-full h-full border-0"
            title="Browser"
          />
        )}
      </div>

      {/* Popular DApps */}
      <div className="bg-gray-800 p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Popular DApps</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: 'Uniswap', url: 'https://app.uniswap.org', icon: '🦄' },
            { name: 'OpenSea', url: 'https://opensea.io', icon: '🌊' },
            { name: 'PancakeSwap', url: 'https://pancakeswap.finance', icon: '🥞' },
            { name: 'Aave', url: 'https://app.aave.com', icon: '👻' },
          ].map((dapp) => (
            <button
              key={dapp.name}
              onClick={() => {
                setUrl(dapp.url);
                setCurrentUrl(dapp.url);
              }}
              className="flex items-center gap-3 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
            >
              <span className="text-2xl">{dapp.icon}</span>
              <span className="text-sm font-medium">{dapp.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
