import { NextRequest, NextResponse } from 'next/server';
import { EnhancedTokenSearchService } from '@/src/services/enhancedTokenSearch.service';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const chain = searchParams.get('chain') as 'Ethereum' | 'Tron' | 'Solana' | 'Bitcoin' | undefined;

    if (!query) {
      return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
    }

    console.log('Enhanced search API: Searching for:', query, 'chain:', chain);

    // Use enhanced search service with live API data
    const results = await EnhancedTokenSearchService.searchTokens(query, chain);
    
    console.log('Enhanced search API: Found', results.length, 'results');

    // Format results to match expected format
    const formattedResults = {
      coins: results.map(result => ({
        id: result.symbol.toLowerCase(),
        name: result.name,
        symbol: result.symbol,
        market_cap_rank: null,
        thumb: result.logo,
        large: result.logo,
        small: result.logo,
        image: result.logo
      }))
    };

    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error('Enhanced search API error:', error);
    
    // Fallback to basic CoinGecko search
    try {
      const { searchParams } = new URL(request.url);
      const query = searchParams.get('query');
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query || '')}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fallbackError) {
      console.error('Fallback search API error:', fallbackError);
      return NextResponse.json(
        { error: 'Failed to search tokens' },
        { status: 500 }
      );
    }
  }
}
