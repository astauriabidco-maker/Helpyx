import { NextRequest, NextResponse } from 'next/server';
import { GamificationService } from '@/lib/gamification';
import { requireTenant } from '@/lib/tenant';

export async function GET(request: NextRequest) {
  try {
    // Multi-tenant: auth requise
    const [ctx, errorResponse] = await requireTenant();
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Utiliser l'utilisateur connecté
    const activities = await GamificationService.getUserActivities(ctx.user.id, limit);

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}