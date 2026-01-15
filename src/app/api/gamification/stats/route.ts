import { NextRequest, NextResponse } from 'next/server';
import { GamificationService } from '@/lib/gamification';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const stats = await GamificationService.getUserGamificationStats(userId);
    
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching gamification stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}