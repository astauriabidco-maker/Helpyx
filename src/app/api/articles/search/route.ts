import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';


// GET - Recherche intelligente d'articles avec IA
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const categorie = searchParams.get('categorie');
    const difficulte = searchParams.get('difficulte');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query) {
      return NextResponse.json(
        { error: 'La requête de recherche est requise' },
        { status: 400 }
      );
    }

    // Recherche textuelle standard d'abord
    const where: any = {
      publie: true,
      OR: [
        { titre: { contains: query } },
        { resume: { contains: query } },
        { contenu: { contains: query } },
      ]
    };

    if (categorie) {
      where.categorie = categorie;
    }

    if (difficulte) {
      where.difficulte = difficulte;
    }

    const articles = await db.article.findMany({
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
      take: limit,
    });

    // Si aucun résultat, essayer une recherche plus large avec l'IA
    if (articles.length === 0) {
      try {
        const ZAI = (await import('z-ai-web-dev-sdk')).default; const zai = await ZAI.create();
        
        const aiResponse = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'Tu es un assistant expert en support technique et dépannage informatique. À partir d\'une question d\'utilisateur, suggère des articles pertinents et des mots-clés pour la recherche.'
            },
            {
              role: 'user',
              content: `Un utilisateur cherche: "${query}"
              
              Suggère-moi:
              1. Des mots-clés alternatifs pour la recherche
              2. Des catégories pertinentes
              3. Une réponse directe si possible
              
              Retourne uniquement un JSON avec:
              {
                "keywords": ["mot1", "mot2", "mot3"],
                "categories": ["catégorie1", "catégorie2"],
                "suggestion": "Réponse directe ou conseil"
              }`
            }
          ]
        });

        const aiData = JSON.parse(aiResponse.choices[0]?.message?.content || '{}');
        
        // Rechercher avec les mots-clés suggérés par l'IA
        if (aiData.keywords && aiData.keywords.length > 0) {
          const expandedWhere = {
            publie: true,
            OR: aiData.keywords.map((keyword: string) => ({
              OR: [
                { titre: { contains: keyword } },
                { resume: { contains: keyword } },
                { contenu: { contains: keyword } },
              ]
            }))
          };

          const expandedResults = await db.article.findMany({
            where: expandedWhere,
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
            take: limit,
          });

          return NextResponse.json({
            articles: expandedResults.map(article => ({
              ...article,
              tags: article.tags ? JSON.parse(article.tags) : []
            })),
            aiSuggestion: aiData.suggestion,
            searchExpanded: true,
            originalQuery: query,
            suggestedKeywords: aiData.keywords
          });
        }

        return NextResponse.json({
          articles: [],
          aiSuggestion: aiData.suggestion,
          searchExpanded: false,
          originalQuery: query
        });

      } catch (aiError) {
        console.error('Erreur lors de la recherche IA:', aiError);
        
        return NextResponse.json({
          articles: [],
          aiSuggestion: 'Désolé, je n\'ai pas trouvé d\'articles correspondants. Essayez avec d\'autres mots-clés.',
          searchExpanded: false,
          originalQuery: query
        });
      }
    }

    return NextResponse.json({
      articles: articles.map(article => ({
        ...article,
        tags: article.tags ? JSON.parse(article.tags) : []
      })),
      searchExpanded: false,
      originalQuery: query
    });

  } catch (error) {
    console.error('Erreur lors de la recherche d\'articles:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recherche d\'articles' },
      { status: 500 }
    );
  }
}