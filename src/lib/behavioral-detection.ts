import { db } from '@/lib/db';

export interface BehavioralIndicators {
  messageFrequency: number;
  responseTime: number;
  sentimentAnalysis: {
    score: number;
    keywords: string[];
    emotionalTone: string;
  };
  linguisticPatterns: {
    exclamationCount: number;
    questionCount: number;
    uppercaseRatio: number;
    technicalTerms: number;
  };
  interactionMetrics: {
    clicksPerMinute: number;
    scrollDepth: number;
    timeOnPage: number;
    rageClicks: number;
  };
}

export class BehavioralDetector {
  private static instance: BehavioralDetector;
  private userSessions: Map<string, BehavioralSession> = new Map();

  static getInstance(): BehavioralDetector {
    if (!BehavioralDetector.instance) {
      BehavioralDetector.instance = new BehavioralDetector();
    }
    return BehavioralDetector.instance;
  }

  // Détection de frustration
  async detectFrustration(userId: string, indicators: BehavioralIndicators): Promise<{
    isFrustrated: boolean;
    confidence: number;
    triggers: string[];
    recommendations: string[];
  }> {
    const triggers: string[] = [];
    let frustrationScore = 0;

    // Analyse de la fréquence des messages
    if (indicators.messageFrequency > 3) { // Plus de 3 messages/min
      frustrationScore += 0.3;
      triggers.push('Message frequency elevated');
    }

    // Analyse du sentiment
    if (indicators.sentimentAnalysis.score < -0.3) {
      frustrationScore += 0.4;
      triggers.push('Negative sentiment detected');
    }

    // Analyse des patterns linguistiques
    if (indicators.linguisticPatterns.exclamationCount > 2) {
      frustrationScore += 0.2;
      triggers.push('High exclamation usage');
    }

    if (indicators.linguisticPatterns.uppercaseRatio > 0.3) {
      frustrationScore += 0.3;
      triggers.push('Excessive capitalization');
    }

    // Analyse des interactions
    if (indicators.interactionMetrics.rageClicks > 0) {
      frustrationScore += 0.5;
      triggers.push('Rage clicking detected');
    }

    const isFrustrated = frustrationScore > 0.6;
    const confidence = Math.min(frustrationScore, 1);

    const recommendations = this.generateFrustrationRecommendations(
      frustrationScore,
      triggers
    );

    return {
      isFrustrated,
      confidence,
      triggers,
      recommendations
    };
  }

  // Détection du style d'apprentissage
  async detectLearningStyle(userId: string, messages: any[]): Promise<{
    style: 'visual' | 'textual' | 'auditory' | 'kinesthetic';
    confidence: number;
    evidence: string[];
  }> {
    const visualKeywords = ['voir', 'image', 'montrez', 'écran', 'couleur', 'graphique'];
    const textualKeywords = ['lire', 'texte', 'explication', 'détail', 'document'];
    const auditoryKeywords = ['entendre', 'expliquer', 'discuter', 'appeler', 'parler'];
    const kinestheticKeywords = ['faire', 'essayer', 'pratique', 'main', 'cliquer'];

    const scores = {
      visual: 0,
      textual: 0,
      auditory: 0,
      kinesthetic: 0
    };

    const evidence = {
      visual: [] as string[],
      textual: [] as string[],
      auditory: [] as string[],
      kinesthetic: [] as string[]
    };

    messages.forEach(message => {
      const text = message.content.toLowerCase();

      visualKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          scores.visual += 1;
          evidence.visual.push(`Keyword "${keyword}" found`);
        }
      });

      textualKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          scores.textual += 1;
          evidence.textual.push(`Keyword "${keyword}" found`);
        }
      });

      auditoryKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          scores.auditory += 1;
          evidence.auditory.push(`Keyword "${keyword}" found`);
        }
      });

      kinestheticKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          scores.kinesthetic += 1;
          evidence.kinesthetic.push(`Keyword "${keyword}" found`);
        }
      });
    });

    const maxScore = Math.max(...Object.values(scores));
    const dominantStyle = Object.keys(scores).find(
      key => scores[key as keyof typeof scores] === maxScore
    ) as 'visual' | 'textual' | 'auditory' | 'kinesthetic';

    const confidence = maxScore / messages.length;

    return {
      style: dominantStyle,
      confidence,
      evidence: evidence[dominantStyle]
    };
  }

  // Détection de l'urgence
  async detectUrgency(userId: string, indicators: BehavioralIndicators): Promise<{
    urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    factors: string[];
  }> {
    const factors: string[] = [];
    let urgencyScore = 0;

    // Facteurs temporels
    if (indicators.messageFrequency > 5) {
      urgencyScore += 0.4;
      factors.push('Very high message frequency');
    } else if (indicators.messageFrequency > 2) {
      urgencyScore += 0.2;
      factors.push('Elevated message frequency');
    }

    // Facteurs de sentiment
    if (indicators.sentimentAnalysis.score < -0.5) {
      urgencyScore += 0.3;
      factors.push('Strong negative sentiment');
    }

    // Facteurs linguistiques
    const urgentKeywords = ['urgent', 'immédiatement', 'vite', 'urgence', 'asap'];
    const messageText = indicators.sentimentAnalysis.keywords.join(' ').toLowerCase();

    urgentKeywords.forEach(keyword => {
      if (messageText.includes(keyword)) {
        urgencyScore += 0.2;
        factors.push(`Urgent keyword "${keyword}" detected`);
      }
    });

    // Facteurs d'interaction
    if (indicators.interactionMetrics.rageClicks > 2) {
      urgencyScore += 0.5;
      factors.push('Multiple rage clicks');
    }

    let urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
    if (urgencyScore >= 0.8) {
      urgencyLevel = 'critical';
    } else if (urgencyScore >= 0.6) {
      urgencyLevel = 'high';
    } else if (urgencyScore >= 0.3) {
      urgencyLevel = 'medium';
    } else {
      urgencyLevel = 'low';
    }

    return {
      urgencyLevel,
      confidence: Math.min(urgencyScore, 1),
      factors
    };
  }

  private generateFrustrationRecommendations(score: number, triggers: string[]): string[] {
    const recommendations: string[] = [];

    if (score >= 0.8) {
      recommendations.push('Escalate to senior agent immediately');
      recommendations.push('Offer callback option');
      recommendations.push('Provide direct solution path');
    } else if (score >= 0.6) {
      recommendations.push('Simplify communication');
      recommendations.push('Provide step-by-step guidance');
      recommendations.push('Offer visual aids');
    } else {
      recommendations.push('Monitor for escalation');
      recommendations.push('Provide additional context');
    }

    return recommendations;
  }

  // Mise à jour du profil comportemental
  async updateBehavioralProfile(userId: string, indicators: BehavioralIndicators): Promise<void> {
    const existingProfile = await db.behavioralProfile.findUnique({
      where: { userId }
    });

    if (existingProfile) {
      await db.behavioralProfile.update({
        where: { userId },
        data: {
          messageFrequency: indicators.messageFrequency,
          sentimentScore: indicators.sentimentAnalysis.score,
          lastUpdated: new Date(),
          interactionCount: { increment: 1 }
        }
      });
    } else {
      await db.behavioralProfile.create({
        data: {
          userId,
          messageFrequency: indicators.messageFrequency,
          sentimentScore: indicators.sentimentAnalysis.score,
          lastUpdated: new Date(),
          interactionCount: 1
        }
      });
    }
  }
}

export class BehavioralSession {
  private userId: string;
  private startTime: Date;
  private messages: any[] = [];
  private interactions: any[] = [];

  constructor(userId: string) {
    this.userId = userId;
    this.startTime = new Date();
  }

  addMessage(message: any): void {
    this.messages.push({
      ...message,
      timestamp: new Date()
    });
  }

  addInteraction(interaction: any): void {
    this.interactions.push({
      ...interaction,
      timestamp: new Date()
    });
  }

  getIndicators(): BehavioralIndicators {
    const sessionDuration = (Date.now() - this.startTime.getTime()) / 1000 / 60; // minutes
    const messageFrequency = this.messages.length / sessionDuration;

    // Analyse de sentiment simplifiée
    const sentimentScore = this.calculateSentimentScore();

    // Patterns linguistiques
    const linguisticPatterns = this.analyzeLinguisticPatterns();

    // Métriques d'interaction
    const interactionMetrics = this.calculateInteractionMetrics();

    return {
      messageFrequency,
      responseTime: this.calculateAverageResponseTime(),
      sentimentAnalysis: {
        score: sentimentScore,
        keywords: this.extractKeywords(),
        emotionalTone: this.getEmotionalTone(sentimentScore)
      },
      linguisticPatterns,
      interactionMetrics
    };
  }

  private calculateSentimentScore(): number {
    // Implémentation simplifiée - utiliserait un vrai NLP en production
    const positiveWords = ['bon', 'excellent', 'merci', 'super', 'parfait'];
    const negativeWords = ['mauvais', 'problème', 'erreur', 'frustré', 'échec'];

    let score = 0;
    this.messages.forEach(message => {
      const text = message.content.toLowerCase();
      positiveWords.forEach(word => {
        if (text.includes(word)) score += 0.1;
      });
      negativeWords.forEach(word => {
        if (text.includes(word)) score -= 0.1;
      });
    });

    return Math.max(-1, Math.min(1, score));
  }

  private analyzeLinguisticPatterns() {
    const allText = this.messages.map(m => m.content).join(' ');

    return {
      exclamationCount: (allText.match(/!/g) || []).length,
      questionCount: (allText.match(/\?/g) || []).length,
      uppercaseRatio: (allText.match(/[A-Z]/g) || []).length / allText.length,
      technicalTerms: this.countTechnicalTerms(allText)
    };
  }

  private calculateInteractionMetrics() {
    return {
      clicksPerMinute: this.interactions.length / ((Date.now() - this.startTime.getTime()) / 1000 / 60),
      scrollDepth: this.calculateScrollDepth(),
      timeOnPage: (Date.now() - this.startTime.getTime()) / 1000,
      rageClicks: this.countRageClicks()
    };
  }

  private calculateAverageResponseTime(): number {
    // Calcul simplifié
    return 30; // secondes
  }

  private extractKeywords(): string[] {
    const allText = this.messages.map(m => m.content).join(' ');
    return allText.split(' ').filter(word => word.length > 3);
  }

  private getEmotionalTone(score: number): string {
    if (score > 0.3) return 'positive';
    if (score < -0.3) return 'negative';
    return 'neutral';
  }

  private countTechnicalTerms(text: string): number {
    const technicalTerms = ['API', 'base de données', 'serveur', 'code', 'développement'];
    return technicalTerms.filter(term =>
      text.toLowerCase().includes(term.toLowerCase())
    ).length;
  }

  private calculateScrollDepth(): number {
    // Simulation - utiliserait de vraies données de tracking
    return 0.7;
  }

  private countRageClicks(): number {
    // Simulation - utiliserait de vraies données de tracking
    return this.interactions.filter(i => i.type === 'rage_click').length;
  }
}