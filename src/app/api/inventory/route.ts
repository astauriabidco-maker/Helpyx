import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { requireTenant } from '@/lib/tenant';

const createInventorySchema = z.object({
  nom: z.string().min(1),
  reference: z.string().optional(),
  description: z.string().optional(),
  categorie: z.string().optional(),
  quantite: z.number().min(0),
  seuilAlerte: z.number().min(0),
  coutUnitaire: z.number().optional(),
  fournisseur: z.string().optional(),
  emplacement: z.string().optional(),
  specifications: z.string().optional(),
});

// GET - Récupérer tous les articles du stock — isolés par entreprise
export async function GET(request: NextRequest) {
  try {
    // Multi-tenant: auth + isolation par entreprise
    const [ctx, errorResponse] = await requireTenant();
    if (errorResponse) return errorResponse;
    const { companyId } = ctx;

    const { searchParams } = new URL(request.url);

    const categorie = searchParams.get('categorie');
    const stockBas = searchParams.get('stockBas');
    const recherche = searchParams.get('recherche');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // TOUJOURS filtré par companyId
    const where: any = {
      companyId
    };

    if (categorie) {
      where.categorie = categorie;
    }

    if (stockBas === 'true') {
      where.quantite = { lte: db.inventory.fields.seuilAlerte };
    }

    if (recherche) {
      where.OR = [
        { nom: { contains: recherche } },
        { reference: { contains: recherche } },
        { description: { contains: recherche } },
      ];
    }

    const [items, total] = await Promise.all([
      db.inventory.findMany({
        where,
        include: {
          ticketItems: {
            include: {
              ticket: {
                select: {
                  id: true,
                  titre: true,
                  status: true,
                }
              }
            }
          },
          restockOrders: {
            where: {
              statut: { in: ['EN_ATTENTE', 'COMMANDE'] }
            },
            orderBy: {
              dateCommande: 'desc'
            }
          }
        },
        orderBy: [
          { categorie: 'asc' },
          { nom: 'asc' }
        ],
        skip,
        take: limit,
      }),
      db.inventory.count({ where })
    ]);

    return NextResponse.json({
      items,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du stock:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du stock' },
      { status: 500 }
    );
  }
}

// POST - Ajouter un nouvel article au stock — dans l'entreprise de l'utilisateur
export async function POST(request: NextRequest) {
  try {
    // Multi-tenant: auth + companyId
    const [ctx, errorResponse] = await requireTenant({ requireRole: ['ADMIN', 'AGENT'] });
    if (errorResponse) return errorResponse;
    const { companyId } = ctx;

    const body = await request.json();
    const validatedData = createInventorySchema.parse(body);

    // Vérifier si la référence existe déjà pour cette company
    if (validatedData.reference) {
      const existing = await db.inventory.findFirst({
        where: {
          reference: validatedData.reference,
          companyId
        }
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Cette référence existe déjà' },
          { status: 400 }
        );
      }
    }

    const item = await db.inventory.create({
      data: {
        ...validatedData,
        companyId
      },
      include: {
        restockOrders: true,
        ticketItems: true
      }
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'article:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'article' },
      { status: 500 }
    );
  }
}