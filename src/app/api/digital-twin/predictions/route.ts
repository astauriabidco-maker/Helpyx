import { NextRequest, NextResponse } from 'next/server'


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { equipmentId, equipmentData } = body

    // Utiliser ZAI pour des prédictions plus intelligentes
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    const zai = await ZAI.create()

    const prompt = `En tant qu'expert en maintenance prédictive et analyse de données IoT, analyse les données suivantes d'un équipement informatique et fournis des prédictions détaillées:

Équipement: ${equipmentData.name}
Type: ${equipmentData.type}
Température: ${equipmentData.temperature}°C
Utilisation: ${equipmentData.usage}%
Performance: ${equipmentData.performance}%
Santé: ${equipmentData.health}%
Statut: ${equipmentData.status}

Génère une analyse prédictive complète incluant:
1. Probabilité de panne en pourcentage
2. Problèmes potentiels spécifiques
3. Recommandations de maintenance
4. Délai avant intervention recommandée
5. Impact potentiel sur l'activité

Réponds au format JSON structuré avec ces champs exacts:
{
  "failureProbability": nombre (0-100),
  "timeframe": "string",
  "issues": ["string array"],
  "recommendations": ["string array"],
  "impact": "string",
  "confidence": nombre (0-100),
  "costAvoidance": "string"
}`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert en maintenance prédictive spécialisé dans les équipements informatiques. Tu analyses les données IoT pour prédire les pannes et recommander les actions de maintenance préventive.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    })

    const aiResponse = completion.choices[0]?.message?.content

    if (!aiResponse) {
      throw new Error('No response from AI')
    }

    let predictions
    try {
      predictions = JSON.parse(aiResponse)
    } catch (parseError) {
      // Fallback en cas d'erreur de parsing
      predictions = {
        failureProbability: Math.min(Math.max(equipmentData.temperature - 40, 0), 80),
        timeframe: '30 jours',
        issues: ['Analyse temporairement indisponible'],
        recommendations: ['Surveillance renforcée recommandée'],
        impact: 'Modéré',
        confidence: 50,
        costAvoidance: '€500-€1500'
      }
    }

    const enhancedPredictions = {
      equipmentId,
      timestamp: new Date().toISOString(),
      ...predictions,
      dataSource: 'AI_Predictive_Analysis',
      model: 'ZAI_Predictive_v1.0',
      nextAnalysis: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }

    return NextResponse.json(enhancedPredictions)
  } catch (error) {
    console.error('Error generating predictions:', error)

    // Fallback basique en cas d'erreur
    const fallbackPredictions = {
      equipmentId: 'unknown',
      timestamp: new Date().toISOString(),
      failureProbability: 25,
      timeframe: '30 jours',
      issues: ['Analyse de base uniquement'],
      recommendations: ['Surveillance standard'],
      impact: 'Faible',
      confidence: 60,
      costAvoidance: '€200-€800',
      dataSource: 'Fallback_Analysis',
      model: 'Basic_v1.0'
    }

    return NextResponse.json(fallbackPredictions)
  }
}