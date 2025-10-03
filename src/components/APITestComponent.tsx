'use client';

import { useEffect, useState } from 'react';
import { API_CONFIG } from '@/config/api.config';

export function APITestComponent() {
  const [testResults, setTestResults] = useState<any>(null);

  useEffect(() => {
    const testAPIs = async () => {
      console.log('=== API Configuration Test ===');
      console.log('Moralis API Key:', API_CONFIG.MORALIS.API_KEY ? `${API_CONFIG.MORALIS.API_KEY.substring(0, 8)}...` : 'NOT SET');
      console.log('Moralis Enabled:', API_CONFIG.MORALIS.ENABLED);
      console.log('Helius API Key:', API_CONFIG.HELIUS.API_KEY ? `${API_CONFIG.HELIUS.API_KEY.substring(0, 8)}...` : 'NOT SET');
      console.log('Helius Enabled:', API_CONFIG.HELIUS.ENABLED);
      console.log('CoinGecko API Key:', API_CONFIG.COINGECKO.API_KEY ? `${API_CONFIG.COINGECKO.API_KEY.substring(0, 8)}...` : 'NOT SET');
      console.log('CoinGecko Enabled:', API_CONFIG.COINGECKO.ENABLED);
      console.log('================================');

      // Test Moralis API directly
      if (API_CONFIG.MORALIS.ENABLED) {
        try {
          console.log('Testing Moralis API...');
          const response = await fetch('https://deep-index.moralis.io/api/v2/0x1ff580AE5D0043799EF399AB219Dd2b330A7cC0e/balance?chain=eth', {
            headers: {
              'X-API-Key': API_CONFIG.MORALIS.API_KEY,
              'Content-Type': 'application/json',
            },
          });
          
          console.log('Moralis API Response Status:', response.status);
          console.log('Moralis API Response OK:', response.ok);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Moralis API Error:', errorText);
          } else {
            const data = await response.json();
            console.log('Moralis API Success:', data);
          }
        } catch (error) {
          console.error('Moralis API Test Error:', error);
        }
      }

      // Test CoinGecko API
      if (API_CONFIG.COINGECKO.ENABLED) {
        try {
          console.log('Testing CoinGecko API...');
          const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd', {
            headers: {
              'Accept': 'application/json',
              ...(API_CONFIG.COINGECKO.API_KEY && { 'x-cg-demo-api-key': API_CONFIG.COINGECKO.API_KEY }),
            },
          });
          
          console.log('CoinGecko API Response Status:', response.status);
          console.log('CoinGecko API Response OK:', response.ok);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('CoinGecko API Error:', errorText);
          } else {
            const data = await response.json();
            console.log('CoinGecko API Success:', data);
          }
        } catch (error) {
          console.error('CoinGecko API Test Error:', error);
        }
      }

      setTestResults({
        moralis: {
          enabled: API_CONFIG.MORALIS.ENABLED,
          hasKey: !!API_CONFIG.MORALIS.API_KEY,
        },
        coingecko: {
          enabled: API_CONFIG.COINGECKO.ENABLED,
          hasKey: !!API_CONFIG.COINGECKO.API_KEY,
        },
        helius: {
          enabled: API_CONFIG.HELIUS.ENABLED,
          hasKey: !!API_CONFIG.HELIUS.API_KEY,
        },
      });
    };

    testAPIs();
  }, []);

  if (!testResults) {
    return <div className="p-4 bg-gray-800 rounded-lg">Testing APIs...</div>;
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg space-y-2">
      <h3 className="text-white font-bold">API Test Results</h3>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-300">Moralis:</span>
          <span className={testResults.moralis.enabled ? 'text-green-400' : 'text-red-400'}>
            {testResults.moralis.enabled ? '✅ Enabled' : '❌ Disabled'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">Moralis Key:</span>
          <span className={testResults.moralis.hasKey ? 'text-green-400' : 'text-red-400'}>
            {testResults.moralis.hasKey ? '✅ Set' : '❌ Not Set'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">CoinGecko:</span>
          <span className={testResults.coingecko.enabled ? 'text-green-400' : 'text-red-400'}>
            {testResults.coingecko.enabled ? '✅ Enabled' : '❌ Disabled'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">CoinGecko Key:</span>
          <span className={testResults.coingecko.hasKey ? 'text-green-400' : 'text-red-400'}>
            {testResults.coingecko.hasKey ? '✅ Set' : '❌ Not Set'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">Helius:</span>
          <span className={testResults.helius.enabled ? 'text-green-400' : 'text-red-400'}>
            {testResults.helius.enabled ? '✅ Enabled' : '❌ Disabled'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">Helius Key:</span>
          <span className={testResults.helius.hasKey ? 'text-green-400' : 'text-red-400'}>
            {testResults.helius.hasKey ? '✅ Set' : '❌ Not Set'}
          </span>
        </div>
      </div>
    </div>
  );
}
