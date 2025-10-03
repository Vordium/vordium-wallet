'use client';

import { useState } from 'react';
import { API_CONFIG } from '@/config/api.config';
import { EnhancedTokenSearchService } from '@/services/enhancedTokenSearch.service';

export function APITestComponent() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const testAPIs = async () => {
    setIsTesting(true);
    const results: string[] = [];

    // Test API Configuration
    results.push('=== API Configuration Test ===');
    results.push(`Moralis API Key: ${API_CONFIG.MORALIS.API_KEY ? '✅ Set' : '❌ Not Set'}`);
    results.push(`Moralis Enabled: ${API_CONFIG.MORALIS.ENABLED ? '✅ Yes' : '❌ No'}`);
    results.push(`Helius API Key: ${API_CONFIG.HELIUS.API_KEY ? '✅ Set' : '❌ Not Set'}`);
    results.push(`Helius Enabled: ${API_CONFIG.HELIUS.ENABLED ? '✅ Yes' : '❌ No'}`);
    results.push(`CoinGecko API Key: ${API_CONFIG.COINGECKO.API_KEY ? '✅ Set' : '❌ Not Set'}`);
    results.push(`CoinGecko Enabled: ${API_CONFIG.COINGECKO.ENABLED ? '✅ Yes' : '❌ No'}`);

    // Test CoinGecko API
    if (API_CONFIG.COINGECKO.ENABLED) {
      try {
        results.push('\n=== Testing CoinGecko API ===');
        const response = await fetch(
          `${API_CONFIG.COINGECKO.API_URL}/search?query=bitcoin`,
          {
            headers: {
              'Accept': 'application/json',
              ...(API_CONFIG.COINGECKO.API_KEY && { 'x-cg-demo-api-key': API_CONFIG.COINGECKO.API_KEY }),
            },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          results.push(`✅ CoinGecko API working - Found ${data.coins?.length || 0} results for "bitcoin"`);
        } else {
          results.push(`❌ CoinGecko API error: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        results.push(`❌ CoinGecko API error: ${error}`);
      }
    }

    // Test Enhanced Token Search
    try {
      results.push('\n=== Testing Enhanced Token Search ===');
      const searchResults = await EnhancedTokenSearchService.searchTokens('bitcoin');
      results.push(`✅ Enhanced search working - Found ${searchResults.length} results for "bitcoin"`);
      
      if (searchResults.length > 0) {
        results.push('Sample results:');
        searchResults.slice(0, 3).forEach((token, index) => {
          results.push(`  ${index + 1}. ${token.symbol} (${token.name}) - ${token.chain}`);
        });
      }
    } catch (error) {
      results.push(`❌ Enhanced search error: ${error}`);
    }

    setTestResults(results);
    setIsTesting(false);
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-white text-lg font-semibold mb-4">API Configuration Test</h3>
      
      <button
        onClick={testAPIs}
        disabled={isTesting}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg mb-4"
      >
        {isTesting ? 'Testing...' : 'Test APIs'}
      </button>

      {testResults.length > 0 && (
        <div className="bg-gray-900 rounded-lg p-4">
          <pre className="text-green-400 text-sm whitespace-pre-wrap">
            {testResults.join('\n')}
          </pre>
        </div>
      )}
    </div>
  );
}
