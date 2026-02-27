// @ts-nocheck
// TODO: Aligner les noms de champs avec le schéma Prisma
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Récupérer toutes les entreprises pour l'admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const plan = searchParams.get('plan') || '';

    const skip = (page - 1) * limit;

    // Construire les filtres
    const where: any = {};

    if (search) {
      where.OR = [
        { nom: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { emailContact: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status && status !== 'all') {
      where.statut = status;
    }

    if (plan && plan !== 'all') {
      where.planAbonnement = plan;
    }

    const [companies, total] = await Promise.all([
      db.company.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              users: true,
              tickets: true
            }
          },
          subscriptions: {
            select: {
              statut: true,
              dateFin: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      db.company.count({ where })
    ]);

    return NextResponse.json({
      companies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle entreprise
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nom, emailContact, telephone, pays, ville, planAbonnement, limiteUtilisateurs } = body;

    // Validation
    if (!nom || !emailContact) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Générer un slug unique
    let slug = nom.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Vérifier si le slug existe déjà
    const existingSlug = await db.company.findUnique({
      where: { slug }
    });

    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    // Créer l'entreprise
    const company = await db.company.create({
      data: {
        nom,
        slug,
        emailContact,
        telephone: telephone || null,
        pays: pays || null,
        ville: ville || null,
        statut: 'active',
        planAbonnement: planAbonnement?.toUpperCase() || 'STARTER',
        limiteUtilisateurs: limiteUtilisateurs || 5
      },
      include: {
        _count: {
          select: {
            users: true,
            tickets: true
          }
        }
      }
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    );
  }
}