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

        {/* Swap Button - Center with Enhanced Animation */}
        <button
          onClick={() => router.push('/swap')}
          className={`group relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 transform -translate-y-2 ${
            isActive('/swap')
              ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/60 scale-110'
              : 'bg-gray-700 text-gray-300 hover:bg-blue-600 hover:text-white hover:shadow-2xl hover:shadow-blue-600/60 hover:scale-110 hover:-translate-y-3'
          }`}
        >
          <div className={`relative z-10 ${isActive('/swap') ? 'animate-pulse' : ''}`}>
            <SwapIcon className="w-7 h-7" />
            {isActive('/swap') && (
              <div className="absolute inset-0 rounded-full bg-blue-400 opacity-30 animate-ping"></div>
            )}
          </div>
          {/* Enhanced glow effect */}
          <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
            isActive('/swap')
              ? 'bg-blue-400 opacity-20 animate-pulse'
              : 'bg-blue-400 opacity-0 group-hover:opacity-20'
          }`}></div>
          {/* Additional outer glow */}
          <div className={`absolute -inset-1 rounded-full transition-all duration-300 ${
            isActive('/swap')
              ? 'bg-blue-500 opacity-10 animate-pulse'
              : 'bg-blue-500 opacity-0 group-hover:opacity-10'
          }`}></div>
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
