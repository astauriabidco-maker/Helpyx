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
      totalInvoices,
      paidInvoices,
      overdueInvoices,
      pendingInvoices,
      subscriptionsByPlan,
      recentRevenue,
      churnedSubscriptions
    ] = await Promise.all([
      // Total des abonnements
      db.subscription.count(),
      
      // Abonnements actifs
      db.subscription.count({ where: { statut: 'ACTIVE' } }),
      
      // Abonnements en essai
      db.subscription.count({ where: { statut: 'TRIAL' } }),
      
      // Total des factures (simulé - nous n'avons pas de table invoice)
      db.subscription.count(), // Temporaire
      
      // Factures payées (simulé)
      db.subscription.count({ where: { statut: 'ACTIVE' } }),
      
      // Abonnements en retard (simulé)
      db.subscription.count({ where: { statut: 'PAST_DUE' } }),
      
      // Factures en attente (simulé)
      db.subscription.count({ where: { statut: 'TRIAL' } }),
      
      // Abonnements par plan
      db.subscription.groupBy({
        by: ['planId'],
        _count: true,
        include: {
          plan: {
            select: {
              nom: true,
              prixMensuel: true
            }
          }
        }
      }),
      
      // Revenus récents
      db.subscription.aggregate({
        where: {
          statut: 'ACTIVE',
          createdAt: { gte: startDate }
        },
        _sum: { prixMensuel: true },
        _count: true
      }),
      
      // Abonnements résiliés (pour le churn)
      db.subscription.count({
        where: {
          statut: 'CANCELLED',
          updatedAt: { gte: startDate }
        }
      })
    ]);

    // Calculer les revenus
    const planPrices = {
      STARTER: 49,
      PRO: 299,
      ENTERPRISE: 1999
    };

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
        statut: 'ACTIVE',
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
      totalInvoices
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