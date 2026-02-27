import { NextRequest, NextResponse } from 'next/server';
import { KnowledgeGraphEngine } from '@/lib/knowledge-graph';

// Rate limiting simple (en production, utiliser Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // 100 requêtes par heure par IP
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 heure en ms

// Clés API valides (en production, utiliser une base de données)
const VALID_API_KEYS = new Set([
  'kg_demo_key_2024',
  'partner_test_key_123',
  'integration_key_456'
]);

// Instance singleton du moteur
let kgEngine: KnowledgeGraphEngine | null = null;

function getKnowledgeGraphEngine(): KnowledgeGraphEngine {
  if (!kgEngine) {
    kgEngine = new KnowledgeGraphEngine();
  }
  return kgEngine;
}

// Middleware de rate limiting
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

// Middleware d'authentification API
function authenticateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key');
  return apiKey ? VALID_API_KEYS.has(apiKey) : false;
}

// GET - Recherche publique dans le Knowledge Graph
export async function GET(request: NextRequest) {
  try {
    // Authentification
    if (!authenticateApiKey(request)) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    const engine = getKnowledgeGraphEngine();

    // Recherche contextuelle
    const results = await engine.contextualSearch({
      query,
      context: {
        type: type || undefined
      } as any,
      semantic: true,
      filters: {
        maxResults: limit,
        minConfidence: 0.3
      }
    });

    // Formater la réponse pour l'API publique
    const publicResults = results.map(result => ({
      id: result.entity.id,
      name: result.entity.name,
      type: result.entity.type,
      description: result.entity.description,
      confidence: Math.round((result as any).confidence * 100),
      properties: result.entity.properties,
      relatedEntities: (result.relatedEntities || []).map(entity => ({
        id: entity.id,
        name: entity.name,
        type: entity.type,
        confidence: Math.round(entity.confidence * 100)
      }))
    }));

    return NextResponse.json({
      success: true,
      query,
      total: publicResults.length,
      limit,
      offset,
      results: publicResults,
      metadata: {
        graphSize: engine.getGraph().metadata,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Public API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Enrichissement de données (partenaires)
export async function POST(request: NextRequest) {
  try {
    // Authentification
    if (!authenticateApiKey(request)) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { action, data } = body;

    if (!action || !data) {
      return NextResponse.json(
        { error: 'Action and data are required' },
        { status: 400 }
      );
    }

    const engine = getKnowledgeGraphEngine();

    switch (action) {
      case 'enrich':
        // Enrichir des données externes
        const enrichedData = await enrichExternalData(data, engine);
        return NextResponse.json({
          success: true,
          action: 'enrich',
          original: data,
          enriched: enrichedData
        });

      case 'validate':
        // Valider des entités
        const validationResult = await validateEntities(data, engine);
        return NextResponse.json({
          success: true,
          action: 'validate',
          validation: validationResult
        });

      case 'suggest':
        // Suggérer des relations
        const suggestions = await suggestRelations(data, engine);
        return NextResponse.json({
          success: true,
          action: 'suggest',
          suggestions
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Public API POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Fonctions d'enrichissement
async function enrichExternalData(data: any, engine: KnowledgeGraphEngine) {
  try {
    const results = await engine.contextualSearch({
      query: data.text || data.description || '',
      context: data.context || {},
      semantic: true,
      filters: { maxResults: 5, minConfidence: 0.5 }
    });

    return {
      entities: results.map(r => ({
        id: r.entity.id,
        name: r.entity.name,
        type: r.entity.type,
        confidence: Math.round((r as any).confidence * 100)
      })),
      insights: results.slice(0, 3).map(r => r.entity.description)
    };
  } catch (error) {
    console.error('Enrichment error:', error);
    return { entities: [], insights: [] };
  }
}

async function validateEntities(data: any, engine: KnowledgeGraphEngine) {
  try {
    const validationResults: any[] = [];

    for (const entity of data.entities || []) {
      const results = await engine.contextualSearch({
        query: entity.name,
        context: { type: entity.type } as any,
        semantic: true,
        filters: { maxResults: 3, minConfidence: 0.7 }
      });

      validationResults.push({
        original: entity,
        matches: results.map(r => ({
          id: r.entity.id,
          name: r.entity.name,
          confidence: Math.round((r as any).confidence * 100)
        })),
        isValid: results.length > 0,
        confidence: results.length > 0 ? Math.max(...results.map((r: any) => r.confidence)) : 0
      });
    }

    return validationResults;
  } catch (error) {
    console.error('Validation error:', error);
    return [];
  }
}

async function suggestRelations(data: any, engine: KnowledgeGraphEngine) {
  try {
    const suggestions: any[] = [];

    for (const entity of data.entities || []) {
      const relatedEntities = engine.getRelatedEntities(entity.id, 2);

      suggestions.push({
        entityId: entity.id,
        entityName: entity.name,
        related: relatedEntities.slice(0, 5).map(related => ({
          id: related.id,
          name: related.name,
          type: related.type,
          confidence: Math.round(related.confidence * 100)
        }))
      });
    }

    return suggestions;
  } catch (error) {
    console.error('Suggestions error:', error);
    return [];
  }
}