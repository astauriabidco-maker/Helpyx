import { NextRequest, NextResponse } from 'next/server';
import { GamificationService } from '@/lib/gamification';

export async function POST(request: NextRequest) {
  try {
    const { userId, type } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'daily':
        result = await GamificationService.claimDailyBonus(userId);
        return NextResponse.json({ 
          success: result, 
          message: result ? 'Bonus quotidien réclamé!' : 'Bonus déjà réclamé aujourd\'hui'
        });
      
      case 'streak':
        const streak = await GamificationService.updateStreak(userId);
        return NextResponse.json({ 
          success: true, 
          streak,
          message: `Streak mis à jour: ${streak} jours`
        });
      
      default:
        return NextResponse.json(
          { error: 'Invalid bonus type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing bonus:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}