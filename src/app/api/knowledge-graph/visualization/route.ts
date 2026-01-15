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
    const { searchParams } = new URL(request.url);
    const layout = searchParams.get('layout') as 'force' | 'hierarchical' | 'circular' | 'grid' || 'force';

    const engine = getKnowledgeGraphEngine();
    const visualization = engine.generateVisualization(layout);

    return NextResponse.json({
      success: true,
      visualization,
      metadata: {
        nodes: visualization.nodes.length,
        edges: visualization.edges.length,
        layout
      }
    });

  } catch (error) {
    console.error('Knowledge graph visualization error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}