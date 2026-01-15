import { NextRequest, NextResponse } from 'next/server';
import { KnowledgeGraphEngine } from '@/lib/knowledge-graph';
import ZAI from 'z-ai-web-dev-sdk';

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
    const { action, data } = await request.json();

    if (!action || !data) {
      return NextResponse.json(
        { error: 'Action and data are required' },
        { status: 400 }
      );
    }

    const engine = getKnowledgeGraphEngine();
    const zai = await ZAI.create();

    switch (action) {
      case 'enrich-ticket':
        // Enrichir un ticket avec des entités et relations extraites par IA
        return await enrichTicket(data, engine, zai);

      case 'suggest-entities':
        // Suggérer des entités basées sur le contexte
        return await suggestEntities(data, engine, zai);

      case 'validate-relations':
        // Valider et renforcer les relations existantes
        return await validateRelations(data, engine, zai);

      case 'generate-insights':
        // Générer des insights intelligents
        return await generateInsights(data, engine, zai);

      case 'auto-categorize':
        // Catégoriser automatiquement les entités
        return await autoCategorize(data, engine, zai);

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Knowledge Graph enrichment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function enrichTicket(data: any, engine: KnowledgeGraphEngine, zai: any) {
  try {
    const { ticketId, description, category, urgency } = data;

    // Utiliser ZAI pour extraire les entités du ticket
    const prompt = `
    Analyse ce ticket de support et extrait les entités importantes:
    
    Description: "${description}"
    Catégorie: "${category}"
    Urgence: "${urgency}"
    
    Identifie et extrais:
    1. Équipements mentionnés (marques, modèles, types)
    2. Erreurs ou symptômes décrits
    3. Solutions potentielles suggérées
    4. Contexte technique (OS, logiciels, etc.)
    
    Réponds au format JSON avec cette structure:
    {
      "equipment": [{"name": "nom", "brand": "marque", "type": "type", "confidence": 0.9}],
      "errors": [{"name": "erreur", "code": "code", "symptoms": ["symptome1", "symptome2"], "confidence": 0.8}],
      "solutions": [{"name": "solution", "procedure": "procédure", "confidence": 0.7}],
      "context": {"os": "OS", "software": ["logiciel1"], "confidence": 0.9}
    }
    `;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert en analyse de tickets de support technique. Extrais les entités avec précision et évalue leur niveau de confiance.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    let extractedData;
    try {
      extractedData = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('Invalid AI response format');
    }

    // Ajouter les entités extraites au graphe
    const addedEntities = [];
    const addedRelations = [];

    // Traiter les équipements
    if (extractedData.equipment) {
      for (const eq of extractedData.equipment) {
        const entity = {
          id: `eq_${ticketId}_${Date.now()}_${Math.random()}`,
          type: 'equipment' as const,
          name: eq.name,
          description: `${eq.type} manufactured by ${eq.brand}`,
          properties: { 
            brand: eq.brand, 
            type: eq.type,
            source: 'ai_extraction',
            ticketId 
          },
          confidence: eq.confidence,
          createdAt: new Date(),
          updatedAt: new Date(),
          ticketIds: [ticketId]
        };

        engine.addEntity(entity);
        addedEntities.push(entity);

        // Ajouter la marque si elle n'existe pas
        if (eq.brand) {
          const brandEntity = {
            id: `brand_${eq.brand}_${Date.now()}`,
            type: 'brand' as const,
            name: eq.brand,
            description: `Brand of ${eq.type} equipment`,
            properties: { 
              industry: 'technology',
              source: 'ai_extraction'
            },
            confidence: 0.9,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          engine.addEntity(brandEntity);
          addedEntities.push(brandEntity);

          // Créer la relation marque-équipement
          const relation = {
            id: `rel_${Date.now()}_${Math.random()}`,
            sourceId: brandEntity.id,
            targetId: entity.id,
            type: 'manufactured-by' as const,
            weight: 0.9,
            confidence: 0.85,
            properties: { 
              source: 'ai_extraction',
              ticketId 
            },
            createdAt: new Date()
          };

          engine.addRelation(relation);
          addedRelations.push(relation);
        }
      }
    }

    // Traiter les erreurs
    if (extractedData.errors) {
      for (const err of extractedData.errors) {
        const entity = {
          id: `err_${ticketId}_${Date.now()}_${Math.random()}`,
          type: 'error' as const,
          name: err.name,
          description: err.symptoms?.join(', ') || 'System error',
          properties: { 
            code: err.code,
            symptoms: err.symptoms,
            source: 'ai_extraction',
            ticketId 
          },
          confidence: err.confidence,
          createdAt: new Date(),
          updatedAt: new Date(),
          ticketIds: [ticketId]
        };

        engine.addEntity(entity);
        addedEntities.push(entity);

        // Lier les erreurs aux équipements
        for (const eq of extractedData.equipment || []) {
          const eqEntity = addedEntities.find(e => e.name === eq.name && e.type === 'equipment');
          if (eqEntity) {
            const relation = {
              id: `rel_${Date.now()}_${Math.random()}`,
              sourceId: eqEntity.id,
              targetId: entity.id,
              type: 'has-symptom' as const,
              weight: 0.7,
              confidence: 0.75,
              properties: { 
                source: 'ai_extraction',
                ticketId 
              },
              createdAt: new Date()
            };

            engine.addRelation(relation);
            addedRelations.push(relation);
          }
        }
      }
    }

    // Traiter les solutions
    if (extractedData.solutions) {
      for (const sol of extractedData.solutions) {
        const entity = {
          id: `sol_${ticketId}_${Date.now()}_${Math.random()}`,
          type: 'solution' as const,
          name: sol.name,
          description: sol.procedure,
          properties: { 
            procedure: sol.procedure,
            source: 'ai_extraction',
            ticketId 
          },
          confidence: sol.confidence,
          createdAt: new Date(),
          updatedAt: new Date(),
          ticketIds: [ticketId]
        };

        engine.addEntity(entity);
        addedEntities.push(entity);

        // Lier les solutions aux erreurs
        for (const err of extractedData.errors || []) {
          const errEntity = addedEntities.find(e => e.name === err.name && e.type === 'error');
          if (errEntity) {
            const relation = {
              id: `rel_${Date.now()}_${Math.random()}`,
              sourceId: entity.id,
              targetId: errEntity.id,
              type: 'resolves' as const,
              weight: 0.8,
              confidence: 0.7,
              properties: { 
                source: 'ai_extraction',
                ticketId,
                successRate: 0.75
              },
              createdAt: new Date()
            };

            engine.addRelation(relation);
            addedRelations.push(relation);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      action: 'enrich-ticket',
      ticketId,
      extractedData,
      addedEntities: addedEntities.length,
      addedRelations: addedRelations.length,
      entities: addedEntities,
      relations: addedRelations
    });

  } catch (error) {
    console.error('Ticket enrichment error:', error);
    return NextResponse.json(
      { error: 'Failed to enrich ticket', details: error.message },
      { status: 500 }
    );
  }
}

async function suggestEntities(data: any, engine: KnowledgeGraphEngine, zai: any) {
  try {
    const { query, context, limit = 5 } = data;

    // Utiliser ZAI pour suggérer des entités pertinentes
    const prompt = `
    Basé sur cette requête et ce contexte, suggère des entités pertinentes pour un knowledge graph de support technique:
    
    Requête: "${query}"
    Contexte: ${JSON.stringify(context)}
    
    Suggère des entités de types: equipment, error, solution, brand, software
    
    Réponds au format JSON:
    {
      "suggestions": [
        {
          "name": "nom de l'entité",
          "type": "equipment|error|solution|brand|software",
          "description": "description",
          "properties": {"key": "value"},
          "confidence": 0.8,
          "relevance": 0.9
        }
      ]
    }
    `;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert en knowledge graphs pour le support technique. Suggère des entités pertinentes et précises.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 800
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    const suggestions = JSON.parse(aiResponse);

    return NextResponse.json({
      success: true,
      action: 'suggest-entities',
      query,
      suggestions: suggestions.suggestions.slice(0, limit)
    });

  } catch (error) {
    console.error('Entity suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to suggest entities', details: error.message },
      { status: 500 }
    );
  }
}

async function validateRelations(data: any, engine: KnowledgeGraphEngine, zai: any) {
  try {
    const { relations } = data;

    const validatedRelations = [];

    for (const relation of relations) {
      // Utiliser ZAI pour valider la relation
      const prompt = `
      Évalue la pertinence de cette relation dans un knowledge graph de support technique:
      
      Relation: ${relation.sourceEntity} -> ${relation.type} -> ${relation.targetEntity}
      
      Contexte: ${relation.context || 'Non spécifié'}
      
      Évalue sur une échelle de 0 à 1:
      - Pertinence: La relation est-elle logique et correcte?
      - Force: Quelle est la force de cette relation?
      - Confiance: Niveau de confiance dans la relation
      
      Réponds au format JSON:
      {
        "valid": true/false,
        "relevance": 0.8,
        "strength": 0.7,
        "confidence": 0.85,
        "explanation": "explication de l'évaluation"
      }
      `;

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en validation de knowledge graphs. Évalue les relations avec précision.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 300
      });

      const aiResponse = completion.choices[0]?.message?.content;
      if (aiResponse) {
        const validation = JSON.parse(aiResponse);
        validatedRelations.push({
          ...relation,
          validation
        });
      }
    }

    return NextResponse.json({
      success: true,
      action: 'validate-relations',
      validatedRelations,
      summary: {
        total: relations.length,
        valid: validatedRelations.filter(r => r.validation.valid).length,
        invalid: validatedRelations.filter(r => !r.validation.valid).length,
        averageConfidence: validatedRelations.reduce((sum, r) => sum + r.validation.confidence, 0) / validatedRelations.length
      }
    });

  } catch (error) {
    console.error('Relation validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate relations', details: error.message },
      { status: 500 }
    );
  }
}

async function generateInsights(data: any, engine: KnowledgeGraphEngine, zai: any) {
  try {
    const { entities, relations, timeRange = '30d' } = data;

    // Utiliser ZAI pour générer des insights intelligents
    const prompt = `
    Analyse ce knowledge graph de support technique et génère des insights pertinents:
    
    Entités: ${entities.length}
    Relations: ${relations.length}
    Période: ${timeRange}
    
    Types d'entités: ${entities.map((e: any) => e.type).join(', ')}
    Types de relations: ${relations.map((r: any) => r.type).join(', ')}
    
    Génère des insights sur:
    1. Corrélations intéressantes entre équipements et erreurs
    2. Solutions les plus efficaces
    3. Tendances émergentes
    4. Points de faiblesse ou améliorations possibles
    
    Réponds au format JSON:
    {
      "insights": [
        {
          "type": "correlation|pattern|anomaly|prediction",
          "title": "titre de l'insight",
          "description": "description détaillée",
          "confidence": 0.8,
          "impact": "low|medium|high",
          "entities": ["entity1", "entity2"],
          "recommendations": ["recommandation1", "recommandation2"]
        }
      ]
    }
    `;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert en analyse de knowledge graphs pour le support technique. Génère des insights actionnables et pertinents.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 1200
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    const insights = JSON.parse(aiResponse);

    return NextResponse.json({
      success: true,
      action: 'generate-insights',
      insights: insights.insights,
      metadata: {
        entitiesAnalyzed: entities.length,
        relationsAnalyzed: relations.length,
        timeRange,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Insights generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights', details: error.message },
      { status: 500 }
    );
  }
}

async function autoCategorize(data: any, engine: KnowledgeGraphEngine, zai: any) {
  try {
    const { entities } = data;

    const categorizedEntities = [];

    for (const entity of entities) {
      // Utiliser ZAI pour catégoriser l'entité
      const prompt = `
      Analyse cette entité et suggère une catégorisation optimale:
      
      Nom: ${entity.name}
      Description: ${entity.description}
      Type actuel: ${entity.type}
      Propriétés: ${JSON.stringify(entity.properties)}
      
      Suggère:
      1. Le type le plus approprié
      2. Des catégories ou tags pertinents
      3. Des propriétés manquantes importantes
      
      Réponds au format JSON:
      {
        "suggestedType": "type_suggéré",
        "categories": ["catégorie1", "catégorie2"],
        "missingProperties": ["propriété1", "propriété2"],
        "confidence": 0.85,
        "reasoning": "explication du raisonnement"
      }
      `;

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en classification d\'entités pour les knowledge graphs de support technique.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 400
      });

      const aiResponse = completion.choices[0]?.message?.content;
      if (aiResponse) {
        const categorization = JSON.parse(aiResponse);
        categorizedEntities.push({
          ...entity,
          categorization
        });
      }
    }

    return NextResponse.json({
      success: true,
      action: 'auto-categorize',
      categorizedEntities,
      summary: {
        total: entities.length,
        typeChanges: categorizedEntities.filter(e => e.categorization.suggestedType !== e.type).length,
        averageConfidence: categorizedEntities.reduce((sum, e) => sum + e.categorization.confidence, 0) / categorizedEntities.length
      }
    });

  } catch (error) {
    console.error('Auto-categorization error:', error);
    return NextResponse.json(
      { error: 'Failed to auto-categorize', details: error.message },
      { status: 500 }
    );
  }
}