import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { context, analyses, insightTypes } = await request.json();

    const zai = await ZAI.create();

    // Génération d'insights profonds avec GPT-4
    const insightsPrompt = `
    En tant qu'expert en analyse de données et en intelligence artificielle, génère des insights pertinents basés sur:
    
    Contexte: "${context}"
    Analyses précédentes: ${JSON.stringify(analyses, null, 2)}
    
    Génère 3-5 insights des types demandés: ${insightTypes.join(', ')}
    
    Pour chaque insight, fournis:
    - Type (pattern, prediction, recommendation, explanation)
    - Titre percutant
    - Description détaillée
    - Niveau de confiance (0-1)
    - Sources ou données support
    - Si l'insight est actionnable
    - Priorité (low, medium, high)
    
    Réponds uniquement avec un tableau JSON d'objets insights.
    `;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Tu es un analyste de données expert utilisant GPT-4 pour extraire des insights profonds et actionnables. Sois précis, pertinent et innovant.'
        },
        {
          role: 'user',
          content: insightsPrompt
        }
      ],
      model: 'gpt-4',
      temperature: 0.3,
      max_tokens: 2000
    });

    const insightsData = JSON.parse(completion.choices[0].message.content || '[]');

    const insights = insightsData.map((insight: any, index: number) => ({
      id: `insight-${Date.now()}-${index}`,
      type: insight.type || 'pattern',
      title: insight.title || 'Insight généré',
      content: insight.description || 'Description non disponible',
      confidence: insight.confidence || 0.7,
      context: context,
      sources: insight.sources || [],
      actionable: insight.actionnable || false,
      priority: insight.priority || 'medium',
      createdAt: new Date()
    }));

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('GPT-4 Insights error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Simuler des insights existants
    const insights = [
      {
        id: 'insight-demo-1',
        type: 'pattern',
        title: 'Corrélation matérielle-logiciel',
        content: 'Les pannes BSOD sont 3x plus fréquentes sur les Dell Latitude avec Windows 11',
        confidence: 0.82,
        context: 'Analyse des tickets support',
        sources: ['Tickets support', 'Logs système'],
        actionable: true,
        priority: 'high',
        createdAt: new Date()
      },
      {
        id: 'insight-demo-2',
        type: 'prediction',
        title: 'Risque de panne réseau',
        content: 'Probabilité de 65% de pannes réseau sur les équipements HP plus de 3 ans',
        confidence: 0.65,
        context: 'Analyse prédictive',
        sources: ['Historique des pannes', 'Données matérielles'],
        actionable: true,
        priority: 'medium',
        createdAt: new Date()
      }
    ];

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Error fetching insights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}