'use client';

import React from 'react';
import { Home, List, Compass, Settings } from 'lucide-react';

interface BottomNavProps {
  active: 'home' | 'activity' | 'browser' | 'settings';
  onChange: (key: BottomNavProps['active']) => void;
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  const item = (key: BottomNavProps['active'], Icon: any, label: string) => (
    <button onClick={() => onChange(key)} className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 ${active === key ? 'text-indigo-600' : 'text-gray-500'}`}>
      <Icon className="w-5 h-5" />
      <span className="text-xs">{label}</span>
    </button>
  );
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden">
      <div className="max-w-lg mx-auto flex">
        {item('home', Home, 'Home')}
        {item('activity', List, 'Activity')}
        {item('browser', Compass, 'Browser')}
        {item('settings', Settings, 'Settings')}
      </div>
    </div>
  );
}


