import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - All subscriptions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const plan = searchParams.get('plan');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Construire les filtres
    const where: any = {};
    
    if (status && status !== 'all') {
      where.statut = status.toUpperCase();
    }
    
    if (search) {
      where.OR = [
        {
          company: {
            nom: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          company: {
            emailContact: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ];
    }

    // Récupérer les abonnements
    const [subscriptions, total] = await Promise.all([
      db.subscription.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              nom: true,
              emailContact: true,
              _count: {
                select: {
                  users: true
                }
              }
            }
          },
          plan: {
            select: {
              id: true,
              nom: true,
              prixMensuel: true,
              features: true,
              limiteUtilisateurs: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      db.subscription.count({ where })
    ]);

    // Formater les données
    const formattedSubscriptions = subscriptions.map(sub => ({
      id: sub.id,
      company: {
        id: sub.company.id,
        name: sub.company.nom,
        email: sub.company.emailContact
      },
      plan: {
        name: sub.plan.nom,
        price: sub.prixMensuel,
        features: JSON.parse(sub.plan.features || '[]')
      },
      status: sub.statut.toLowerCase(),
      startDate: sub.dateDebut,
      endDate: sub.dateFin,
      nextBillingDate: new Date(new Date(sub.dateFin).getTime() + 30 * 24 * 60 * 60 * 1000), // Estimation
      amount: sub.prixMensuel,
      autoRenew: sub.autoRenew,
      paymentMethod: 'stripe', // Simulé
      users: sub.company._count.users,
      maxUsers: sub.plan.limiteUtilisateurs
    }));

    return NextResponse.json({
      subscriptions: formattedSubscriptions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

// POST - Create new subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, planId, ...subscriptionData } = body;

    // Vérifier si l'entreprise existe
    const company = await db.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Vérifier si le plan existe
    const plan = await db.plan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Créer l'abonnement
    const subscription = await db.subscription.create({
      data: {
        companyId,
        planId,
        statut: 'TRIAL',
        dateDebut: new Date(),
        dateFin: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 jours d'essai
        prixMensuel: plan.prixMensuel,
        limiteUtilisateurs: plan.limiteUtilisateurs,
        autoRenew: true,
        ...subscriptionData
      },
      include: {
        company: true,
        plan: true
      }
    });

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}