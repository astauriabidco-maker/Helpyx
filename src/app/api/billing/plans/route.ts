import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - All plans
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const includeStats = searchParams.get('includeStats') === 'true';

    const where: any = {};
    if (status && status !== 'all') {
      where.statut = status.toUpperCase();
    }

    // Récupérer les plans
    let plans = await db.plan.findMany({
      where,
      orderBy: {
        ordre: 'asc'
      }
    });

    // Si on inclut les statistiques
    if (includeStats) {
      plans = await Promise.all(plans.map(async (plan) => {
        const [subscriptions, revenue] = await Promise.all([
          db.subscription.count({
            where: { planId: plan.id, statut: 'ACTIVE' }
          }),
          db.subscription.aggregate({
            where: { planId: plan.id, statut: 'ACTIVE' },
            _sum: { prixMensuel: true }
          })
        ]);

        return {
          ...plan,
          subscriptions,
          revenue: revenue._sum.prixMensuel || 0
        };
      }));
    }

    // Formater les données
    const formattedPlans = plans.map(plan => ({
      id: plan.id,
      name: plan.nom,
      slug: plan.slug,
      description: plan.description,
      price: plan.prixMensuel,
      yearlyPrice: plan.prixAnnuel,
      features: JSON.parse(plan.features || '[]'),
      maxUsers: plan.limiteUtilisateurs,
      maxTickets: plan.maxTickets,
      maxInventory: plan.maxInventory,
      supportLevel: plan.supportLevel,
      popular: plan.ordre === 1, // Supposer que le deuxième plan est populaire
      status: plan.statut.toLowerCase(),
      subscriptions: plan.subscriptions || 0,
      revenue: plan.revenue || 0
    }));

    return NextResponse.json({ plans: formattedPlans });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}

// POST - Create new plan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nom,
      slug,
      description,
      prixMensuel,
      prixAnnuel,
      features,
      limiteUtilisateurs,
      maxTickets,
      maxInventory,
      supportLevel,
      ...planData
    } = body;

    // Vérifier si le slug existe déjà
    const existingPlan = await db.plan.findUnique({
      where: { slug }
    });

    if (existingPlan) {
      return NextResponse.json(
        { error: 'Plan with this slug already exists' },
        { status: 400 }
      );
    }

    // Créer le plan
    const plan = await db.plan.create({
      data: {
        nom,
        slug,
        description,
        prixMensuel,
        prixAnnuel,
        features: JSON.stringify(features || []),
        limiteUtilisateurs,
        maxTickets,
        maxInventory,
        supportLevel: supportLevel || 'basic',
        statut: 'ACTIVE',
        ordre: 0,
        ...planData
      }
    });

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Error creating plan:', error);
    return NextResponse.json(
      { error: 'Failed to create plan' },
      { status: 500 }
    );
  }
}