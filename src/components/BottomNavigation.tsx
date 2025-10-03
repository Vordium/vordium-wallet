'use client';

import { useRouter, usePathname } from 'next/navigation';
import { HomeIcon, BrowserIcon, LockIcon } from './icons/GrayIcons';

export function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 z-50">
      <div className="flex items-center justify-around py-2">
        {/* Home Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className={`flex flex-col items-center gap-1 py-3 px-4 rounded-lg transition ${
            isActive('/dashboard')
              ? 'bg-gray-700 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <HomeIcon className="w-6 h-6" />
          <span className="text-xs font-medium">Home</span>
        </button>

        {/* DeFi Button */}
        <button
          onClick={() => router.push('/defi')}
          className={`flex flex-col items-center gap-1 py-3 px-4 rounded-lg transition ${
            isActive('/defi')
              ? 'bg-gray-700 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <LockIcon className="w-6 h-6" />
          <span className="text-xs font-medium">DeFi</span>
        </button>

        {/* Browser Button */}
        <button
          onClick={() => router.push('/browser')}
          className={`flex flex-col items-center gap-1 py-3 px-4 rounded-lg transition ${
            isActive('/browser')
              ? 'bg-gray-700 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <BrowserIcon className="w-6 h-6" />
          <span className="text-xs font-medium">Browser</span>
        </button>
      </div>
    </div>
  );
}
