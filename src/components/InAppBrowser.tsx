'use client';

import { useState, useEffect } from 'react';
import { XIcon, ArrowLeftIcon, RefreshIcon } from './icons/GrayIcons';

interface InAppBrowserProps {
  url: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export function InAppBrowser({ url, isOpen, onClose, title = 'Blockchain Explorer' }: InAppBrowserProps) {
  const [iframeError, setIframeError] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when browser is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRefresh = () => {
    setIframeError(false);
    // Force iframe reload
    const iframe = document.querySelector('.in-app-browser-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  const openInNewTab = () => {
    window.open(url, '_blank');
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-[9998] ${
          isOpen ? 'opacity-60' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Browser Container - Slides up from bottom */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-gray-900 z-[9999] transition-transform duration-500 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ 
          height: '90vh',
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Browser Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-black">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={onClose}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition"
            >
              <ArrowLeftIcon className="w-4 h-4 text-gray-300" />
            </button>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold truncate">{title}</h3>
              <p className="text-gray-400 text-xs truncate">{url}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleRefresh}
              className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition"
              title="Refresh"
            >
              <RefreshIcon className="w-4 h-4 text-gray-300" />
            </button>
            <button
              onClick={openInNewTab}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 text-xs font-medium transition"
            >
              Open in Tab
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition"
            >
              <XIcon className="w-4 h-4 text-gray-300" />
            </button>
          </div>
        </div>

        {/* Browser Content */}
        <div className="relative h-[calc(90vh-64px)] bg-white">
          {!iframeError ? (
            <iframe
              src={url}
              className="in-app-browser-iframe w-full h-full border-0"
              title={title}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
              onError={() => {
                console.error('Failed to load:', url);
                setIframeError(true);
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-900">
              <div className="text-center p-8">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-white mb-2">Failed to Load</h3>
                <p className="text-gray-400 mb-4">
                  This site may block iframe embedding for security.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={openInNewTab}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
                  >
                    Open in New Tab
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Swipe indicator at top */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-600 rounded-full" />
      </div>
    </>
  );
}

