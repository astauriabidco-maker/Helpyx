import { BehavioralDetector, BehavioralIndicators } from './behavioral-detection';

export interface AdaptationRule {
  id: string;
  name: string;
  trigger: {
    type: 'frustration' | 'urgency' | 'learning_style' | 'technical_level';
    threshold: number;
    conditions: string[];
  };
  action: {
    type: 'escalate' | 'adapt_communication' | 'change_interface' | 'provide_resources';
    parameters: Record<string, any>;
  };
  priority: number;
  enabled: boolean;
}

export interface AdaptationAction {
  type: string;
  message?: string;
  interfaceChanges?: Record<string, any>;
  resourceSuggestions?: string[];
  escalationLevel?: number;
}

export class BehavioralAdaptationEngine {
  private static instance: BehavioralAdaptationEngine;
  private rules: AdaptationRule[] = [];
  private detector: BehavioralDetector;

  constructor() {
    this.detector = BehavioralDetector.getInstance();
    this.initializeDefaultRules();
  }

  static getInstance(): BehavioralAdaptationEngine {
    if (!BehavioralAdaptationEngine.instance) {
      BehavioralAdaptationEngine.instance = new BehavioralAdaptationEngine();
    }
    return BehavioralAdaptationEngine.instance;
  }

  private initializeDefaultRules(): void {
    this.rules = [
      // Règle 1: Détection de frustration élevée
      {
        id: 'frustration_high',
        name: 'High Frustration Detection',
        trigger: {
          type: 'frustration',
          threshold: 0.7,
          conditions: ['message_frequency > 3', 'sentiment_score < -0.3']
        },
        action: {
          type: 'escalate',
          parameters: {
            level: 'senior_agent',
            message: 'Je vois que cette situation est frustrante. Je vais vous mettre en relation immédiatement avec un expert senior.',
            priority: 'high'
          }
        },
        priority: 1,
        enabled: true
      },

      // Règle 2: Urgence critique
      {
        id: 'urgency_critical',
        name: 'Critical Urgency Detection',
        trigger: {
          type: 'urgency',
          threshold: 0.8,
          conditions: ['message_frequency > 5', 'rage_clicks > 0']
        },
        action: {
          type: 'escalate',
          parameters: {
            level: 'immediate_support',
            message: 'Je comprends l\'urgence de votre situation. Un agent spécialiste vous prend en charge maintenant.',
            skipQueue: true
          }
        },
        priority: 1,
        enabled: true
      },

      // Règle 3: Adaptation style visuel
      {
        id: 'visual_learner',
        name: 'Visual Learning Style Adaptation',
        trigger: {
          type: 'learning_style',
          threshold: 0.6,
          conditions: ['style === "visual"', 'confidence > 0.5']
        },
        action: {
          type: 'adapt_communication',
          parameters: {
            style: 'visual',
            message: 'Je vais vous fournir des captures d\'écran et des schémas pour mieux vous expliquer.',
            interfaceChanges: {
              showVisualAids: true,
              enableScreenshots: true,
              preferVideoTutorials: true
            }
          }
        },
        priority: 2,
        enabled: true
      },

      // Règle 4: Adaptation style textuel
      {
        id: 'textual_learner',
        name: 'Textual Learning Style Adaptation',
        trigger: {
          type: 'learning_style',
          threshold: 0.6,
          conditions: ['style === "textual"', 'confidence > 0.5']
        },
        action: {
          type: 'adapt_communication',
          parameters: {
            style: 'textual',
            message: 'Je vais vous fournir des explications détaillées étape par étape.',
            interfaceChanges: {
              showDetailedInstructions: true,
              enableTextDocumentation: true,
              preferWrittenGuides: true
            }
          }
        },
        priority: 2,
        enabled: true
      },

      // Règle 5: Adaptation niveau technique
      {
        id: 'technical_beginner',
        name: 'Beginner Technical Level Adaptation',
        trigger: {
          type: 'technical_level',
          threshold: 0.7,
          conditions: ['proficiency === "beginner"', 'confusion_indicators > 2']
        },
        action: {
          type: 'adapt_communication',
          parameters: {
            style: 'simplified',
            message: 'Je vais vous expliquer cela simplement, sans jargon technique.',
            interfaceChanges: {
              simplifyLanguage: true,
              showTooltips: true,
              enableGuidedMode: true,
              hideAdvancedOptions: true
            }
          }
        },
        priority: 3,
        enabled: true
      },

      // Règle 6: Impatience détectée
      {
        id: 'impatience_detected',
        name: 'Impatience Detection',
        trigger: {
          type: 'urgency',
          threshold: 0.5,
          conditions: ['response_time_expectation < 30s', 'multiple_quick_messages']
        },
        action: {
          type: 'adapt_communication',
          parameters: {
            style: 'quick_responses',
            message: 'Je comprends que vous êtes pressé. Je vais vous donner des réponses directes et rapides.',
            interfaceChanges: {
              showQuickReplies: true,
              enableShortcuts: true,
              prioritizeSpeed: true
            }
          }
        },
        priority: 2,
        enabled: true
      }
    ];
  }

  async analyzeAndAdapt(userId: string, indicators: BehavioralIndicators): Promise<AdaptationAction[]> {
    const actions: AdaptationAction[] = [];

    // Détecter la frustration
    const frustrationAnalysis = await this.detector.detectFrustration(userId, indicators);
    if (frustrationAnalysis.isFrustrated) {
      const frustrationActions = this.processFrustrationRules(frustrationAnalysis);
      actions.push(...frustrationActions);
    }

    // Détecter l'urgence
    const urgencyAnalysis = await this.detector.detectUrgency(userId, indicators);
    if (urgencyAnalysis.urgencyLevel !== 'low') {
      const urgencyActions = this.processUrgencyRules(urgencyAnalysis);
      actions.push(...urgencyActions);
    }

    // Détecter le style d'apprentissage (nécessite l'historique des messages)
    // const learningStyleAnalysis = await this.detector.detectLearningStyle(userId, messages);
    // if (learningStyleAnalysis.confidence > 0.6) {
    //   const styleActions = this.processLearningStyleRules(learningStyleAnalysis);
    //   actions.push(...styleActions);
    // }

    // Trier les actions par priorité
    return actions.sort((a, b) => {
      const priorityA = this.getActionPriority(a.type);
      const priorityB = this.getActionPriority(b.type);
      return priorityA - priorityB;
    });
  }

  private processFrustrationRules(analysis: any): AdaptationAction[] {
    const actions: AdaptationAction[] = [];

    if (analysis.confidence > 0.8) {
      actions.push({
        type: 'escalate',
        message: 'Je vois que cette situation est très frustrante. Je vais vous mettre en relation immédiatement avec un expert senior.',
        escalationLevel: 3
      });
    } else if (analysis.confidence > 0.6) {
      actions.push({
        type: 'adapt_communication',
        message: 'Je comprends votre frustration. Simplifions cette étape par étape.',
        interfaceChanges: {
          simplifyInterface: true,
          showQuickSolutions: true,
          enableGuidedMode: true
        }
      });
    }

    return actions;
  }

  private processUrgencyRules(analysis: any): AdaptationAction[] {
    const actions: AdaptationAction[] = [];

    if (analysis.urgencyLevel === 'critical') {
      actions.push({
        type: 'escalate',
        message: 'Je comprends l\'urgence absolue de votre situation. Intervention immédiate en cours.',
        escalationLevel: 4
      });
    } else if (analysis.urgencyLevel === 'high') {
      actions.push({
        type: 'adapt_communication',
        message: 'Je comprends que c\'est urgent. Je vais directement à la solution.',
        interfaceChanges: {
          prioritizeSpeed: true,
          showQuickReplies: true,
          skipExplanations: true
        }
      });
    }

    return actions;
  }

  private processLearningStyleRules(analysis: any): AdaptationAction[] {
    const actions: AdaptationAction[] = [];

    switch (analysis.style) {
      case 'visual':
        actions.push({
          type: 'adapt_communication',
          message: 'Je vais vous fournir des captures d\'écran et des visuels pour mieux vous aider.',
          interfaceChanges: {
            showVisualAids: true,
            enableScreenshots: true,
            preferVideoTutorials: true
          }
        });
        break;

      case 'textual':
        actions.push({
          type: 'adapt_communication',
          message: 'Je vais vous donner des explications détaillées et écrites.',
          interfaceChanges: {
            showDetailedInstructions: true,
            enableTextDocumentation: true,
            preferWrittenGuides: true
          }
        });
        break;

      case 'auditory':
        actions.push({
          type: 'adapt_communication',
          message: 'Souhaitez-vous que je vous appelle pour vous expliquer oralement ?',
          interfaceChanges: {
            offerCallOption: true,
            enableVoiceSupport: true,
            preferAudioExplanations: true
          }
        });
        break;

      case 'kinesthetic':
        actions.push({
          type: 'adapt_communication',
          message: 'Je vais vous guider pas à pas pour que vous puissiez le faire vous-même.',
          interfaceChanges: {
            enableInteractiveGuides: true,
            showHandsOnTutorials: true,
            preferStepByStepActions: true
          }
        });
        break;
    }

    return actions;
  }

  private getActionPriority(actionType: string): number {
    const priorities = {
      'escalate': 1,
      'adapt_communication': 2,
      'change_interface': 3,
      'provide_resources': 4
    };
    return priorities[actionType] || 5;
  }

  // Ajouter une règle personnalisée
  addCustomRule(rule: AdaptationRule): void {
    this.rules.push(rule);
    this.sortRulesByPriority();
  }

  // Activer/Désactiver une règle
  toggleRule(ruleId: string, enabled: boolean): void {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = enabled;
    }
  }

  // Obtenir toutes les règles
  getRules(): AdaptationRule[] {
    return [...this.rules];
  }

  private sortRulesByPriority(): void {
    this.rules.sort((a, b) => a.priority - b.priority);
  }
}

// Export pour utilisation dans les API routes
export const behavioralAdaptationEngine = BehavioralAdaptationEngine.getInstance();