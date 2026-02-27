import { NextRequest, NextResponse } from 'next/server';
import { GamificationService } from '@/lib/gamification';
import { requireTenant } from '@/lib/tenant';

export async function GET(request: NextRequest) {
  try {
    // Multi-tenant: auth requise
    const [ctx, errorResponse] = await requireTenant();
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') as 'daily' | 'weekly' | 'monthly' | 'all-time';

    const leaderboard = await GamificationService.getLeaderboard(period || 'all-time');

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}