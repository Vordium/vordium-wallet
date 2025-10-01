'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const hasVault = localStorage.getItem('vordium_vault');
      const isUnlocked = localStorage.getItem('vordium_unlocked') === 'true';
      
      if (hasVault && isUnlocked) {
        router.replace('/dashboard');
      } else if (hasVault && !isUnlocked) {
        router.replace('/unlock');
      } else {
        router.replace('/welcome');
      }
    };

    checkAuth();
  }, [router]);

  // Always show loading while checking
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-500 to-indigo-600">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
    </div>
  );
}
