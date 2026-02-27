import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { requireTenant } from '@/lib/tenant';

const createArticleSchema = z.object({
  titre: z.string().min(1),
  contenu: z.string().min(1),
  resume: z.string().optional(),
  categorie: z.string().optional(),
  tags: z.array(z.string()).optional(),
  difficulte: z.enum(['FACILE', 'MOYEN', 'DIFFICILE']).default('MOYEN'),
  tempsLecture: z.number().min(1).default(5),
  ordre: z.number().default(0),
  publie: z.boolean().default(false),
});

// GET - Récupérer les articles avec filtres — isolés par entreprise
export async function GET(request: NextRequest) {
  try {
    // Multi-tenant: auth + isolation par entreprise
    const [ctx, errorResponse] = await requireTenant();
    if (errorResponse) return errorResponse;
    const { companyId } = ctx;

    const { searchParams } = new URL(request.url);

    const categorie = searchParams.get('categorie');
    const recherche = searchParams.get('recherche');
    const difficulte = searchParams.get('difficulte');
    const publie = searchParams.get('publie');
    const tags = searchParams.get('tags');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // TOUJOURS filtré par companyId
    const where: any = { companyId };

    if (categorie) {
      where.categorie = categorie;
    }

    if (difficulte) {
      where.difficulte = difficulte;
    }

    if (publie !== null) {
      where.publie = publie === 'true';
    }

    if (tags) {
      const tagArray = tags.split(',');
      where.tags = {
        contains: tagArray.map(tag => `"${tag.trim()}"`).join(',')
      };
    }

    if (recherche) {
      where.OR = [
        { titre: { contains: recherche } },
        { resume: { contains: recherche } },
        { contenu: { contains: recherche } },
      ];
    }

    const [articles, total] = await Promise.all([
      db.article.findMany({
        where,
        include: {
          auteur: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: [
          { ordre: 'asc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit,
      }),
      db.article.count({ where })
    ]);

    // Formatter les articles
    const formattedArticles = articles.map(article => ({
      ...article,
      tags: article.tags ? JSON.parse(article.tags) : [],
      tempsLecture: article.tempsLecture || 5
    }));

    return NextResponse.json({
      articles: formattedArticles,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des articles:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des articles' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouvel article — dans l'entreprise de l'utilisateur
export async function POST(request: NextRequest) {
  try {
    // Multi-tenant: auth + companyId
    const [ctx, errorResponse] = await requireTenant({ requireRole: ['ADMIN', 'AGENT'] });
    if (errorResponse) return errorResponse;
    const { user, companyId } = ctx;

    const body = await request.json();
    const validatedData = createArticleSchema.parse(body);

    const article = await db.article.create({
      data: {
        ...validatedData,
        companyId: user.companyId,
        auteurId: user.id,
        tags: validatedData.tags ? JSON.stringify(validatedData.tags) : null,
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
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'article:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'article' },
      { status: 500 }
    );
  }
}