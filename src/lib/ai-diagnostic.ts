import ZAI from 'z-ai-web-dev-sdk';

export interface SymptomAnalysis {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'hardware' | 'software' | 'network' | 'security' | 'other';
  confidence: number; // 0-100
  keywords: string[];
}

export interface SolutionSuggestion {
  id: string;
  title: string;
  description: string;
  steps: string[];
  estimatedTime: number; // en minutes
  difficulty: 'easy' | 'medium' | 'hard';
  tools: string[];
  probability: number; // 0-100
  category: string;
  prerequisites: string[];
  warnings: string[];
}

export interface DiagnosticResult {
  ticketId: string;
  symptoms: SymptomAnalysis[];
  suggestedSolutions: SolutionSuggestion[];
  similarCases: SimilarCase[];
  predictedIssues: PredictedIssue[];
  confidence: number;
  processingTime: number;
  recommendations: string[];
}

export interface SimilarCase {
  id: string;
  ticketId: string;
  title: string;
  description: string;
  solution: string;
  resolutionTime: number;
  successRate: number;
  relevanceScore: number;
}

export interface PredictedIssue {
  id: string;
  description: string;
  probability: number;
  timeframe: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  preventionSteps: string[];
}

export interface TrainingSuggestion {
  id: string;
  type: 'best_practice' | 'skill_gap' | 'improvement';
  title: string;
  description: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime: number;
  category: string;
}

export class AIDiagnosticService {
  private static zai: ZAI | null = null;

  // Initialiser le service ZAI
  private static async initializeZAI(): Promise<ZAI> {
    if (!this.zai) {
      this.zai = await ZAI.create();
    }
    return this.zai;
  }

  // Analyser les symptômes et proposer des solutions
  static async analyzeTicket(ticketData: any): Promise<DiagnosticResult> {
    try {
      const startTime = Date.now();
      const zai = await this.initializeZAI();

      // Extraire et analyser les symptômes
      const symptoms = await this.extractSymptoms(ticketData, zai);
      
      // Générer des suggestions de solutions
      const solutions = await this.generateSolutions(symptoms, ticketData, zai);
      
      // Trouver des cas similaires
      const similarCases = await this.findSimilarCases(ticketData, zai);
      
      // Prédire les problèmes futurs
      const predictedIssues = await this.predictFutureIssues(ticketData, zai);
      
      // Générer des recommandations
      const recommendations = await this.generateRecommendations(
        symptoms, 
        solutions, 
        similarCases, 
        zai
      );

      const processingTime = Date.now() - startTime;

      return {
        ticketId: ticketData.id,
        symptoms,
        suggestedSolutions: solutions,
        similarCases,
        predictedIssues,
        confidence: this.calculateOverallConfidence(symptoms, solutions),
        processingTime,
        recommendations
      };

    } catch (error) {
      console.error('Error in AI diagnostic analysis:', error);
      throw new Error('Diagnostic analysis failed');
    }
  }

  // Extraire les symptômes de la description du ticket
  private static async extractSymptoms(ticketData: any, zai: ZAI): Promise<SymptomAnalysis[]> {
    const prompt = `
En tant qu'expert technique en support informatique, analyse la description suivante d'un problème et extrais les symptômes clés :

Description du problème :
"${ticketData.description}"
${ticketData.titre ? `Titre : ${ticketData.titre}` : ''}
${ticketData.type_panne ? `Type de panne : ${ticketData.type_panne}` : ''}
${ticketData.equipement_type ? `Équipement : ${ticketData.equipement_type}` : ''}
${ticketData.marque ? `Marque : ${ticketData.marque}` : ''}
${ticketData.modele ? `Modèle : ${ticketData.modele}` : ''}
${ticketData.messages_erreur ? `Messages d'erreur : ${ticketData.messages_erreur}` : ''}
${ticketData.symptomes ? `Symptômes déclarés : ${ticketData.symptomes}` : ''}

Identifie les symptômes techniques et classe-les par catégorie. Pour chaque symptôme, fournis :
- Une description claire
- La sévérité (low/medium/high/critical)
- La catégorie (hardware/software/network/security/other)
- Un score de confiance (0-100)
- Les mots-clés associés

Réponds au format JSON avec un tableau d'objets ayant ces propriétés.
`;

    try {
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert technique en diagnostic informatique avec 15 ans d\'expérience. Tu dois analyser les problèmes de manière structurée et précise.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI');
      }

      // Parser la réponse JSON
      const symptomsData = JSON.parse(response);
      
      // S'assurer que c'est un tableau
      if (!Array.isArray(symptomsData)) {
        throw new Error('Invalid symptoms data format');
      }

      // Ajouter des IDs uniques
      return symptomsData.map((symptom, index) => ({
        id: `symptom_${Date.now()}_${index}`,
        ...symptom
      }));

    } catch (error) {
      console.error('Error extracting symptoms:', error);
      // Retourner des symptômes par défaut en cas d'erreur
      return this.getDefaultSymptoms(ticketData);
    }
  }

  // Générer des suggestions de solutions
  private static async generateSolutions(
    symptoms: SymptomAnalysis[], 
    ticketData: any, 
    zai: ZAI
  ): Promise<SolutionSuggestion[]> {
    const symptomsText = symptoms.map(s => s.description).join(', ');
    
    const prompt = `
En tant qu'expert technique, propose 3 solutions les plus probables pour résoudre ce problème basé sur les symptômes identifiés :

Symptômes : ${symptomsText}
Type de problème : ${ticketData.type_panne || 'Non spécifié'}
Équipement : ${ticketData.equipement_type || 'Non spécifié'}
Marque/Modèle : ${ticketData.marque || 'N/A'} ${ticketData.modele || ''}

Pour chaque solution, fournis :
- Un titre clair
- Une description détaillée
- Les étapes précises à suivre (format liste)
- Le temps estimé (en minutes)
- Le niveau de difficulté (easy/medium/hard)
- Les outils nécessaires
- La probabilité de succès (0-100)
- Les prérequis
- Les avertissements importants

Réponds au format JSON avec un tableau de 3 solutions maximum.
`;

    try {
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert technique spécialisé dans la résolution de problèmes informatiques. Tes solutions doivent être pratiques, sécurisées et efficaces.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 2000
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI');
      }

      const solutionsData = JSON.parse(response);
      
      if (!Array.isArray(solutionsData)) {
        throw new Error('Invalid solutions data format');
      }

      // Ajouter des IDs uniques et valider les données
      return solutionsData.slice(0, 3).map((solution, index) => ({
        id: `solution_${Date.now()}_${index}`,
        title: solution.title || `Solution ${index + 1}`,
        description: solution.description || '',
        steps: Array.isArray(solution.steps) ? solution.steps : [],
        estimatedTime: solution.estimatedTime || 30,
        difficulty: ['easy', 'medium', 'hard'].includes(solution.difficulty) ? solution.difficulty : 'medium',
        tools: Array.isArray(solution.tools) ? solution.tools : [],
        probability: Math.min(100, Math.max(0, solution.probability || 70)),
        category: solution.category || 'general',
        prerequisites: Array.isArray(solution.prerequisites) ? solution.prerequisites : [],
        warnings: Array.isArray(solution.warnings) ? solution.warnings : []
      }));

    } catch (error) {
      console.error('Error generating solutions:', error);
      return this.getDefaultSolutions(symptoms, ticketData);
    }
  }

  // Trouver des cas similaires
  private static async findSimilarCases(ticketData: any, zai: ZAI): Promise<SimilarCase[]> {
    const prompt = `
En te basant sur ce problème de support, identifie 3 cas similaires typiques qui pourraient aider à la résolution :

Problème actuel :
"${ticketData.description}"
Type : ${ticketData.type_panne || 'Non spécifié'}
Équipement : ${ticketData.equipement_type || 'Non spécifié'}

Pour chaque cas similaire, fournis :
- Un titre descriptif
- Une brève description
- La solution appliquée
- Le temps de résolution typique (en minutes)
- Le taux de succès (0-100%)
- Le score de pertinence avec le cas actuel (0-100%)

Réponds au format JSON avec un tableau d'objets.
`;

    try {
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Tu es une base de connaissances experte avec des milliers de cas de support résolus. Identifie les cas les plus pertinents.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI');
      }

      const casesData = JSON.parse(response);
      
      if (!Array.isArray(casesData)) {
        throw new Error('Invalid cases data format');
      }

      return casesData.slice(0, 3).map((caseItem, index) => ({
        id: `case_${Date.now()}_${index}`,
        ticketId: `TK-SIMILAR-${Date.now()}-${index}`,
        title: caseItem.title || `Cas similaire ${index + 1}`,
        description: caseItem.description || '',
        solution: caseItem.solution || '',
        resolutionTime: caseItem.resolutionTime || 45,
        successRate: Math.min(100, Math.max(0, caseItem.successRate || 80)),
        relevanceScore: Math.min(100, Math.max(0, caseItem.relevanceScore || 75))
      }));

    } catch (error) {
      console.error('Error finding similar cases:', error);
      return [];
    }
  }

  // Prédire les problèmes futurs
  private static async predictFutureIssues(ticketData: any, zai: ZAI): Promise<PredictedIssue[]> {
    const prompt = `
En tant qu'expert en maintenance prédictive, analyse ce problème et identifie les problèmes futurs potentiels basés sur les symptômes actuels :

Problème actuel :
"${ticketData.description}"
Équipement : ${ticketData.equipement_type || 'Non spécifié'}
Marque/Modèle : ${ticketData.marque || 'N/A'} ${ticketData.modele || ''}
Âge de l'équipement : ${ticketData.date_achat ? this.calculateAge(ticketData.date_achat) : 'Non spécifié'}

Identifie 2-3 problèmes futurs potentiels avec :
- Description du problème prédit
- Probabilité d'occurrence (0-100%)
- Temporale probable (ex: "dans 1-2 semaines", "dans 3-6 mois")
- Impact potentiel (low/medium/high/critical)
- Étapes de prévention recommandées

Réponds au format JSON avec un tableau d'objets.
`;

    try {
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en maintenance prédictive et fiabilité des systèmes. Tes prédictions doivent être réalistes et basées sur des patterns techniques.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1200
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI');
      }

      const predictionsData = JSON.parse(response);
      
      if (!Array.isArray(predictionsData)) {
        throw new Error('Invalid predictions data format');
      }

      return predictionsData.slice(0, 3).map((prediction, index) => ({
        id: `prediction_${Date.now()}_${index}`,
        description: prediction.description || '',
        probability: Math.min(100, Math.max(0, prediction.probability || 50)),
        timeframe: prediction.timeframe || 'Non spécifié',
        impact: ['low', 'medium', 'high', 'critical'].includes(prediction.impact) ? prediction.impact : 'medium',
        preventionSteps: Array.isArray(prediction.preventionSteps) ? prediction.preventionSteps : []
      }));

    } catch (error) {
      console.error('Error predicting future issues:', error);
      return [];
    }
  }

  // Générer des recommandations
  private static async generateRecommendations(
    symptoms: SymptomAnalysis[],
    solutions: SolutionSuggestion[],
    similarCases: SimilarCase[],
    zai: ZAI
  ): Promise<string[]> {
    const context = `
Symptômes identifiés : ${symptoms.length}
Solutions proposées : ${solutions.length}
Cas similaires trouvés : ${similarCases.length}
`;

    const prompt = `
Basé sur l'analyse complète de ce problème technique, génère 3-5 recommandations concrètes pour l'agent de support :

${context}

Les recommandations doivent inclure :
- Actions immédiates prioritaires
- Points de vigilance particuliers
- Suggestions de communication avec le client
- Actions préventives recommandées

Format : liste de recommandations claires et actionnables.
`;

    try {
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Tu es un mentor technique expérimenté. Tes recommandations doivent être pratiques et sécurisées.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 800
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI');
      }

      // Parser la réponse en liste
      const recommendations = response
        .split('\n')
        .filter(line => line.trim() && (line.includes('-') || line.includes('•') || line.includes('*')))
        .map(line => line.replace(/^[-•*]\s*/, '').trim())
        .filter(line => line.length > 10);

      return recommendations.slice(0, 5);

    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [
        'Analyser attentivement tous les symptômes avant d\'appliquer une solution',
        'Documenter chaque étape de la résolution',
        'Communiquer clairement avec le client sur les actions entreprises'
      ];
    }
  }

  // Calculer la confiance globale
  private static calculateOverallConfidence(
    symptoms: SymptomAnalysis[], 
    solutions: SolutionSuggestion[]
  ): number {
    if (symptoms.length === 0 || solutions.length === 0) {
      return 30; // Confiance faible si pas de données
    }

    const avgSymptomConfidence = symptoms.reduce((sum, s) => sum + s.confidence, 0) / symptoms.length;
    const avgSolutionProbability = solutions.reduce((sum, s) => sum + s.probability, 0) / solutions.length;

    return Math.round((avgSymptomConfidence + avgSolutionProbability) / 2);
  }

  // Calculer l'âge d'un équipement
  private static calculateAge(purchaseDate: string): string {
    const purchase = new Date(purchaseDate);
    const now = new Date();
    const diffMonths = (now.getFullYear() - purchase.getFullYear()) * 12 + (now.getMonth() - purchase.getMonth());
    
    if (diffMonths < 12) {
      return `${diffMonths} mois`;
    } else {
      const years = Math.floor(diffMonths / 12);
      const months = diffMonths % 12;
      return `${years} an${years > 1 ? 's' : ''}${months > 0 ? ` ${months} mois` : ''}`;
    }
  }

  // Symptômes par défaut (fallback)
  private static getDefaultSymptoms(ticketData: any): SymptomAnalysis[] {
    return [
      {
        id: `symptom_default_${Date.now()}`,
        description: ticketData.description || 'Problème non spécifié',
        severity: 'medium',
        category: 'other',
        confidence: 50,
        keywords: ['problème', 'incident']
      }
    ];
  }

  // Solutions par défaut (fallback)
  private static getDefaultSolutions(symptoms: SymptomAnalysis[], ticketData: any): SolutionSuggestion[] {
    return [
      {
        id: `solution_default_${Date.now()}`,
        title: 'Diagnostic standard',
        description: 'Procédure de diagnostic de base',
        steps: [
          'Analyser les symptômes déclarés',
          'Vérifier les connexions de base',
          'Redémarrer l\'équipement',
          'Tester les fonctionnalités principales'
        ],
        estimatedTime: 30,
        difficulty: 'easy',
        tools: [],
        probability: 60,
        category: 'general',
        prerequisites: [],
        warnings: []
      }
    ];
  }
}