import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Rapports sur les utilisateurs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // jours
    const days = parseInt(period);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Statistiques générales
    const [
      totalUsers,
      activeUsers,
      newUsers,
      usersByRole,
      usersByCompany,
      userGrowth
    ] = await Promise.all([
      // Total utilisateurs
      db.user.count(),
      
      // Utilisateurs actifs
      db.user.count({ where: { isActive: true } }),
      
      // Nouveaux utilisateurs (derniers X jours)
      db.user.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // Utilisateurs par rôle
      db.user.groupBy({
        by: ['role'],
        _count: true
      }),
      
      // Utilisateurs par entreprise (top 10)
      db.company.findMany({
        take: 10,
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              users: true
            }
          }
        },
        orderBy: {
          users: {
            _count: 'desc'
          }
        }
      }),
      
      // Croissance des utilisateurs (derniers 30 jours)
      db.user.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        select: {
          createdAt: true,
          role: true
        },
        orderBy: { createdAt: 'asc' }
      })
    ]);

    // Données pour le graphique de croissance
    const growthData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayUsers = userGrowth.filter(user => 
        user.createdAt >= date && user.createdAt < nextDate
      );
      
      growthData.push({
        date: date.toISOString().split('T')[0],
        newUsers: dayUsers.length,
        cumulative: userGrowth.filter(user => 
          user.createdAt < nextDate
        ).length
      });
    }

    // Taux de conversion par rôle
    const roleStats = usersByRole.map(stat => ({
      role: stat.role,
      count: stat._count,
      percentage: totalUsers > 0 ? Math.round((stat._count / totalUsers) * 100) : 0
    }));

    const report = {
      summary: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        newThisPeriod: newUsers,
        activeRate: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0
      },
      byRole: roleStats,
      topCompanies: usersByCompany,
      growth: growthData,
      period: {
        days,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString()
      }
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating user report:', error);
    return NextResponse.json(
      { error: 'Failed to generate user report' },
      { status: 500 }
    );
  }
}