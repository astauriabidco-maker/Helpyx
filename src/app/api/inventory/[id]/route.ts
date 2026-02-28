import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateInventorySchema = z.object({
  nom: z.string().min(1).optional(),
  reference: z.string().optional(),
  description: z.string().optional(),
  categorie: z.string().optional(),
  quantite: z.number().min(0).optional(),
  seuilAlerte: z.number().min(0).optional(),
  coutUnitaire: z.number().optional(),
  prixVente: z.number().optional(),
  fournisseur: z.string().optional(),
  emplacement: z.string().optional(),
  specifications: z.string().optional(),
  // Reconditionnement
  grade: z.enum(['A', 'B', 'C', 'D']).optional(),
  marque: z.string().optional(),
  modele: z.string().optional(),
  processeur: z.string().optional(),
  ram: z.string().optional(),
  stockage: z.string().optional(),
  ecran: z.string().optional(),
  systemeOs: z.string().optional(),
  cosmetique: z.string().optional(),
  batteryCycles: z.number().optional(),
  batteryHealth: z.number().optional(),
  dureeGarantie: z.number().optional(),
  statut: z.string().optional(),
  testeePar: z.string().optional(),
  notesTest: z.string().optional(),
});

// GET - Récupérer un article spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await db.inventory.findUnique({
      where: { id: id },
      include: {
        ticketItems: {
          include: {
            ticket: {
              select: {
                id: true,
                titre: true,
                status: true,
                createdAt: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        restockOrders: {
          orderBy: {
            dateCommande: 'desc'
          }
        }
      }
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'article:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'article' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un article
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateInventorySchema.parse(body);

    // Vérifier si l'article existe
    const existingItem = await db.inventory.findUnique({
      where: { id: id }
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si la nouvelle référence est déjà utilisée
    if (validatedData.reference && validatedData.reference !== existingItem.reference) {
      const duplicate = await db.inventory.findUnique({
        where: { reference: validatedData.reference }
      });

      if (duplicate) {
        return NextResponse.json(
          { error: 'Cette référence est déjà utilisée' },
          { status: 400 }
        );
      }
    }

    const item = await db.inventory.update({
      where: { id: id },
      data: {
        ...validatedData,
        updatedAt: new Date()
      },
      include: {
        restockOrders: true,
        ticketItems: true
      }
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'article:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'article' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un article
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Vérifier si l'article est utilisé dans des tickets
    const ticketItems = await db.ticketInventoryItem.findMany({
      where: { inventoryId: id }
    });

    if (ticketItems.length > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer cet article car il est utilisé dans des tickets' },
        { status: 400 }
      );
    }

    await db.inventory.delete({
      where: { id: id }
    });

    return NextResponse.json({ message: 'Article supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'article:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'article' },
      { status: 500 }
    );
  }
}
