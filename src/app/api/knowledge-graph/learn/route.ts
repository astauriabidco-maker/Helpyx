import { NextRequest, NextResponse } from 'next/server';
import { KnowledgeGraphEngine } from '@/lib/knowledge-graph';
import { LearningData } from '@/types/knowledge-graph';

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
    const learningData: LearningData = await request.json();
    
    if (!learningData.ticketId || !learningData.entitiesExtracted || !learningData.relationsExtracted) {
      return NextResponse.json(
        { error: 'Missing required fields: ticketId, entitiesExtracted, relationsExtracted' },
        { status: 400 }
      );
    }

    const engine = getKnowledgeGraphEngine();
    await engine.learnFromTicket(learningData);

    return NextResponse.json({
      success: true,
      message: 'Learning data processed successfully',
      graphMetadata: engine.getGraph().metadata
    });

  } catch (error) {
    console.error('Knowledge graph learning error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}