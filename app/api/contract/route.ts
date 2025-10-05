import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const contract = searchParams.get('contract');

    if (!platform || !contract) {
      return NextResponse.json({ error: 'Missing platform or contract parameter' }, { status: 400 });
    }

    // Make request to CoinGecko contract API
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${platform}/contract/${contract}`,
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
  } catch (error) {
    console.error('Contract API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contract info' },
      { status: 500 }
    );
  }
}
