'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('vordium_dark_mode');
    if (stored) setDarkMode(stored === 'true');
  }, []);

  function toggleDarkMode() {
    const newValue = !darkMode;
    setDarkMode(newValue);
    localStorage.setItem('vordium_dark_mode', String(newValue));
    if (newValue) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold dark:text-white">Settings</h1>
            <button onClick={() => router.push('/')} className="text-sm text-gray-500 dark:text-gray-400 underline">Back</button>
          </div>

          <div className="space-y-4">
            <div className="border-b dark:border-gray-700 pb-4">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Appearance</h2>
              <div className="flex items-center justify-between">
                <span className="text-sm dark:text-gray-300">Dark Mode</span>
                <button
                  onClick={toggleDarkMode}
                  className={`relative w-12 h-6 rounded-full transition ${darkMode ? 'bg-indigo-600' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition transform ${darkMode ? 'translate-x-6' : ''}`} />
                </button>
              </div>
            </div>

            <div className="border-b dark:border-gray-700 pb-4">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Security</h2>
              <Button variant="secondary" disabled>Change Password (Coming Soon)</Button>
            </div>

            <div className="border-b dark:border-gray-700 pb-4">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Wallet</h2>
              <Button variant="secondary" disabled>Backup Recovery Phrase</Button>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">About</h2>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>Version: 1.0.0</p>
                <p>Vordium Wallet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

