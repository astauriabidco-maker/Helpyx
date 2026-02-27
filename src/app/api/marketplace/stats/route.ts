import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireTenant } from '@/lib/tenant';

export async function GET() {
  try {
    const [ctx, errorResponse] = await requireTenant();
    if (errorResponse) return errorResponse;

    // Essayer d'abord les stats en cache
    const cachedStats = await db.marketplaceStats.findFirst({
      orderBy: { lastUpdated: 'desc' },
    });

    // Calculer les stats réelles
    const totalExperts = await db.expert.count();
    const activeExperts = await db.expert.count({ where: { availability: 'available' } });
    const totalGigs = await db.gig.count();
    const activeGigs = await db.gig.count({ where: { status: 'OPEN' } });
    const completedGigs = await db.gig.count({ where: { status: 'COMPLETED' } });
    const totalReviews = await db.review.count();

    const avgRating = await db.expert.aggregate({
      _avg: { rating: true },
    });

    const avgPrice = await db.gig.aggregate({
      _avg: { price: true },
    });

    const stats = {
      totalExperts,
      activeExperts,
      totalGigs,
      activeGigs,
      completedGigs,
      totalReviews,
      averageRating: Math.round((avgRating._avg.rating || 0) * 10) / 10,
      averageGigPrice: Math.round(avgPrice._avg.price || 0),
      totalRevenue: cachedStats?.totalRevenue || 0,
      monthlyRevenue: cachedStats?.monthlyRevenue || 0,
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching marketplace stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}