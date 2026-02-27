import { NextRequest, NextResponse } from 'next/server';
import { AchievementService } from '@/lib/achievements';
import { requireTenant } from '@/lib/tenant';

export async function GET(request: NextRequest) {
  try {
    // Multi-tenant: auth requise
    const [ctx, errorResponse] = await requireTenant();
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'unlocked' or 'available'

    // Permettre à un admin de voir les achievements d'un autre user
    let targetUserId = ctx.user.id;
    const requestedUserId = searchParams.get('userId');
    if (requestedUserId && requestedUserId !== ctx.user.id && ['ADMIN', 'AGENT'].includes(ctx.user.role)) {
      const { db } = await import('@/lib/db');
      const targetUser = await db.user.findFirst({
        where: { id: requestedUserId, companyId: ctx.companyId }
      });
      if (targetUser) targetUserId = requestedUserId;
    }

    if (type === 'available') {
      const achievements = await AchievementService.getAvailableAchievements(targetUserId);
      return NextResponse.json({ achievements });
    } else {
      const achievements = await AchievementService.getUserAchievements(targetUserId);
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