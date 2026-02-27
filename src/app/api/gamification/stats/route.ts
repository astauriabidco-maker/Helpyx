import { NextRequest, NextResponse } from 'next/server';
import { GamificationService } from '@/lib/gamification';
import { requireTenant } from '@/lib/tenant';

export async function GET(request: NextRequest) {
  try {
    // Multi-tenant: utiliser l'utilisateur connecté
    const [ctx, errorResponse] = await requireTenant();
    if (errorResponse) return errorResponse;

    // Permettre à un admin de voir les stats d'un autre utilisateur de la même entreprise
    const { searchParams } = new URL(request.url);
    let targetUserId = ctx.user.id;

    const requestedUserId = searchParams.get('userId');
    if (requestedUserId && requestedUserId !== ctx.user.id) {
      // Vérifier que l'utilisateur demandé est dans la même entreprise
      if (['ADMIN', 'AGENT'].includes(ctx.user.role)) {
        const { db } = await import('@/lib/db');
        const targetUser = await db.user.findFirst({
          where: { id: requestedUserId, companyId: ctx.companyId }
        });
        if (targetUser) {
          targetUserId = requestedUserId;
        }
      }
    }

    const stats = await GamificationService.getUserGamificationStats(targetUserId);

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching gamification stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}