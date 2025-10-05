import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const coinId = searchParams.get('coinId');
    const days = searchParams.get('days');

    if (!coinId) {
      return NextResponse.json({ error: 'Missing coinId parameter' }, { status: 400 });
    }

    if (!days) {
      return NextResponse.json({ error: 'Missing days parameter' }, { status: 400 });
    }

    // Build CoinGecko API URL for market chart data
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`;
    
    // Make request to CoinGecko API
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Chart API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 }
    );
  }
}
