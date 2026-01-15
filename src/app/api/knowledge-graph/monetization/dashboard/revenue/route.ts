import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    // Simuler les métriques de revenus basées sur la période
    const baseMetrics = {
      totalRevenue: 2847500,
      monthlyRecurring: 237292,
      annualRecurring: 2847504,
      growth: 23.5,
      bySource: {
        saas: 1850875,
        api: 568750,
        consulting: 428875
      },
      byTier: {
        starter: 284750,
        professional: 1423750,
        enterprise: 1139000
      },
      churnRate: 2.3,
      customerLifetimeValue: 12500,
      averageRevenuePerUser: 285
    };

    // Ajuster les métriques selon la période
    let multiplier = 1;
    switch (range) {
      case '7d':
        multiplier = 0.23;
        break;
      case '30d':
        multiplier = 1;
        break;
      case '90d':
        multiplier = 3;
        break;
      case '1y':
        multiplier = 12;
        break;
    }

    const metrics = {
      ...baseMetrics,
      totalRevenue: Math.round(baseMetrics.totalRevenue * multiplier),
      monthlyRecurring: Math.round(baseMetrics.monthlyRecurring * multiplier),
      annualRecurring: Math.round(baseMetrics.annualRecurring * multiplier),
      bySource: {
        saas: Math.round(baseMetrics.bySource.saas * multiplier),
        api: Math.round(baseMetrics.bySource.api * multiplier),
        consulting: Math.round(baseMetrics.bySource.consulting * multiplier)
      },
      byTier: {
        starter: Math.round(baseMetrics.byTier.starter * multiplier),
        professional: Math.round(baseMetrics.byTier.professional * multiplier),
        enterprise: Math.round(baseMetrics.byTier.enterprise * multiplier)
      }
    };

    return NextResponse.json({ metrics });
  } catch (error) {
    console.error('Error fetching revenue metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue metrics' },
      { status: 500 }
    );
  }
}