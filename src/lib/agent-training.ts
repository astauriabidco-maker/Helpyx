import ZAI from 'z-ai-web-dev-sdk';
import { AIDiagnosticService, DiagnosticResult } from './ai-diagnostic';

export interface TrainingContext {
  agentId: string;
  currentTicket: any;
  agentSkills: AgentSkill[];
  performanceHistory: PerformanceMetric[];
  currentAction: string;
}

export interface AgentSkill {
  id: string;
  name: string;
  category: 'hardware' | 'software' | 'network' | 'security' | 'communication';
  level: number; // 1-10
  lastUsed: Date;
  trainingNeeded: boolean;
}

export interface PerformanceMetric {
  id: string;
  ticketId: string;
  action: string;
  success: boolean;
  timeSpent: number;
  quality: number; // 1-5
  timestamp: Date;
  feedback?: string;
}

export interface RealTimeSuggestion {
  id: string;
  type: 'best_practice' | 'warning' | 'tip' | 'training' | 'improvement';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  actionItems: string[];
  context: string;
  timing: 'immediate' | 'before_action' | 'after_action';
  category: string;
  estimatedTime?: number;
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // en minutes
  prerequisites: string[];
  learningObjectives: string[];
  interactiveElements: InteractiveElement[];
}

export interface InteractiveElement {
  type: 'quiz' | 'simulation' | 'scenario' | 'video';
  content: any;
  expectedOutcome: string;
}

export interface SkillGapAnalysis {
  agentId: string;
  currentSkills: AgentSkill[];
  requiredSkills: AgentSkill[];
  gaps: SkillGap[];
  recommendations: TrainingRecommendation[];
  priorityMatrix: PriorityMatrix;
}

export interface SkillGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  urgency: number; // 1-10
}

export interface TrainingRecommendation {
  id: string;
  type: 'formal' | 'on_the_job' | 'self_paced' | 'mentorship';
  title: string;
  description: string;
  duration: number;
  priority: 'low' | 'medium' | 'high';
  resources: string[];
  expectedOutcome: string;
}

export interface PriorityMatrix {
  urgent_important: string[];
  important_not_urgent: string[];
  urgent_not_important: string[];
  neither_urgent_nor_important: string[];
}

export class AgentTrainingService {
  private static zai: ZAI | null = null;

  // Initialiser le service ZAI
  private static async initializeZAI(): Promise<ZAI> {
    if (!this.zai) {
      this.zai = await ZAI.create();
    }
    return this.zai;
  }

  // Obtenir des suggestions en temps réel pendant le traitement d'un ticket
  static async getRealTimeSuggestions(context: TrainingContext): Promise<RealTimeSuggestion[]> {
    try {
      const zai = await this.initializeZAI();

      // Analyser le contexte actuel
      const suggestions = await Promise.all([
        this.getBestPracticeSuggestions(context, zai),
        this.getWarningSuggestions(context, zai),
        this.getTrainingSuggestions(context, zai),
        this.getImprovementSuggestions(context, zai)
      ]);

      // Aplatir et filtrer les suggestions
      const allSuggestions = suggestions.flat();

      // Prioriser et limiter les suggestions
      return this.prioritizeSuggestions(allSuggestions).slice(0, 5);

    } catch (error) {
      console.error('Error getting real-time suggestions:', error);
      return [];
    }
  }

  // Suggestions de meilleures pratiques
  private static async getBestPracticeSuggestions(context: TrainingContext, zai: ZAI): Promise<RealTimeSuggestion[]> {
    const prompt = `
En tant que mentor expert en support technique, analyse cette situation et suggère les meilleures pratiques :

Agent : ${context.agentId}
Action en cours : ${context.currentAction}
Ticket : ${context.currentTicket.description || 'Non spécifié'}
Type de problème : ${context.currentTicket.type_panne || 'Non spécifié'}

Compétences actuelles de l'agent :
${context.agentSkills.map(skill => `- ${skill.name}: Niveau ${skill.level}/10`).join('\n')}

Génère 1-2 suggestions de meilleures pratiques spécifiques à cette situation.
Chaque suggestion doit inclure :
- Un titre clair
- Un message concis et actionnable
- Les actions spécifiques à entreprendre
- Le contexte d'application
- Le moment optimal (immédiat/avant action/après action)

Réponds au format JSON avec un tableau d'objets.
`;

    try {
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Tu es un mentor technique expérimenté avec 20 ans d\'expérience en support. Tes conseils doivent être pratiques, sécurisés et immédiatement applicables.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) return [];

      const suggestionsData = JSON.parse(response);

      return (Array.isArray(suggestionsData) ? suggestionsData : []).map((suggestion, index) => ({
        id: `bp_${Date.now()}_${index}`,
        type: 'best_practice' as const,
        priority: suggestion.priority || 'medium',
        title: suggestion.title || 'Meilleure pratique',
        message: suggestion.message || '',
        actionItems: Array.isArray(suggestion.actionItems) ? suggestion.actionItems : [],
        context: suggestion.context || 'Support technique',
        timing: ['immediate', 'before_action', 'after_action'].includes(suggestion.timing)
          ? suggestion.timing
          : 'immediate',
        category: suggestion.category || 'general',
        estimatedTime: suggestion.estimatedTime
      }));

    } catch (error) {
      console.error('Error getting best practice suggestions:', error);
      return [];
    }
  }

  // Suggestions d'avertissement
  private static async getWarningSuggestions(context: TrainingContext, zai: ZAI): Promise<RealTimeSuggestion[]> {
    const prompt = `
En tant qu'expert en sécurité et prévention des risques, identifie les avertissements importants pour cette situation :

Situation actuelle :
- Agent : ${context.agentId}
- Action : ${context.currentAction}
- Problème : ${context.currentTicket.description}
- Équipement : ${context.currentTicket.equipement_type || 'Non spécifié'}

Identifie 1-2 avertissements critiques concernant :
- Risques de sécurité
- Erreurs potentielles
- Points de vigilance
- Actions à éviter absolument

Format JSON avec titre, message, actions recommandées et niveau d'urgence.
`;

    try {
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en sécurité informatique et prévention des risques. Tes avertissements doivent être clairs et précis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 800
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) return [];

      const warningsData = JSON.parse(response);

      return (Array.isArray(warningsData) ? warningsData : []).map((warning, index) => ({
        id: `warning_${Date.now()}_${index}`,
        type: 'warning' as const,
        priority: warning.priority || 'high',
        title: warning.title || 'Avertissement important',
        message: warning.message || '',
        actionItems: Array.isArray(warning.actionItems) ? warning.actionItems : [],
        context: warning.context || 'Sécurité',
        timing: 'immediate',
        category: warning.category || 'security',
        estimatedTime: warning.estimatedTime
      }));

    } catch (error) {
      console.error('Error getting warning suggestions:', error);
      return [];
    }
  }

  // Suggestions de formation
  private static async getTrainingSuggestions(context: TrainingContext, zai: ZAI): Promise<RealTimeSuggestion[]> {
    const prompt = `
En tant que formateur technique, identifie les opportunités d'apprentissage pour cet agent dans cette situation :

Agent ID : ${context.agentId}
Niveau actuel des compétences :
${context.agentSkills.map(skill => `- ${skill.name}: ${skill.level}/10 ${skill.trainingNeeded ? '(formation requise)' : ''}`).join('\n')}

Situation actuelle :
- Action : ${context.currentAction}
- Type de problème : ${context.currentTicket.type_panne}
- Complexité : ${this.assessComplexity(context.currentTicket)}

Identifie 1-2 suggestions de formation pertinentes qui pourraient aider l'agent :
- Compétences à développer
- Concepts à approfondir
- Techniques à apprendre
- Ressources recommandées

Format JSON avec titre, message, actions et durée estimée.
`;

    try {
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Tu es un formateur technique expert. Tes suggestions doivent être pertinentes et adaptées au niveau de l\'agent.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 1000
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) return [];

      const trainingData = JSON.parse(response);

      return (Array.isArray(trainingData) ? trainingData : []).map((training, index) => ({
        id: `training_${Date.now()}_${index}`,
        type: 'training' as const,
        priority: training.priority || 'medium',
        title: training.title || 'Formation recommandée',
        message: training.message || '',
        actionItems: Array.isArray(training.actionItems) ? training.actionItems : [],
        context: training.context || 'Développement des compétences',
        timing: 'after_action',
        category: training.category || 'learning',
        estimatedTime: training.estimatedTime || 30
      }));

    } catch (error) {
      console.error('Error getting training suggestions:', error);
      return [];
    }
  }

  // Suggestions d'amélioration
  private static async getImprovementSuggestions(context: TrainingContext, zai: ZAI): Promise<RealTimeSuggestion[]> {
    const prompt = `
En tant que coach de performance, analyse cette situation et suggère des améliorations basées sur l'historique de l'agent :

Performance récente :
${context.performanceHistory.slice(-5).map(metric =>
      `- ${metric.action}: ${metric.success ? 'Succès' : 'Échec'} (Qualité: ${metric.quality}/5, Temps: ${metric.timeSpent}min)`
    ).join('\n')}

Situation actuelle :
- Action : ${context.currentAction}
- Type de problème : ${context.currentTicket.type_panne}

Identifie 1-2 suggestions d'amélioration personnalisées basées sur :
- Les patterns de performance
- Les domaines à améliorer
- Les optimisations possibles
- Les bonnes pratiques spécifiques

Format JSON avec titre, message et actions concrètes.
`;

    try {
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Tu es un coach de performance expert. Tes suggestions doivent être personnalisées et orientées résultats.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) return [];

      const improvementData = JSON.parse(response);

      return (Array.isArray(improvementData) ? improvementData : []).map((improvement, index) => ({
        id: `improvement_${Date.now()}_${index}`,
        type: 'improvement' as const,
        priority: improvement.priority || 'low',
        title: improvement.title || 'Suggestion d\'amélioration',
        message: improvement.message || '',
        actionItems: Array.isArray(improvement.actionItems) ? improvement.actionItems : [],
        context: improvement.context || 'Performance',
        timing: 'after_action',
        category: improvement.category || 'optimization',
        estimatedTime: improvement.estimatedTime
      }));

    } catch (error) {
      console.error('Error getting improvement suggestions:', error);
      return [];
    }
  }

  // Analyser les écarts de compétences
  static async analyzeSkillGaps(agentId: string): Promise<SkillGapAnalysis> {
    try {
      const zai = await this.initializeZAI();

      // Récupérer les compétences actuelles et requises
      const currentSkills = await this.getAgentCurrentSkills(agentId);
      const requiredSkills = await this.getRequiredSkillsForRole(agentId);

      // Analyser les écarts avec l'IA
      const gaps = await this.identifySkillGaps(currentSkills, requiredSkills, zai);

      // Générer des recommandations
      const recommendations = await this.generateTrainingRecommendations(gaps, zai);

      // Créer la matrice de priorité
      const priorityMatrix = this.createPriorityMatrix(gaps);

      return {
        agentId,
        currentSkills,
        requiredSkills,
        gaps,
        recommendations,
        priorityMatrix
      };

    } catch (error) {
      console.error('Error analyzing skill gaps:', error);
      throw new Error('Skill gap analysis failed');
    }
  }

  // Générer un module de formation personnalisé
  static async generatePersonalizedTraining(
    agentId: string,
    skillGaps: SkillGap[]
  ): Promise<TrainingModule[]> {
    try {
      const zai = await this.initializeZAI();

      const modules: TrainingModule[] = [];

      for (const gap of skillGaps.filter(g => g.gap > 2)) {
        const trainingModule = await this.createTrainingModuleForSkill(gap, zai);
        modules.push(trainingModule);
      }

      return modules;

    } catch (error) {
      console.error('Error generating personalized training:', error);
      return [];
    }
  }

  // Évaluer la performance après formation
  static async evaluateTrainingEffectiveness(
    agentId: string,
    trainingModuleId: string,
    beforeMetrics: PerformanceMetric[],
    afterMetrics: PerformanceMetric[]
  ): Promise<{
    improvement: number;
    skillLevelIncrease: number;
    recommendations: string[];
  }> {
    try {
      const zai = await this.initializeZAI();

      const prompt = `
Évalue l'efficacité de la formation pour cet agent :

Agent : ${agentId}
Formation : ${trainingModuleId}

Métriques avant formation :
${beforeMetrics.map(m => `- ${m.action}: Qualité ${m.quality}/5, Succès ${m.success ? 'Oui' : 'Non'}`).join('\n')}

Métriques après formation :
${afterMetrics.map(m => `- ${m.action}: Qualité ${m.quality}/5, Succès ${m.success ? 'Oui' : 'Non'}`).join('\n')}

Analyse :
1. Pourcentage d'amélioration globale
2. Augmentation du niveau de compétence
3. Recommandations pour continuer le développement

Réponds au format JSON avec ces trois éléments.
`;

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en évaluation de formation. Ton analyse doit être objective et basée sur les données.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 600
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI');
      }

      const evaluation = JSON.parse(response);

      return {
        improvement: evaluation.improvement || 0,
        skillLevelIncrease: evaluation.skillLevelIncrease || 0,
        recommendations: Array.isArray(evaluation.recommendations) ? evaluation.recommendations : []
      };

    } catch (error) {
      console.error('Error evaluating training effectiveness:', error);
      return {
        improvement: 0,
        skillLevelIncrease: 0,
        recommendations: []
      };
    }
  }

  // Méthodes utilitaires privées
  private static prioritizeSuggestions(suggestions: RealTimeSuggestion[]): RealTimeSuggestion[] {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };

    return suggestions.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Prioriser les suggestions immédiates
      if (a.timing === 'immediate' && b.timing !== 'immediate') return -1;
      if (b.timing === 'immediate' && a.timing !== 'immediate') return 1;

      return 0;
    });
  }

  private static assessComplexity(ticket: any): string {
    // Logique simple pour évaluer la complexité
    if (ticket.priorite === 'CRITIQUE') return 'Élevée';
    if (ticket.type_panne === 'HARDWARE') return 'Moyenne à Élevée';
    if (ticket.messages_erreur && ticket.messages_erreur.length > 0) return 'Moyenne';
    return 'Faible';
  }

  private static async getAgentCurrentSkills(agentId: string): Promise<AgentSkill[]> {
    // Simulation - en réalité, viendrait de la base de données
    return [
      {
        id: 'skill_1',
        name: 'Diagnostic Hardware',
        category: 'hardware',
        level: 6,
        lastUsed: new Date(),
        trainingNeeded: false
      },
      {
        id: 'skill_2',
        name: 'Résolution Software',
        category: 'software',
        level: 4,
        lastUsed: new Date(),
        trainingNeeded: true
      }
    ];
  }

  private static async getRequiredSkillsForRole(agentId: string): Promise<AgentSkill[]> {
    // Simulation - compétences requises pour le rôle d'agent
    return [
      {
        id: 'req_1',
        name: 'Diagnostic Hardware',
        category: 'hardware',
        level: 7,
        lastUsed: new Date(),
        trainingNeeded: false
      },
      {
        id: 'req_2',
        name: 'Résolution Software',
        category: 'software',
        level: 6,
        lastUsed: new Date(),
        trainingNeeded: false
      },
      {
        id: 'req_3',
        name: 'Communication Client',
        category: 'communication',
        level: 8,
        lastUsed: new Date(),
        trainingNeeded: false
      }
    ];
  }

  private static async identifySkillGaps(
    currentSkills: AgentSkill[],
    requiredSkills: AgentSkill[],
    zai: ZAI
  ): Promise<SkillGap[]> {
    const gaps: SkillGap[] = [];

    for (const required of requiredSkills) {
      const current = currentSkills.find(s => s.name === required.name);
      const currentLevel = current?.level || 0;

      if (currentLevel < required.level) {
        gaps.push({
          skill: required.name,
          currentLevel,
          requiredLevel: required.level,
          gap: required.level - currentLevel,
          impact: this.assessImpact(required.name, required.level - currentLevel),
          urgency: this.calculateUrgency(required.name, currentLevel, required.level)
        });
      }
    }

    return gaps;
  }

  private static assessImpact(skillName: string, gap: number): 'low' | 'medium' | 'high' | 'critical' {
    if (skillName.includes('Sécurité') || skillName.includes('Critical')) return 'critical';
    if (gap > 3) return 'high';
    if (gap > 1) return 'medium';
    return 'low';
  }

  private static calculateUrgency(skillName: string, current: number, required: number): number {
    const baseUrgency = (required - current) * 2;
    const skillMultiplier = skillName.includes('Sécurité') ? 1.5 : 1;
    return Math.min(10, Math.round(baseUrgency * skillMultiplier));
  }

  private static async generateTrainingRecommendations(
    gaps: SkillGap[],
    zai: ZAI
  ): Promise<TrainingRecommendation[]> {
    // Logique de génération de recommandations
    return gaps.map(gap => ({
      id: `rec_${gap.skill.replace(/\s+/g, '_')}`,
      type: gap.gap > 3 ? 'formal' : 'on_the_job',
      title: `Formation : ${gap.skill}`,
      description: `Développer les compétences en ${gap.skill} du niveau ${gap.currentLevel} au ${gap.requiredLevel}`,
      duration: gap.gap * 10, // 10 minutes par point de compétence
      priority: gap.impact === 'critical' ? 'high' : gap.impact === 'high' ? 'medium' : 'low',
      resources: [`Documentation ${gap.skill}`, 'Exercices pratiques', 'Mentorat'],
      expectedOutcome: `Atteindre le niveau ${gap.requiredLevel} en ${gap.skill}`
    }));
  }

  private static createPriorityMatrix(gaps: SkillGap[]): PriorityMatrix {
    return {
      urgent_important: gaps.filter(g => g.urgency >= 8 && g.impact === 'critical').map(g => g.skill),
      important_not_urgent: gaps.filter(g => g.urgency < 8 && g.impact === 'high').map(g => g.skill),
      urgent_not_important: gaps.filter(g => g.urgency >= 8 && g.impact === 'medium').map(g => g.skill),
      neither_urgent_nor_important: gaps.filter(g => g.urgency < 8 && g.impact === 'low').map(g => g.skill)
    };
  }

  private static async createTrainingModuleForSkill(skillGap: SkillGap, zai: ZAI): Promise<TrainingModule> {
    const prompt = `
Crée un module de formation pour combler l'écart de compétence suivant :

Compétence : ${skillGap.skill}
Niveau actuel : ${skillGap.currentLevel}/10
Niveau requis : ${skillGap.requiredLevel}/10
Écart : ${skillGap.gap} points
Impact : ${skillGap.impact}

Génère un module de formation avec :
- Titre attractif
- Description claire
- Contenu structuré (théorie + pratique)
- Objectifs d'apprentissage
- Durée estimée
- Éléments interactifs

Réponds au format JSON.
`;

    try {
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Tu es un concepteur pédagogique expert. Tes modules doivent être engageants et efficaces.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 1500
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI');
      }

      const moduleData = JSON.parse(response);

      return {
        id: `module_${skillGap.skill.replace(/\s+/g, '_')}_${Date.now()}`,
        title: moduleData.title || `Formation ${skillGap.skill}`,
        description: moduleData.description || '',
        content: moduleData.content || '',
        category: skillGap.skill,
        difficulty: skillGap.requiredLevel > 7 ? 'advanced' : skillGap.requiredLevel > 4 ? 'intermediate' : 'beginner',
        duration: moduleData.duration || skillGap.gap * 15,
        prerequisites: moduleData.prerequisites || [],
        learningObjectives: Array.isArray(moduleData.learningObjectives) ? moduleData.learningObjectives : [],
        interactiveElements: Array.isArray(moduleData.interactiveElements) ? moduleData.interactiveElements : []
      };

    } catch (error) {
      console.error('Error creating training module:', error);
      throw error;
    }
  }
}