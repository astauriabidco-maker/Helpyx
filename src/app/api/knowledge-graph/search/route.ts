import { NextRequest, NextResponse } from 'next/server';
import { KnowledgeGraphEngine } from '@/lib/knowledge-graph';
import { ContextualSearchQuery } from '@/types/knowledge-graph';

// Instance singleton du moteur
let kgEngine: KnowledgeGraphEngine | null = null;

function getKnowledgeGraphEngine(): KnowledgeGraphEngine {
  if (!kgEngine) {
    kgEngine = new KnowledgeGraphEngine();
  }
  return kgEngine;
}

export async function POST(request: NextRequest) {
  try {
    const query: ContextualSearchQuery = await request.json();
    
    if (!query.query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const engine = getKnowledgeGraphEngine();
    const results = await engine.contextualSearch(query);

    return NextResponse.json({
      success: true,
      results,
      total: results.length,
      query: query.query
    });

  } catch (error) {
    console.error('Knowledge graph search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    const searchQuery: ContextualSearchQuery = {
      query,
      semantic: true,
      filters: {
        maxResults: 20
      }
    };

    const engine = getKnowledgeGraphEngine();
    const results = await engine.contextualSearch(searchQuery);

    return NextResponse.json({
      success: true,
      results,
      total: results.length,
      query
    });

  } catch (error) {
    console.error('Knowledge graph search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}