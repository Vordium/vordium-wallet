'use client';

import React from 'react';
import QRCode from 'react-qr-code';

interface ReceiveCardProps {
  address: string;
  network: 'EVM' | 'TRON';
}

export function ReceiveCard({ address, network }: ReceiveCardProps) {
  return (
    <div className="bg-white border rounded-2xl p-4">
      <div className="text-sm text-gray-500 mb-3">Receive on {network}</div>
      <div className="bg-white inline-block p-3 rounded-md"><QRCode value={address} size={160} /></div>
      <div className="mt-3 flex items-center justify-between">
        <div className="font-mono text-sm break-all">{address}</div>
        <button onClick={() => navigator.clipboard.writeText(address)} className="ml-3 text-sm px-3 py-1 rounded bg-gray-900 text-white">Copy</button>
      </div>
    </div>
  );
}


