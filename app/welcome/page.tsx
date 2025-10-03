'use client';

import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-md space-y-8">
        {/* Logo and Hero */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-4xl">
            💎
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Welcome to Vordium</h1>
            <p className="text-gray-300 mt-2">Your gateway to Web3</p>
            <p className="text-sm text-gray-400 mt-1">Secure, Simple, Multi-Chain</p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-gray-700 rounded-xl p-4 border border-gray-600">
            <div className="text-2xl mb-2">🔐</div>
            <h3 className="font-semibold text-white mb-1">Secure by Design</h3>
            <p className="text-sm text-gray-300">Your keys, your crypto. Self-custodial wallet</p>
          </div>
          
          <div className="bg-gray-700 rounded-xl p-4 border border-gray-600">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold text-white mb-1">Multi-Chain Support</h3>
            <p className="text-sm text-gray-300">Ethereum, Polygon, BSC, TRON, Solana, Bitcoin & more</p>
          </div>
          
          <div className="bg-gray-700 rounded-xl p-4 border border-gray-600">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold text-white mb-1">Simple Interface</h3>
            <p className="text-sm text-gray-300">Easy to use for beginners and pros</p>
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
            className="w-full bg-gray-700 hover:bg-gray-600 text-white rounded-xl py-4 font-semibold transition transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Import Wallet
          </button>
          
          <button className="w-full text-sm text-gray-400 hover:text-gray-300 underline py-2">
            What is a wallet?
          </button>
        </div>
      </div>
    </main>
  );
}

