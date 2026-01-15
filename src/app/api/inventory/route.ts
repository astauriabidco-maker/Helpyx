import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

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

// Helper function to get user company from session
async function getUserCompany(request: NextRequest) {
  // For development, return a default company
  if (process.env.NODE_ENV === 'development') {
    // Check if it's Vercel preview mode
    const host = request.headers.get('host') || '';
    const referer = request.headers.get('referer') || '';
    
    if (host.includes('vercel.app') || referer.includes('.space.z.ai')) {
      // Create or get default company for preview mode
      let company = await db.company.findFirst({
        where: { slug: 'preview-company' }
      });
      
      if (!company) {
        company = await db.company.create({
          data: {
            nom: 'Preview Company',
            slug: 'preview-company',
            emailContact: 'preview@example.com',
            statut: 'active',
            planAbonnement: 'starter'
          }
        });
      }
      return company;
    }
  }

  // In production, get company from authenticated user session
  // This is a simplified version - you'd normally get this from NextAuth session
  const companyId = request.headers.get('x-company-id');
  if (companyId) {
    return await db.company.findUnique({ where: { id: companyId } });
  }

  // Fallback to first company
  return await db.company.findFirst();
}

// GET - Récupérer tous les articles du stock avec filtres
export async function GET(request: NextRequest) {
  try {
    const company = await getUserCompany(request);
    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    const categorie = searchParams.get('categorie');
    const stockBas = searchParams.get('stockBas');
    const recherche = searchParams.get('recherche');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const where: any = {
      companyId: company.id
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

// POST - Ajouter un nouvel article au stock
export async function POST(request: NextRequest) {
  try {
    const company = await getUserCompany(request);
    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = createInventorySchema.parse(body);

    // Vérifier si la référence existe déjà pour cette company
    if (validatedData.reference) {
      const existing = await db.inventory.findFirst({
        where: { 
          reference: validatedData.reference,
          companyId: company.id
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
        companyId: company.id
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