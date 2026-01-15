import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

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

// GET - Récupérer les articles avec filtres
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const categorie = searchParams.get('categorie');
    const recherche = searchParams.get('recherche');
    const difficulte = searchParams.get('difficulte');
    const publie = searchParams.get('publie');
    const tags = searchParams.get('tags');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {};
    
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

// POST - Créer un nouvel article
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createArticleSchema.parse(body);

    const article = await db.article.create({
      data: {
        ...validatedData,
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