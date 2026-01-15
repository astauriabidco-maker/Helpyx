import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simuler les métriques d'utilisation
    const metrics = {
      users: 12,
      storage: 67,
      apiCalls: 84500,
      processingPower: 78,
      period: 'Novembre 2024',
      lastUpdate: new Date(),
      limits: {
        users: 50,
        storage: 500,
        apiCalls: 100000,
        processingPower: 100
      },
      costs: {
        current: 299,
        projected: 358,
        savings: 0
      }
    };

    return NextResponse.json({ metrics });
  } catch (error) {
    console.error('Error fetching usage metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage metrics' },
      { status: 500 }
    );
  }
}