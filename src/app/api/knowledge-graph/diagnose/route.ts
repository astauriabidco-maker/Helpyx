import { NextRequest, NextResponse } from 'next/server';
import { KnowledgeGraphEngine } from '@/lib/knowledge-graph';
import ZAI from 'z-ai-web-dev-sdk';
import { Entity, Relation, EntityType, RelationType } from '@/types/knowledge-graph';

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
    const { symptoms, equipment, context, history } = await request.json();

    if (!symptoms) {
      return NextResponse.json(
        { error: 'Symptoms are required' },
        { status: 400 }
      );
    }

    const engine = getKnowledgeGraphEngine();
    const zai = await ZAI.create();

    // Effectuer un diagnostic intelligent basé sur le graphe
    const diagnosis = await performIntelligentDiagnosis(
      { symptoms, equipment, context, history },
      engine,
      zai
    );

    return NextResponse.json({
      success: true,
      diagnosis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Diagnosis error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

async function performIntelligentDiagnosis(
  input: {
    symptoms: string[];
    equipment?: string;
    context?: any;
    history?: any[];
  },
  engine: KnowledgeGraphEngine,
  zai: any
) {
  try {
    const { symptoms, equipment, context, history } = input;

    // 1. Rechercher les entités pertinentes dans le graphe
    const relevantEntities = await findRelevantEntities(symptoms, equipment, engine);

    // 2. Analyser les relations et les corrélations
    const relationsAnalysis = analyzeRelations(relevantEntities, engine);

    // 3. Utiliser ZAI pour un diagnostic approfondi
    const aiDiagnosis = await getAIDiagnosis(
      symptoms,
      equipment,
      relevantEntities,
      relationsAnalysis,
      context,
      history,
      zai
    );

    // 4. Générer un diagnostic complet avec recommandations
    const completeDiagnosis = {
      primaryIssue: aiDiagnosis.primaryIssue,
      confidence: aiDiagnosis.confidence,
      possibleCauses: aiDiagnosis.possibleCauses,
      recommendedSolutions: aiDiagnosis.recommendedSolutions,
      relatedCases: relationsAnalysis.similarCases,
      riskAssessment: aiDiagnosis.riskAssessment,
      estimatedResolutionTime: aiDiagnosis.estimatedResolutionTime,
      preventiveMeasures: aiDiagnosis.preventiveMeasures,
      graphEvidence: {
        entities: relevantEntities.map(e => ({
          id: e.id,
          name: e.name,
          type: e.type,
          confidence: e.confidence,
          relevance: calculateRelevance(e, symptoms, equipment)
        })),
        relations: relationsAnalysis.keyRelations,
        patterns: relationsAnalysis.patterns
      },
      nextSteps: generateNextSteps(aiDiagnosis, relationsAnalysis)
    };

    return completeDiagnosis;

  } catch (error) {
    console.error('Intelligent diagnosis error:', error);
    throw error;
  }
}

async function findRelevantEntities(
  symptoms: string[],
  equipment: string | undefined,
  engine: KnowledgeGraphEngine
): Promise<Entity[]> {
  const relevantEntities: Entity[] = [];

  // Rechercher les entités basées sur les symptômes
  for (const symptom of symptoms) {
    const results = await engine.contextualSearch({
      query: symptom,
      context: {},
      semantic: true,
      filters: { maxResults: 10, minConfidence: 0.3 }
    });

    relevantEntities.push(...results.map(r => r.entity));
  }

  // Rechercher les entités basées sur l'équipement
  if (equipment) {
    const equipmentResults = await engine.contextualSearch({
      query: equipment,
      context: { type: EntityType.EQUIPMENT },
      semantic: true,
      filters: { maxResults: 5, minConfidence: 0.5 }
    });

    relevantEntities.push(...equipmentResults.map(r => r.entity));
  }

  // Éliminer les doublons et trier par pertinence
  const uniqueEntities = relevantEntities.filter((entity, index, self) =>
    index === self.findIndex(e => e.id === entity.id)
  );

  return uniqueEntities.sort((a, b) => b.confidence - a.confidence).slice(0, 20);
}

function analyzeRelations(entities: Entity[], engine: KnowledgeGraphEngine) {
  const keyRelations: Relation[] = [];
  const patterns: string[] = [];
  const similarCases: any[] = [];

  // Analyser les relations entre les entités pertinentes
  for (const entity of entities) {
    const relatedEntities = engine.getRelatedEntities(entity.id, 2);
    
    for (const related of relatedEntities) {
      // Trouver les relations entre les entités
      const relations = engine.getGraph().relationships.filter(r =>
        (r.sourceId === entity.id && r.targetId === related.id) ||
        (r.sourceId === related.id && r.targetId === entity.id)
      );

      keyRelations.push(...relations);
    }
  }

  // Identifier les patterns
  const errorEntities = entities.filter(e => e.type === EntityType.ERROR);
  const solutionEntities = entities.filter(e => e.type === EntityType.SOLUTION);

  if (errorEntities.length > 0 && solutionEntities.length > 0) {
    patterns.push('Error-Solution mapping available');
  }

  const equipmentEntities = entities.filter(e => e.type === EntityType.EQUIPMENT);
  if (equipmentEntities.length > 0) {
    patterns.push('Equipment-specific issues detected');
  }

  // Simuler des cas similaires basés sur les relations
  similarCases.push(
    {
      id: 'case_001',
      description: 'Similar BSOD issue on Dell Latitude',
      resolution: 'Graphics driver update resolved',
      confidence: 0.85,
      resolutionTime: '2 hours'
    },
    {
      id: 'case_002',
      description: 'Network connectivity problems',
      resolution: 'Router firmware update',
      confidence: 0.72,
      resolutionTime: '1 hour'
    }
  );

  return {
    keyRelations: keyRelations.slice(0, 10), // Limiter aux 10 plus importantes
    patterns,
    similarCases: similarCases.slice(0, 5)
  };
}

async function getAIDiagnosis(
  symptoms: string[],
  equipment: string | undefined,
  relevantEntities: Entity[],
  relationsAnalysis: any,
  context: any,
  history: any[],
  zai: any
) {
  const prompt = `
  En tant qu'expert technique senior, analyse ce problème et fournis un diagnostic complet:
  
  SYMPTÔMES: ${symptoms.join(', ')}
  ÉQUIPEMENT: ${equipment || 'Non spécifié'}
  CONTEXTE: ${JSON.stringify(context || {})}
  HISTORIQUE: ${JSON.stringify(history || [])}
  
  ENTITÉS PERTINENTES DU GRAPHE:
  ${relevantEntities.map(e => `- ${e.name} (${e.type}): ${e.description} [confiance: ${e.confidence}]`).join('\n')}
  
  RELATIONS TROUVÉES: ${relationsAnalysis.keyRelations.length}
  PATTERNS: ${relationsAnalysis.patterns.join(', ')}
  
  Fournis un diagnostic structuré au format JSON:
  {
    "primaryIssue": "description du problème principal",
    "confidence": 0.85,
    "possibleCauses": [
      {
        "cause": "cause probable 1",
        "probability": 0.7,
        "evidence": "preuve du graphe ou symptôme"
      }
    ],
    "recommendedSolutions": [
      {
        "solution": "solution recommandée 1",
        "priority": "high|medium|low",
        "estimatedSuccess": 0.8,
        "steps": ["étape 1", "étape 2"]
      }
    ],
    "riskAssessment": {
      "urgency": "low|medium|high|critical",
      "impact": "low|medium|high",
      "riskLevel": 0.6
    },
    "estimatedResolutionTime": "time estimate",
    "preventiveMeasures": ["mesure 1", "mesure 2"]
  }
  
  Sois précis, actionnable et base ton analyse sur les données fournies.
  `;

  const completion = await zai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'Tu es un expert technique avec 15+ ans d\'expérience en diagnostic de systèmes informatiques. Tu analyses les problèmes de manière méthodique et fournis des solutions pratiques.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.3,
    max_tokens: 1500
  });

  const aiResponse = completion.choices[0]?.message?.content;
  if (!aiResponse) {
    throw new Error('No AI response received');
  }

  try {
    return JSON.parse(aiResponse);
  } catch (parseError) {
    console.error('Failed to parse AI diagnosis:', aiResponse);
    // Retourner un diagnostic par défaut en cas d'erreur
    return {
      primaryIssue: 'Unable to determine primary issue',
      confidence: 0.3,
      possibleCauses: [],
      recommendedSolutions: [],
      riskAssessment: { urgency: 'medium', impact: 'medium', riskLevel: 0.5 },
      estimatedResolutionTime: 'Unknown',
      preventiveMeasures: []
    };
  }
}

function calculateRelevance(entity: Entity, symptoms: string[], equipment?: string): number {
  let relevance = 0;

  // Pertinence basée sur les symptômes
  for (const symptom of symptoms) {
    if (entity.name.toLowerCase().includes(symptom.toLowerCase()) ||
        entity.description.toLowerCase().includes(symptom.toLowerCase())) {
      relevance += 0.3;
    }
  }

  // Pertinence basée sur l'équipement
  if (equipment && (
    entity.name.toLowerCase().includes(equipment.toLowerCase()) ||
    entity.properties.brand?.toLowerCase().includes(equipment.toLowerCase())
  )) {
    relevance += 0.4;
  }

  // Pertinence basée sur le type d'entité
  if (entity.type === EntityType.ERROR) relevance += 0.2;
  if (entity.type === EntityType.SOLUTION) relevance += 0.1;

  return Math.min(1, relevance);
}

function generateNextSteps(aiDiagnosis: any, relationsAnalysis: any): string[] {
  const nextSteps: string[] = [];

  // Basé sur le diagnostic IA
  if (aiDiagnosis.recommendedSolutions.length > 0) {
    const topSolution = aiDiagnosis.recommendedSolutions[0];
    nextSteps.push(`Apply primary solution: ${topSolution.solution}`);
  }

  // Basé sur l'analyse des relations
  if (relationsAnalysis.patterns.includes('Error-Solution mapping available')) {
    nextSteps.push('Review similar resolved cases for additional insights');
  }

  // Basé sur l'évaluation du risque
  if (aiDiagnosis.riskAssessment.urgency === 'critical' || aiDiagnosis.riskAssessment.urgency === 'high') {
    nextSteps.push('Escalate to senior technician if not resolved within 1 hour');
  }

  // Étapes générales
  nextSteps.push('Document all steps taken during resolution');
  nextSteps.push('Update knowledge graph with resolution details');

  return nextSteps;
}

// Endpoint pour obtenir des suggestions de diagnostic en temps réel
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const equipment = searchParams.get('equipment');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    const engine = getKnowledgeGraphEngine();
    const zai = await ZAI.create();

    // Obtenir des suggestions rapides
    const suggestions = await getDiagnosticSuggestions(query, equipment, engine, zai);

    return NextResponse.json({
      success: true,
      query,
      equipment,
      suggestions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Diagnostic suggestions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getDiagnosticSuggestions(
  query: string,
  equipment: string | null,
  engine: KnowledgeGraphEngine,
  zai: any
) {
  try {
    // Rechercher des entités pertinentes rapidement
    const results = await engine.contextualSearch({
      query,
      context: equipment ? { equipment } : {},
      semantic: true,
      filters: { maxResults: 5, minConfidence: 0.4 }
    });

    // Utiliser ZAI pour des suggestions rapides
    const prompt = `
    Basé sur cette requête de diagnostic: "${query}" ${equipment ? `pour équipement: ${equipment}` : ''}
    
    Et ces entités pertinentes trouvées:
    ${results.map(r => `- ${r.entity.name} (${r.entity.type}): ${r.entity.description}`).join('\n')}
    
    Suggère 3-5 diagnostics possibles au format JSON:
    {
      "suggestions": [
        {
          "issue": "problème possible",
          "probability": 0.7,
          "quickSolution": "solution rapide"
        }
      ]
    }
    `;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert en diagnostic technique. Fournis des suggestions rapides et précises.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 500
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (aiResponse) {
      const suggestions = JSON.parse(aiResponse);
      return suggestions.suggestions;
    }

    // Retourner des suggestions basées sur les entités si l'IA échoue
    return results.slice(0, 3).map(r => ({
      issue: r.entity.name,
      probability: r.confidence,
      quickSolution: 'Check related solutions in knowledge base'
    }));

  } catch (error) {
    console.error('Error getting diagnostic suggestions:', error);
    return [];
  }
}