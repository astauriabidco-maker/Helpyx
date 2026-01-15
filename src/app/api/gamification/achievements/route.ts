import { NextRequest, NextResponse } from 'next/server';
import { AchievementService } from '@/lib/achievements';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type'); // 'unlocked' or 'available'

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (type === 'available') {
      const achievements = await AchievementService.getAvailableAchievements(userId);
      return NextResponse.json({ achievements });
    } else {
      const achievements = await AchievementService.getUserAchievements(userId);
      return NextResponse.json({ achievements });
    }
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}