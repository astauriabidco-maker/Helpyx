import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';


const restockSchema = z.object({
  inventoryId: z.string(),
  quantite: z.number().min(1),
  fournisseur: z.string().optional(),
  notes: z.string().optional(),
  autoOrder: z.boolean().default(false),
});

// GET - Récupérer les commandes de réapprovisionnement
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statut = searchParams.get('statut');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (statut) {
      where.statut = statut;
    }

    const [orders, total] = await Promise.all([
      db.restockOrder.findMany({
        where,
        include: {
          inventory: {
            select: {
              id: true,
              nom: true,
              reference: true,
              categorie: true,
              quantite: true,
              seuilAlerte: true,
            }
          }
        },
        orderBy: {
          dateCommande: 'desc'
        },
        skip,
        take: limit,
      }),
      db.restockOrder.count({ where })
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des commandes' },
      { status: 500 }
    );
  }
}

// POST - Créer une commande de réapprovisionnement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = restockSchema.parse(body);

    // Vérifier si l'article existe
    const inventory = await db.inventory.findUnique({
      where: { id: validatedData.inventoryId }
    });

    if (!inventory) {
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      );
    }

    // Créer la commande
    const order = await db.restockOrder.create({
      data: {
        inventoryId: validatedData.inventoryId,
        quantite: validatedData.quantite,
        coutTotal: inventory.coutUnitaire ? inventory.coutUnitaire * validatedData.quantite : null,
        fournisseur: validatedData.fournisseur || inventory.fournisseur,
        notes: validatedData.notes,
        statut: 'EN_ATTENTE',
      },
      include: {
        inventory: true
      }
    });

    // Si commande automatique, utiliser l'IA pour générer un email de commande
    if (validatedData.autoOrder) {
      try {
        const ZAI = (await import('z-ai-web-dev-sdk')).default; const zai = await ZAI.create();
        
        const emailContent = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'Tu es un assistant professionnel pour la gestion des commandes. Génère un email de commande formel et concis.'
            },
            {
              role: 'user',
              content: `Génère un email de commande pour:
              Article: ${inventory.nom}
              Référence: ${inventory.reference || 'N/A'}
              Quantité: ${validatedData.quantite}
              Fournisseur: ${validatedData.fournisseur || inventory.fournisseur || 'À déterminer'}
              Prix unitaire: ${inventory.coutUnitaire ? `${inventory.coutUnitaire}€` : 'À confirmer'}
              Total: ${order.coutTotal ? `${order.coutTotal}€` : 'À calculer'}
              Notes: ${validatedData.notes || 'N/A'}`
            }
          ]
        });

        // Envoyer l'email (simulation - à intégrer avec votre service email)
        console.log('Email de commande généré:', emailContent.choices[0]?.message?.content);
        
      } catch (aiError) {
        console.error('Erreur lors de la génération de l\'email:', aiError);
      }
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la commande' },
      { status: 500 }
    );
  }
}