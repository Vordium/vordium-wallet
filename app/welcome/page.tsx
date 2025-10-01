'use client';

import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-500 to-indigo-600 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md space-y-8">
        {/* Logo and Hero */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-4xl">
            💎
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome to Vordium</h1>
            <p className="text-gray-600 mt-2">Your gateway to Web3</p>
            <p className="text-sm text-gray-500 mt-1">Secure, Simple, Multi-Chain</p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="text-2xl mb-2">🔐</div>
            <h3 className="font-semibold text-gray-900 mb-1">Secure by Design</h3>
            <p className="text-sm text-gray-600">Your keys, your crypto. Self-custodial wallet</p>
          </div>
          
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold text-gray-900 mb-1">Multi-Chain Support</h3>
            <p className="text-sm text-gray-600">Ethereum, Polygon, BSC, TRON & more</p>
          </div>
          
          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold text-gray-900 mb-1">Simple Interface</h3>
            <p className="text-sm text-gray-600">Easy to use for beginners and pros</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => router.push('/create/step-1')}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl py-4 font-semibold text-lg shadow-lg hover:shadow-xl transition transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Create New Wallet
          </button>
          
          <button
            onClick={() => router.push('/import')}
            className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-900 rounded-xl py-4 font-semibold transition transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Import Wallet
          </button>
          
          <button className="w-full text-sm text-gray-500 hover:text-gray-700 underline py-2">
            What is a wallet?
          </button>
        </div>
      </div>
    </main>
  );
}

