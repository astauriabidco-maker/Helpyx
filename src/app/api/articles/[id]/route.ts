import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateArticleSchema = z.object({
  titre: z.string().min(1).optional(),
  contenu: z.string().min(1).optional(),
  resume: z.string().optional(),
  categorie: z.string().optional(),
  tags: z.array(z.string()).optional(),
  difficulte: z.enum(['FACILE', 'MOYEN', 'DIFFICILE']).optional(),
  tempsLecture: z.number().min(1).optional(),
  ordre: z.number().optional(),
  publie: z.boolean().optional(),
});

// GET - Récupérer un article spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const article = await db.article.findUnique({
      where: { id: id },
      include: {
        auteur: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...article,
      tags: article.tags ? JSON.parse(article.tags) : []
    });
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
    const validatedData = updateArticleSchema.parse(body);

    const article = await db.article.update({
      where: { id: id },
      data: {
        ...validatedData,
        tags: validatedData.tags ? JSON.stringify(validatedData.tags) : undefined,
        updatedAt: new Date()
      },
      include: {
        auteur: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      ...article,
      tags: article.tags ? JSON.parse(article.tags) : []
    });
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
    await db.article.delete({
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
