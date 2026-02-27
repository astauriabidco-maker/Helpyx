import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Billing metrics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('range') || '30'; // jours
    const days = parseInt(period);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Récupérer les métriques de facturation
    const [
      totalSubscriptions,
      activeSubscriptions,
      trialSubscriptions,
      recentRevenue,
      churnedSubscriptions
    ] = await Promise.all([
      db.subscription.count(),
      db.subscription.count({ where: { statut: 'active' } }),
      db.subscription.count({ where: { statut: 'trial' } }),
      db.subscription.aggregate({
        where: {
          statut: 'active',
          createdAt: { gte: startDate }
        },
        _sum: { prixMensuel: true },
        _count: true
      }),
      db.subscription.count({
        where: {
          statut: 'cancelled',
          updatedAt: { gte: startDate }
        }
      })
    ]);

    // Abonnements par plan - car groupBy ne supporte pas include
    const counts = await db.subscription.groupBy({
      by: ['planId'],
      _count: true,
    });

    const subscriptionsByPlan = await Promise.all(counts.map(async (item) => {
      const plan = await db.plan.findUnique({
        where: { id: item.planId },
        select: { nom: true, prixMensuel: true }
      });
      return {
        planId: item.planId,
        _count: item._count,
        plan
      };
    }));

    // Totaux des factures réels
    const [totalInvoices, paidInvoices, overdueInvoices, pendingInvoices] = await Promise.all([
      db.invoice.count(),
      db.invoice.count({ where: { status: 'paid' } }),
      db.invoice.count({ where: { status: 'overdue' } }),
      db.invoice.count({ where: { status: 'sent' } })
    ]);

    // Calculer les revenus
    const monthlyRecurring = subscriptionsByPlan.reduce((sum, sub) => {
      const price = sub.plan?.prixMensuel || 0;
      return sum + (price * sub._count);
    }, 0);

    const annualRecurring = monthlyRecurring * 12;

    // Calculer le taux de churn
    const churnRate = totalSubscriptions > 0 ?
      Math.round((churnedSubscriptions / totalSubscriptions) * 100 * 10) / 10 : 0;

    // Calculer LTV et ARPU
    const averageRevenuePerUser = activeSubscriptions > 0 ?
      Math.round(monthlyRecurring / activeSubscriptions) : 0;

    const customerLifetimeValue = averageRevenuePerUser * 36; // Estimation 36 mois

    // Croissance (comparaison avec période précédente)
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - days);

    const previousRevenue = await db.subscription.aggregate({
      where: {
        statut: 'active',
        createdAt: {
          gte: previousStartDate,
          lt: startDate
        }
      },
      _sum: { prixMensuel: true },
      _count: true
    });

    const currentRevenue = recentRevenue._sum.prixMensuel || 0;
    const previousRevenueAmount = previousRevenue._sum.prixMensuel || 0;
    const growth = previousRevenueAmount > 0 ?
      Math.round(((currentRevenue - previousRevenueAmount) / previousRevenueAmount) * 100 * 10) / 10 : 0;

    const metrics = {
      totalRevenue: monthlyRecurring * 12, // Revenu annualisé
      monthlyRecurring,
      annualRecurring,
      growth,
      activeSubscriptions,
      trialSubscriptions,
      churnRate,
      customerLifetimeValue,
      averageRevenuePerUser,
      pendingInvoices,
      overdueInvoices,
      totalInvoices,
      paidInvoices,
    };

    return NextResponse.json({ metrics });
  } catch (error) {
    console.error('Error fetching billing metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing metrics' },
      { status: 500 }
    );
  }
}