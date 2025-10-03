'use client';

import { useRouter, usePathname } from 'next/navigation';
import { HomeIcon, BrowserIcon, LockIcon, TrendingIcon, SwapIcon } from './icons/GrayIcons';

export function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 z-50">
      <div className="flex items-center justify-around py-2 px-2">
        {/* Home Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg transition ${
            isActive('/dashboard')
              ? 'bg-gray-700 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <HomeIcon className="w-5 h-5" />
          <span className="text-xs font-medium">Home</span>
        </button>

        {/* Trending Button */}
        <button
          onClick={() => router.push('/trending')}
          className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg transition ${
            isActive('/trending')
              ? 'bg-gray-700 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <TrendingIcon className="w-5 h-5" />
          <span className="text-xs font-medium">Trending</span>
        </button>

        {/* Swap Button - Center with Animation */}
        <button
          onClick={() => router.push('/swap')}
          className={`relative flex flex-col items-center gap-1 py-2 px-3 rounded-full transition-all duration-300 ${
            isActive('/swap')
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
              : 'bg-gray-700 text-gray-300 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-600/50'
          }`}
        >
          <div className={`relative ${isActive('/swap') ? 'animate-pulse' : ''}`}>
            <SwapIcon className="w-6 h-6" />
            {isActive('/swap') && (
              <div className="absolute inset-0 rounded-full bg-blue-400 opacity-20 animate-ping"></div>
            )}
          </div>
          <span className="text-xs font-medium">Swap</span>
        </button>

        {/* DeFi Button */}
        <button
          onClick={() => router.push('/defi')}
          className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg transition ${
            isActive('/defi')
              ? 'bg-gray-700 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <LockIcon className="w-5 h-5" />
          <span className="text-xs font-medium">DeFi</span>
        </button>

        {/* Browser Button */}
        <button
          onClick={() => router.push('/browser')}
          className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg transition ${
            isActive('/browser')
              ? 'bg-gray-700 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <BrowserIcon className="w-5 h-5" />
          <span className="text-xs font-medium">Browser</span>
        </button>
      </div>
    </div>
  );
}
