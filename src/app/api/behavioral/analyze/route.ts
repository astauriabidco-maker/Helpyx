import { NextRequest, NextResponse } from 'next/server';
import { BehavioralDetector, BehavioralIndicators } from '@/lib/behavioral-detection';
import { BehavioralAdaptationEngine } from '@/lib/behavioral-adaptation';

export async function POST(request: NextRequest) {
  try {
    const { userId, indicators, messages } = await request.json();

    // Validation des données
    if (!userId || !indicators) {
      return NextResponse.json(
        { error: 'userId and indicators are required' },
        { status: 400 }
      );
    }

    // Initialisation des moteurs
    const detector = BehavioralDetector.getInstance();
    const adaptationEngine = BehavioralAdaptationEngine.getInstance();

    // Analyse comportementale
    const frustrationAnalysis = await detector.detectFrustration(userId, indicators);
    const urgencyAnalysis = await detector.detectUrgency(userId, indicators);
    
    let learningStyleAnalysis = null;
    if (messages && messages.length > 0) {
      learningStyleAnalysis = await detector.detectLearningStyle(userId, messages);
    }

    // Génération des adaptations
    const adaptations = await adaptationEngine.analyzeAndAdapt(userId, indicators);

    // Mise à jour du profil comportemental
    await detector.updateBehavioralProfile(userId, indicators);

    // Calcul du score de confiance global
    const globalConfidence = (
      frustrationAnalysis.confidence + 
      urgencyAnalysis.confidence + 
      (learningStyleAnalysis?.confidence || 0)
    ) / (learningStyleAnalysis ? 3 : 2);

    const response = {
      success: true,
      userId,
      timestamp: new Date().toISOString(),
      analyses: {
        frustration: frustrationAnalysis,
        urgency: urgencyAnalysis,
        learningStyle: learningStyleAnalysis
      },
      adaptations,
      globalConfidence: Math.round(globalConfidence * 100),
      recommendations: generateRecommendations(frustrationAnalysis, urgencyAnalysis, learningStyleAnalysis)
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Behavioral analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error during behavioral analysis' },
      { status: 500 }
    );
  }
}

function generateRecommendations(frustrationAnalysis: any, urgencyAnalysis: any, learningStyleAnalysis: any): string[] {
  const recommendations = [];

  // Recommandations basées sur la frustration
  if (frustrationAnalysis.isFrustrated) {
    if (frustrationAnalysis.confidence > 0.8) {
      recommendations.push('Escalade immédiate vers un expert senior recommandée');
      recommendations.push('Proposer un appel téléphonique pour résolution rapide');
    } else {
      recommendations.push('Simplifier le langage et fournir des instructions étape par étape');
      recommendations.push('Utiliser des aides visuelles pour clarifier le processus');
    }
  }

  // Recommandations basées sur l'urgence
  if (urgencyAnalysis.urgencyLevel === 'critical') {
    recommendations.push('Prioriser absolument ce cas - intervention immédiate requise');
  } else if (urgencyAnalysis.urgencyLevel === 'high') {
    recommendations.push('Accélérer le traitement et sauter les étapes non essentielles');
  }

  // Recommandations basées sur le style d'apprentissage
  if (learningStyleAnalysis && learningStyleAnalysis.confidence > 0.6) {
    switch (learningStyleAnalysis.style) {
      case 'visual':
        recommendations.push('Privilégier les captures d\'écran et les schémas explicatifs');
        break;
      case 'textual':
        recommendations.push('Fournir de la documentation détaillée et des instructions écrites');
        break;
      case 'auditory':
        recommendations.push('Proposer une explication verbale via appel ou audio');
        break;
      case 'kinesthetic':
        recommendations.push('Guider l\'utilisateur à travers des actions pratiques et interactives');
        break;
    }
  }

  return recommendations;
}