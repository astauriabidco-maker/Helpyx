// @ts-nocheck
// TODO: Aligner les noms de champs avec le schéma Prisma (anglais → français, ex: status → statut)
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Rapports sur les revenus
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // jours
    const days = parseInt(period);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Statistiques des abonnements
    const [
      totalSubscriptions,
      activeSubscriptions,
      subscriptionsByPlan,
      monthlyRevenue,
      recentSubscriptions,
      companiesByPlan
    ] = await Promise.all([
      // Total abonnements
      db.subscription.count(),
      
      // Abonnements actifs
      db.subscription.count({ where: { status: 'ACTIVE' } }),
      
      // Abonnements par plan
      db.subscription.groupBy({
        by: ['plan'],
        _count: true
      }),
      
      // Revenu mensuel estimé
      db.subscription.aggregate({
        where: { status: 'ACTIVE' },
        _sum: {
          maxUsers: true
        }
      }),
      
      // Abonnements récents
      db.subscription.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          company: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }),
      
      // Entreprises par plan avec détails
      db.company.findMany({
        include: {
          subscription: true,
          _count: {
            select: {
              users: true
            }
          }
        }
      })
    ]);

    // Calculer les revenus par plan (prix mensuels estimés)
    const planPrices = {
      STARTER: 29,
      PRO: 99,
      ENTERPRISE: 299
    };

    const revenueByPlan = subscriptionsByPlan.map(stat => {
      const plan = stat.plan as keyof typeof planPrices;
      const price = planPrices[plan] || 0;
      const count = stat._count;
      
      return {
        plan,
        count,
        price,
        monthlyRevenue: count * price,
        yearlyRevenue: count * price * 12
      };
    });

    // Calculer le revenu total
    const totalMonthlyRevenue = revenueByPlan.reduce((sum, plan) => sum + plan.monthlyRevenue, 0);
    const totalYearlyRevenue = revenueByPlan.reduce((sum, plan) => sum + plan.yearlyRevenue, 0);

    // Répartition des entreprises par plan
    const companiesByPlanData = companiesByPlan.reduce((acc, company) => {
      const plan = company.subscription?.plan || 'UNKNOWN';
      if (!acc[plan]) {
        acc[plan] = {
          plan,
          companies: [],
          totalUsers: 0,
          totalRevenue: 0
        };
      }
      acc[plan].companies.push({
        id: company.id,
        name: company.name,
        users: company._count.users,
        maxUsers: company.subscription?.maxUsers || 0
      });
      acc[plan].totalUsers += company._count.users;
      acc[plan].totalRevenue += planPrices[plan as keyof typeof planPrices] || 0;
      return acc;
    }, {} as Record<string, any>);

    // Taux de conversion (estimation basée sur les plans)
    const conversionRate = totalSubscriptions > 0 ? 
      Math.round((activeSubscriptions / totalSubscriptions) * 100) : 0;

    // Données pour le graphique de croissance
    const growthData: any[] = [];
    for (let i = Math.min(days - 1, 29); i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const daySubscriptions = recentSubscriptions.filter(sub => 
        sub.createdAt >= date && sub.createdAt < nextDate
      );
      
      growthData.push({
        date: date.toISOString().split('T')[0],
        newSubscriptions: daySubscriptions.length,
        revenue: daySubscriptions.reduce((sum, sub) => {
          const plan = sub.plan as keyof typeof planPrices;
          return sum + (planPrices[plan] || 0);
        }, 0)
      });
    }

    const report = {
      summary: {
        totalSubscriptions,
        activeSubscriptions,
        inactiveSubscriptions: totalSubscriptions - activeSubscriptions,
        conversionRate,
        totalMonthlyRevenue,
        totalYearlyRevenue,
        avgRevenuePerCompany: totalSubscriptions > 0 ? Math.round(totalMonthlyRevenue / totalSubscriptions) : 0
      },
      byPlan: revenueByPlan,
      companiesByPlan: Object.values(companiesByPlanData),
      growth: growthData,
      recentSubscriptions: recentSubscriptions.slice(0, 5),
      period: {
        days,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString()
      }
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating revenue report:', error);
    return NextResponse.json(
      { error: 'Failed to generate revenue report' },
      { status: 500 }
    );
  }
}