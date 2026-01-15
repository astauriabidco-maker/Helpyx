import { NextRequest, NextResponse } from 'next/server';
import { KnowledgeGraphEngine } from '@/lib/knowledge-graph';

// Instance singleton du moteur
let kgEngine: KnowledgeGraphEngine | null = null;

function getKnowledgeGraphEngine(): KnowledgeGraphEngine {
  if (!kgEngine) {
    kgEngine = new KnowledgeGraphEngine();
  }
  return kgEngine;
}

export async function GET(request: NextRequest) {
  try {
    const engine = getKnowledgeGraphEngine();
    const insights = await engine.generateInsights();

    return NextResponse.json({
      success: true,
      insights,
      total: insights.length
    });

  } catch (error) {
    console.error('Knowledge graph insights error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}