import { NextRequest, NextResponse } from 'next/server';
import { GamificationService } from '@/lib/gamification';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const period = searchParams.get('period') as 'daily' | 'weekly' | 'monthly' | 'all-time';

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

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