import { NextResponse } from 'next/server';
import { MarketplaceEngine } from '@/lib/marketplace';

const marketplace = MarketplaceEngine.getInstance();

export async function GET() {
  try {
    const stats = await marketplace.getMarketplaceStats();

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching marketplace stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}