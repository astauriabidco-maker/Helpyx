import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { userId, timeframe = '7d', includeRecommendations = true } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Récupérer le profil comportemental historique
    const behavioralProfile = await db.behavioralProfile.findUnique({
      where: { userId },
      include: {
        adaptations: {
          orderBy: { timestamp: 'desc' },
          take: 50
        },
        sessions: {
          orderBy: { startTime: 'desc' },
          take: 20
        }
      }
    });

    if (!behavioralProfile) {
      return NextResponse.json(
        { error: 'Behavioral profile not found' },
        { status: 404 }
      );
    }

    // Analyser les tendances avec l'IA
    const zai = await ZAI.create();
    
    const analysisPrompt = `En tant qu'expert en analyse comportementale, analyse les données suivantes et génère des prédictions :

Profil Utilisateur:
- Style actuel: ${behavioralProfile.userStyle}
- État émotionnel: ${behavioralProfile.emotionalState}
- Niveau d'urgence moyen: ${behavioralProfile.urgencyLevel}
- Compétence technique: ${behavioralProfile.technicalProficiency}
- Score de sentiment moyen: ${behavioralProfile.sentimentScore}
- Fréquence de messages: ${behavioralProfile.messageFrequency}

Historique récent des adaptations:
${behavioralProfile.adaptations.slice(0, 10).map(a => 
  `- ${a.ruleName}: ${a.actionType} (efficacité: ${a.effectiveness})`
).join('\n')}

Sessions récentes:
${behavioralProfile.sessions.slice(0, 5).map(s => 
  `- Session ${s.sessionId}: ${s.messageCount} messages, score: ${s.sessionScore}`
).join('\n')}

Génère une prédiction JSON structurée avec:
1. risqueFrustration (0-100)
2. styleEvolution (style probable et confiance)
3. recommandationsProactives (liste d'actions)
4. prochainesAdaptations (adaptations suggérées avec priorité)
5. kpisPrevus (valeurs prédites pour satisfaction, résolution, etc.)
6. insights (observations clés)

Réponds UNIQUEMENT avec un JSON valide, sans texte supplémentaire.`;

    const aiResponse = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert en analyse comportementale et en IA prédictive pour le support client.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    let predictions;
    try {
      predictions = JSON.parse(aiResponse.choices[0]?.message?.content || '{}');
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      predictions = generateFallbackPredictions(behavioralProfile);
    }

    // Enrichir les prédictions avec des données calculées
    const enrichedPredictions = await enrichPredictions(predictions, behavioralProfile, timeframe);

    // Sauvegarder les prédictions
    await savePrediction(userId, enrichedPredictions);

    return NextResponse.json({
      success: true,
      userId,
      timestamp: new Date().toISOString(),
      timeframe,
      predictions: enrichedPredictions,
      confidence: calculatePredictionConfidence(enrichedPredictions, behavioralProfile)
    });

  } catch (error) {
    console.error('Behavioral predictions error:', error);
    return NextResponse.json(
      { error: 'Internal server error during behavioral predictions' },
      { status: 500 }
    );
  }
}

function generateFallbackPredictions(profile: any) {
  return {
    risqueFrustration: profile.sentimentScore < -0.2 ? 65 : 25,
    styleEvolution: {
      style: profile.userStyle,
      confiance: 0.7
    },
    recommandationsProactives: [
      'Surveiller les indicateurs de frustration',
      'Personnaliser les communications selon le style détecté'
    ],
    prochainesAdaptations: [
      {
        type: 'adapt_communication',
        priorite: 2,
        description: 'Adapter le style de communication'
      }
    ],
    kpisPrevus: {
      satisfaction: Math.max(0, 75 + profile.sentimentScore * 20),
      tempsResolution: 180, // secondes
      escalades: profile.sentimentScore < -0.3 ? 0.3 : 0.1
    },
    insights: [
      'Analyse basée sur les données historiques disponibles',
      'Modèle de prédiction simplifié activé'
    ]
  };
}

async function enrichPredictions(predictions: any, profile: any, timeframe: string) {
  // Calculer les tendances basées sur l'historique
  const recentAdaptations = profile.adaptations.slice(0, 10);
  const adaptationTrends = calculateAdaptationTrends(recentAdaptations);
  
  // Analyser les patterns de session
  const sessionPatterns = analyzeSessionPatterns(profile.sessions);
  
  // Prédire les KPIs basés sur les tendances
  const predictedKpis = predictKPIs(profile, adaptationTrends, sessionPatterns);

  return {
    ...predictions,
    tendancesAdaptations: adaptationTrends,
    patternsSessions: sessionPatterns,
    kpisPrevus: predictedKpis,
    timeframe,
    metadata: {
      totalAdaptations: profile.adaptations.length,
      totalSessions: profile.sessions.length,
      lastUpdated: profile.lastUpdated
    }
  };
}

function calculateAdaptationTrends(adaptations: any[]) {
  const trends = {
    effectivenessTrend: 'stable',
    mostUsedRule: '',
    successRate: 0,
    adaptationFrequency: 0
  };

  if (adaptations.length === 0) return trends;

  // Calculer le taux de succès moyen
  const totalEffectiveness = adaptations.reduce((sum, a) => sum + a.effectiveness, 0);
  trends.successRate = totalEffectiveness / adaptations.length;

  // Trouver la règle la plus utilisée
  const ruleCounts = adaptations.reduce((acc, a) => {
    acc[a.ruleName] = (acc[a.ruleName] || 0) + 1;
    return acc;
  }, {});
  
  trends.mostUsedRule = Object.entries(ruleCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || '';

  // Analyser la tendance d'efficacité
  if (adaptations.length >= 3) {
    const recent = adaptations.slice(0, 3).reduce((sum, a) => sum + a.effectiveness, 0) / 3;
    const older = adaptations.slice(3, 6).reduce((sum, a) => sum + a.effectiveness, 0) / 3;
    
    if (recent > older + 0.1) trends.effectivenessTrend = 'improving';
    else if (recent < older - 0.1) trends.effectivenessTrend = 'declining';
  }

  trends.adaptationFrequency = adaptations.length;

  return trends;
}

function analyzeSessionPatterns(sessions: any[]) {
  const patterns = {
    averageSessionScore: 0,
    peakActivityHours: [],
    commonEmotionalStates: [],
    adaptationFrequency: 0
  };

  if (sessions.length === 0) return patterns;

  // Score moyen de session
  const totalScore = sessions.reduce((sum, s) => sum + s.sessionScore, 0);
  patterns.averageSessionScore = totalScore / sessions.length;

  // Fréquence d'adaptation par session
  const totalAdaptations = sessions.reduce((sum, s) => sum + s.adaptationCount, 0);
  patterns.adaptationFrequency = totalAdaptations / sessions.length;

  // États émotionnels les plus communs (à partir des données de profil)
  patterns.commonEmotionalStates = ['neutral', 'satisfied']; // Simplifié

  return patterns;
}

function predictKPIs(profile: any, adaptationTrends: any, sessionPatterns: any) {
  const baseKpis = {
    satisfaction: 75,
    tempsResolution: 180,
    escalades: 0.15,
    engagement: 80
  };

  // Ajuster basé sur le sentiment actuel
  const sentimentAdjustment = profile.sentimentScore * 20;
  baseKpis.satisfaction += sentimentAdjustment;

  // Ajuster basé sur les tendances d'adaptation
  if (adaptationTrends.effectivenessTrend === 'improving') {
    baseKpis.satisfaction += 10;
    baseKpis.tempsResolution -= 30;
    baseKpis.escalades -= 0.05;
  } else if (adaptationTrends.effectivenessTrend === 'declining') {
    baseKpis.satisfaction -= 15;
    baseKpis.tempsResolution += 45;
    baseKpis.escalades += 0.1;
  }

  // Ajuster basé sur les patterns de session
  if (sessionPatterns.averageSessionScore > 0.7) {
    baseKpis.engagement += 15;
    baseKpis.satisfaction += 8;
  }

  // S'assurer que les valeurs restent dans des limites raisonnables
  return {
    satisfaction: Math.max(0, Math.min(100, baseKpis.satisfaction)),
    tempsResolution: Math.max(30, Math.min(600, baseKpis.tempsResolution)),
    escalades: Math.max(0, Math.min(1, baseKpis.escalades)),
    engagement: Math.max(0, Math.min(100, baseKpis.engagement))
  };
}

function calculatePredictionConfidence(predictions: any, profile: any) {
  let confidence = 0.5; // Base confidence

  // Augmenter la confiance avec plus de données
  if (profile.adaptations.length > 10) confidence += 0.2;
  if (profile.sessions.length > 5) confidence += 0.15;
  if (profile.interactionCount > 50) confidence += 0.1;

  // Augmenter la confiance si les tendances sont claires
  if (predictions.tendancesAdaptations?.effectivenessTrend !== 'stable') {
    confidence += 0.05;
  }

  return Math.min(0.95, confidence);
}

async function savePrediction(userId: string, predictions: any) {
  try {
    // Sauvegarder dans une table de prédictions (à créer si nécessaire)
    // Pour l'instant, nous pouvons loguer ou utiliser une table existante
    console.log(`Saving prediction for user ${userId}:`, predictions);
    
    // Optionnel: sauvegarder dans une table de logs ou d'analytics
    // await db.behavioralPrediction.create({
    //   data: {
    //     userId,
    //     predictions,
    //     timestamp: new Date()
    //   }
    // });
  } catch (error) {
    console.error('Failed to save prediction:', error);
  }
}