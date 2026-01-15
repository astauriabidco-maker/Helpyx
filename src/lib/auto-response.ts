import ZAI from 'z-ai-web-dev-sdk';

export interface ResponseTemplate {
  id: string;
  title: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  language: 'fr' | 'en';
  template: string;
  variables: TemplateVariable[];
  tone: 'formal' | 'friendly' | 'technical' | 'empathetic';
  context: string[];
  successRate: number;
  usageCount: number;
  lastUpdated: Date;
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'list';
  required: boolean;
  description: string;
  defaultValue?: string;
  options?: string[];
}

export interface GeneratedResponse {
  id: string;
  ticketId: string;
  content: string;
  tone: string;
  confidence: number; // 0-100
  templateUsed?: string;
  variables: Record<string, any>;
  personalizationLevel: number; // 0-100
  estimatedReadTime: number; // en secondes
  language: string;
  suggestions: ResponseSuggestion[];
}

export interface ResponseSuggestion {
  type: 'improvement' | 'alternative' | 'additional_info';
  message: string;
  priority: 'low' | 'medium' | 'high';
  autoApply: boolean;
}

export interface PersonalizationData {
  customerId: string;
  customerHistory: CustomerInteraction[];
  customerPreferences: CustomerPreferences;
  ticketContext: TicketContext;
  agentProfile: AgentProfile;
}

export interface CustomerInteraction {
  id: string;
  type: 'ticket' | 'call' | 'email' | 'chat';
  date: Date;
  subject: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  resolutionTime: number;
  satisfaction?: number;
}

export interface CustomerPreferences {
  language: string;
  communicationStyle: 'formal' | 'casual' | 'technical';
  preferredContact: 'email' | 'phone' | 'chat';
  timezone: string;
  technicalLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface TicketContext {
  id: string;
  category: string;
  priority: string;
  type: string;
  description: string;
  symptoms: string[];
  urgency: string;
  impact: string;
  previousAttempts: number;
}

export interface AgentProfile {
  id: string;
  name: string;
  expertise: string[];
  communicationStyle: string;
  averageResponseTime: number;
  customerSatisfactionScore: number;
}

export interface ResponseQualityMetrics {
  clarity: number; // 0-100
  empathy: number; // 0-100
  technicalAccuracy: number; // 0-100
  completeness: number; // 0-100
  appropriateness: number; // 0-100
  overallScore: number; // 0-100
}

export class AutoResponseService {
  private static zai: ZAI | null = null;
  private static templates: ResponseTemplate[] = [];

  // Initialiser le service ZAI et les templates
  private static async initializeZAI(): Promise<ZAI> {
    if (!this.zai) {
      this.zai = await ZAI.create();
      await this.loadDefaultTemplates();
    }
    return this.zai;
  }

  // Charger les templates par défaut
  private static async loadDefaultTemplates(): Promise<void> {
    this.templates = [
      {
        id: 'acknowledgment',
        title: 'Accusé de réception',
        category: 'acknowledgment',
        priority: 'high',
        language: 'fr',
        template: `Bonjour {{customerName}},

Nous avons bien reçu votre demande concernant {{subject}}. Votre ticket {{ticketId}} a été enregistré et nous vous en remercions.

Notre équipe va analyser votre demande et vous reviendra dans un délai de {{responseTime}}.

Si vous avez des informations supplémentaires à nous communiquer, n'hésitez pas à répondre à cet email.

Cordialement,
{{agentName}}`,
        variables: [
          { name: 'customerName', type: 'text', required: true, description: 'Nom du client' },
          { name: 'subject', type: 'text', required: true, description: 'Sujet du ticket' },
          { name: 'ticketId', type: 'text', required: true, description: 'ID du ticket' },
          { name: 'responseTime', type: 'text', required: true, description: 'Délai de réponse' },
          { name: 'agentName', type: 'text', required: true, description: 'Nom de l\'agent' }
        ],
        tone: 'friendly',
        context: ['new_ticket', 'acknowledgment'],
        successRate: 95,
        usageCount: 1250,
        lastUpdated: new Date()
      },
      {
        id: 'diagnosis_in_progress',
        title: 'Diagnostic en cours',
        category: 'progress',
        priority: 'medium',
        language: 'fr',
        template: `Bonjour {{customerName},

Concernant votre ticket {{ticketId}} sur {{subject}}, nous effectuons actuellement un diagnostic approfondi.

{{diagnosticDetails}}

Nous vous tiendrons informé de nos progrès dans les {{updateFrequency}}.

Merci de votre patience,
{{agentName}}`,
        variables: [
          { name: 'customerName', type: 'text', required: true, description: 'Nom du client' },
          { name: 'ticketId', type: 'text', required: true, description: 'ID du ticket' },
          { name: 'subject', type: 'text', required: true, description: 'Sujet du ticket' },
          { name: 'diagnosticDetails', type: 'text', required: true, description: 'Détails du diagnostic' },
          { name: 'updateFrequency', type: 'text', required: true, description: 'Fréquence des mises à jour' },
          { name: 'agentName', type: 'text', required: true, description: 'Nom de l\'agent' }
        ],
        tone: 'professional',
        context: ['diagnosis', 'investigation'],
        successRate: 88,
        usageCount: 850,
        lastUpdated: new Date()
      },
      {
        id: 'solution_proposed',
        title: 'Solution proposée',
        category: 'solution',
        priority: 'high',
        language: 'fr',
        template: `Bonjour {{customerName},

Après analyse de votre ticket {{ticketId}}, nous avons identifié une solution pour résoudre {{problemDescription}}.

**Solution proposée :**
{{solutionSteps}}

**Temps estimé :** {{estimatedTime}}
**Niveau de difficulté :** {{difficulty}}

{{additionalInstructions}}

Veuillez nous confirmer si cette solution vous convient ou si vous rencontrez des difficultés pour la mettre en œuvre.

Nous restons à votre disposition,
{{agentName}}`,
        variables: [
          { name: 'customerName', type: 'text', required: true, description: 'Nom du client' },
          { name: 'ticketId', type: 'text', required: true, description: 'ID du ticket' },
          { name: 'problemDescription', type: 'text', required: true, description: 'Description du problème' },
          { name: 'solutionSteps', type: 'text', required: true, description: 'Étapes de la solution' },
          { name: 'estimatedTime', type: 'text', required: true, description: 'Temps estimé' },
          { name: 'difficulty', type: 'text', required: true, description: 'Difficulté' },
          { name: 'additionalInstructions', type: 'text', required: false, description: 'Instructions supplémentaires' },
          { name: 'agentName', type: 'text', required: true, description: 'Nom de l\'agent' }
        ],
        tone: 'technical',
        context: ['solution', 'resolution'],
        successRate: 92,
        usageCount: 2100,
        lastUpdated: new Date()
      },
      {
        id: 'escalation_notice',
        title: 'Notification d\'escalade',
        category: 'escalation',
        priority: 'urgent',
        language: 'fr',
        template: `Bonjour {{customerName},

Concernant votre ticket {{ticketId}} concernant {{subject}}, nous souhaitons vous informer que votre demande a été escaladée à notre équipe d'experts spécialisés.

**Raison de l'escalade :**
{{escalationReason}}

**Prochaines étapes :**
{{nextSteps}}

Un expert spécialisé vous contactera dans les {{expertResponseTime}} pour prendre en charge votre dossier.

Nous vous remercions de votre compréhension,
{{agentName}}`,
        variables: [
          { name: 'customerName', type: 'text', required: true, description: 'Nom du client' },
          { name: 'ticketId', type: 'text', required: true, description: 'ID du ticket' },
          { name: 'subject', type: 'text', required: true, description: 'Sujet du ticket' },
          { name: 'escalationReason', type: 'text', required: true, description: 'Raison de l\'escalade' },
          { name: 'nextSteps', type: 'text', required: true, description: 'Prochaines étapes' },
          { name: 'expertResponseTime', type: 'text', required: true, description: 'Délai de réponse expert' },
          { name: 'agentName', type: 'text', required: true, description: 'Nom de l\'agent' }
        ],
        tone: 'formal',
        context: ['escalation', 'expert_intervention'],
        successRate: 89,
        usageCount: 320,
        lastUpdated: new Date()
      }
    ];
  }

  // Générer une réponse automatique
  static async generateResponse(
    ticketData: any,
    personalizationData: PersonalizationData,
    responseType: 'acknowledgment' | 'progress' | 'solution' | 'escalation' | 'custom'
  ): Promise<GeneratedResponse> {
    try {
      const zai = await this.initializeZAI();

      // Sélectionner le template approprié
      const template = await this.selectBestTemplate(ticketData, responseType, personalizationData);
      
      // Personnaliser le template
      const personalizedContent = await this.personalizeTemplate(
        template, 
        ticketData, 
        personalizationData, 
        zai
      );

      // Améliorer avec l'IA si nécessaire
      const enhancedContent = await this.enhanceResponseWithAI(
        personalizedContent,
        ticketData,
        personalizationData,
        zai
      );

      // Générer des suggestions
      const suggestions = await this.generateResponseSuggestions(
        enhancedContent,
        ticketData,
        personalizationData,
        zai
      );

      // Calculer les métriques de qualité
      const qualityMetrics = await this.calculateResponseQuality(
        enhancedContent,
        ticketData,
        personalizationData
      );

      return {
        id: `response_${Date.now()}`,
        ticketId: ticketData.id,
        content: enhancedContent.content,
        tone: enhancedContent.tone,
        confidence: enhancedContent.confidence,
        templateUsed: template?.id,
        variables: enhancedContent.variables,
        personalizationLevel: enhancedContent.personalizationLevel,
        estimatedReadTime: this.calculateReadTime(enhancedContent.content),
        language: personalizationData.customerPreferences.language,
        suggestions
      };

    } catch (error) {
      console.error('Error generating auto response:', error);
      throw new Error('Auto response generation failed');
    }
  }

  // Sélectionner le meilleur template
  private static async selectBestTemplate(
    ticketData: any,
    responseType: string,
    personalizationData: PersonalizationData
  ): Promise<ResponseTemplate | null> {
    // Filtrer les templates par catégorie
    const candidateTemplates = this.templates.filter(template => {
      if (responseType !== 'custom') {
        return template.category === responseType;
      }
      return true;
    });

    if (candidateTemplates.length === 0) {
      return null;
    }

    // Scorer les templates selon le contexte
    const scoredTemplates = candidateTemplates.map(template => {
      let score = 0;

      // Score basé sur le taux de succès
      score += template.successRate * 0.3;

      // Score basé sur la pertinence du contexte
      if (ticketData.type_panne && template.context.includes(ticketData.type_panne.toLowerCase())) {
        score += 20;
      }

      // Score basé sur le ton approprié
      if (template.tone === this.getOptimalTone(personalizationData)) {
        score += 15;
      }

      // Score basé sur la langue
      if (template.language === personalizationData.customerPreferences.language) {
        score += 10;
      }

      return { template, score };
    });

    // Retourner le template avec le score le plus élevé
    const best = scoredTemplates.reduce((prev, current) => 
      current.score > prev.score ? current : prev
    );

    return best.template;
  }

  // Personnaliser le template
  private static async personalizeTemplate(
    template: ResponseTemplate | null,
    ticketData: any,
    personalizationData: PersonalizationData,
    zai: ZAI
  ): Promise<{
    content: string;
    variables: Record<string, any>;
    tone: string;
    confidence: number;
    personalizationLevel: number;
  }> {
    if (!template) {
      // Générer une réponse personnalisée sans template
      return await this.generatePersonalizedResponseFromScratch(
        ticketData,
        personalizationData,
        zai
      );
    }

    let content = template.template;
    const variables: Record<string, any> = {};

    // Remplacer les variables
    for (const variable of template.variables) {
      const value = await this.getVariableValue(
        variable,
        ticketData,
        personalizationData,
        zai
      );
      
      variables[variable.name] = value;
      content = content.replace(new RegExp(`{{${variable.name}}}`, 'g'), value);
    }

    // Adapter le ton si nécessaire
    const adaptedContent = await this.adaptTone(
      content,
      template.tone,
      personalizationData.customerPreferences.communicationStyle,
      zai
    );

    return {
      content: adaptedContent.content,
      variables,
      tone: adaptedContent.tone,
      confidence: 85,
      personalizationLevel: this.calculatePersonalizationLevel(variables, personalizationData)
    };
  }

  // Améliorer la réponse avec l'IA
  private static async enhanceResponseWithAI(
    response: {
      content: string;
      variables: Record<string, any>;
      tone: string;
      confidence: number;
      personalizationLevel: number;
    },
    ticketData: any,
    personalizationData: PersonalizationData,
    zai: ZAI
  ): Promise<typeof response> {
    const prompt = `
Améliore cette réponse générée pour la rendre plus naturelle et efficace :

Réponse actuelle :
"${response.content}"

Contexte :
- Client : ${personalizationData.customerId}
- Historique : ${personalizationData.customerHistory.length} interactions précédentes
- Style de communication préféré : ${personalizationData.customerPreferences.communicationStyle}
- Niveau technique : ${personalizationData.customerPreferences.technicalLevel}
- Ticket : ${ticketData.description}

Améliore la réponse en :
1. Rendant le ton plus naturel et approprié
2. Ajoutant des détails pertinents basés sur le contexte
3. Améliorant la clarté et la précision
4. Maintenant la structure et les informations clés

Retourne uniquement la réponse améliorée, sans explications.
`;

    try {
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en communication client. Améliore les réponses pour les rendre plus naturelles, empathiques et efficaces.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      const enhancedContent = completion.choices[0]?.message?.content;
      
      if (enhancedContent && enhancedContent.trim().length > response.content.length * 0.8) {
        return {
          ...response,
          content: enhancedContent.trim(),
          confidence: Math.min(95, response.confidence + 10),
          personalizationLevel: Math.min(100, response.personalizationLevel + 5)
        };
      }

    } catch (error) {
      console.error('Error enhancing response with AI:', error);
    }

    return response;
  }

  // Générer des suggestions de réponse
  private static async generateResponseSuggestions(
    content: string,
    ticketData: any,
    personalizationData: PersonalizationData,
    zai: ZAI
  ): Promise<ResponseSuggestion[]> {
    const prompt = `
Analyse cette réponse client et suggère 2-3 améliorations :

Réponse :
"${content}"

Contexte :
- Type de problème : ${ticketData.type_panne}
- Priorité : ${ticketData.priorite}
- Client : ${personalizationData.customerId}

Génère des suggestions pour :
1. Améliorer la clarté
2. Ajouter des informations pertinentes
3. Adapter le ton si nécessaire

Format JSON avec tableau d'objets ayant : type, message, priority, autoApply.
`;

    try {
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en communication client. Tes suggestions doivent être constructives et applicables.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 600
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) return [];

      const suggestionsData = JSON.parse(response);
      
      return (Array.isArray(suggestionsData) ? suggestionsData : []).map((suggestion, index) => ({
        type: ['improvement', 'alternative', 'additional_info'].includes(suggestion.type) 
          ? suggestion.type 
          : 'improvement',
        message: suggestion.message || '',
        priority: ['low', 'medium', 'high'].includes(suggestion.priority) 
          ? suggestion.priority 
          : 'medium',
        autoApply: suggestion.autoApply || false
      }));

    } catch (error) {
      console.error('Error generating response suggestions:', error);
      return [];
    }
  }

  // Calculer les métriques de qualité
  private static async calculateResponseQuality(
    content: string,
    ticketData: any,
    personalizationData: PersonalizationData
  ): Promise<ResponseQualityMetrics> {
    // Calculs simplifiés - en réalité, utiliseraient l'IA pour une analyse plus poussée
    const clarity = this.calculateClarity(content);
    const empathy = this.calculateEmpathy(content, personalizationData);
    const technicalAccuracy = this.calculateTechnicalAccuracy(content, ticketData);
    const completeness = this.calculateCompleteness(content, ticketData);
    const appropriateness = this.calculateAppropriateness(content, personalizationData);

    const overallScore = Math.round((clarity + empathy + technicalAccuracy + completeness + appropriateness) / 5);

    return {
      clarity,
      empathy,
      technicalAccuracy,
      completeness,
      appropriateness,
      overallScore
    };
  }

  // Méthodes utilitaires
  private static getOptimalTone(personalizationData: PersonalizationData): string {
    const style = personalizationData.customerPreferences.communicationStyle;
    switch (style) {
      case 'formal': return 'formal';
      case 'casual': return 'friendly';
      case 'technical': return 'technical';
      default: return 'friendly';
    }
  }

  private static async getVariableValue(
    variable: TemplateVariable,
    ticketData: any,
    personalizationData: PersonalizationData,
    zai: ZAI
  ): Promise<string> {
    // Logique pour obtenir les valeurs des variables
    switch (variable.name) {
      case 'customerName':
        return personalizationData.customerId; // Simplifié
      case 'ticketId':
        return ticketData.id || 'N/A';
      case 'subject':
        return ticketData.titre || ticketData.description?.substring(0, 50) || 'Support request';
      case 'agentName':
        return personalizationData.agentProfile.name;
      case 'responseTime':
        return ticketData.priorite === 'CRITIQUE' ? '1 heure' : '24 heures';
      case 'diagnosticDetails':
        return 'Nos techniciens analysent actuellement les symptômes que vous avez rapportés.';
      case 'updateFrequency':
        return 'prochaines heures';
      case 'problemDescription':
        return ticketData.description || 'votre demande';
      case 'solutionSteps':
        return '1. Analyser le problème\n2. Appliquer la solution\n3. Vérifier le résultat';
      case 'estimatedTime':
        return '15-30 minutes';
      case 'difficulty':
        return 'facile';
      case 'escalationReason':
        return 'Ce problème requiert une expertise spécialisée pour une résolution optimale.';
      case 'nextSteps':
        return '1. Analyse par un expert\n2. Solution personnalisée\n3. Suivi jusqu\'à résolution';
      case 'expertResponseTime':
        return '2 heures';
      default:
        return variable.defaultValue || `[${variable.name}]`;
    }
  }

  private static async generatePersonalizedResponseFromScratch(
    ticketData: any,
    personalizationData: PersonalizationData,
    zai: ZAI
  ): Promise<{
    content: string;
    variables: Record<string, any>;
    tone: string;
    confidence: number;
    personalizationLevel: number;
  }> {
    const prompt = `
Génère une réponse personnalisée pour ce ticket de support :

Ticket : ${ticketData.description}
Type : ${ticketData.type_panne}
Priorité : ${ticketData.priorite}
Client : ${personalizationData.customerId}
Style préféré : ${personalizationData.customerPreferences.communicationStyle}
Niveau technique : ${personalizationData.customerPreferences.technicalLevel}

La réponse doit être :
- Professionnelle et empathique
- Claire et concise
- Adaptée au niveau technique du client
- Inclure les prochaines étapes

Génère uniquement la réponse, sans explications.
`;

    try {
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en support client. Génère des réponses personnalisées et efficaces.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 800
      });

      const content = completion.choices[0]?.message?.content || '';
      
      return {
        content: content.trim(),
        variables: {},
        tone: personalizationData.customerPreferences.communicationStyle,
        confidence: 75,
        personalizationLevel: 80
      };

    } catch (error) {
      console.error('Error generating personalized response from scratch:', error);
      return {
        content: 'Nous avons bien reçu votre demande et nous la traitons actuellement. Nous vous reviendrons rapidement.',
        variables: {},
        tone: 'friendly',
        confidence: 50,
        personalizationLevel: 50
      };
    }
  }

  private static async adaptTone(
    content: string,
    currentTone: string,
    preferredStyle: string,
    zai: ZAI
  ): Promise<{ content: string; tone: string }> {
    if (currentTone === preferredStyle) {
      return { content, tone: currentTone };
    }

    const prompt = `
Adapte le ton de cette réponse pour qu'elle soit ${preferredStyle} :

Réponse actuelle (ton : ${currentTone}) :
"${content}"

Style souhaité : ${preferredStyle}

Maintiens le contenu et les informations clés, mais adapte uniquement le ton et le style de communication.

Retourne uniquement la réponse adaptée.
`;

    try {
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en adaptation de ton de communication. Adapte le style sans changer le fond.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 800
      });

      const adaptedContent = completion.choices[0]?.message?.content;
      
      if (adaptedContent && adaptedContent.trim().length > 0) {
        return { content: adaptedContent.trim(), tone: preferredStyle };
      }

    } catch (error) {
      console.error('Error adapting tone:', error);
    }

    return { content, tone: currentTone };
  }

  private static calculatePersonalizationLevel(
    variables: Record<string, any>,
    personalizationData: PersonalizationData
  ): number {
    let score = 0;
    const totalVariables = Object.keys(variables).length;

    if (totalVariables === 0) return 0;

    // Score basé sur la pertinence des variables
    for (const [key, value] of Object.entries(variables)) {
      if (key.includes('customer') && value !== personalizationData.customerId) score += 20;
      if (key.includes('agent') && value !== personalizationData.agentProfile.name) score += 15;
      if (key.includes('ticket') && value && value !== 'N/A') score += 10;
    }

    return Math.min(100, Math.round((score / totalVariables) * 2));
  }

  private static calculateReadTime(content: string): number {
    // Temps de lecture moyen : 200 mots par minute
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil((words / wordsPerMinute) * 60); // en secondes
  }

  private static calculateClarity(content: string): number {
    // Simplifié : basé sur la longueur des phrases et la complexité
    const sentences = content.split(/[.!?]+/).length;
    const words = content.split(/\s+/).length;
    const avgWordsPerSentence = words / sentences;

    if (avgWordsPerSentence < 15) return 90;
    if (avgWordsPerSentence < 20) return 80;
    if (avgWordsPerSentence < 25) return 70;
    return 60;
  }

  private static calculateEmpathy(content: string, personalizationData: PersonalizationData): number {
    // Simplifié : recherche de mots empathiques
    const empatheticWords = ['comprendre', 'désolé', 'réellement', 'sincèrement', 'plaisir', 'merci'];
    const empatheticCount = empatheticWords.filter(word => 
      content.toLowerCase().includes(word)
    ).length;

    return Math.min(100, empatheticCount * 20);
  }

  private static calculateTechnicalAccuracy(content: string, ticketData: any): number {
    // Simplifié : basé sur la pertinence technique
    if (ticketData.type_panne && content.toLowerCase().includes(ticketData.type_panne.toLowerCase())) {
      return 85;
    }
    return 70;
  }

  private static calculateCompleteness(content: string, ticketData: any): number {
    // Simplifié : basé sur la présence d'informations clés
    let score = 0;
    
    if (content.includes('ticket') || content.includes('demande')) score += 25;
    if (content.includes('prochaine') || content.includes('suite')) score += 25;
    if (content.includes('contact') || content.includes('disponible')) score += 25;
    if (content.includes('merci') || content.includes('cordialement')) score += 25;

    return score;
  }

  private static calculateAppropriateness(content: string, personalizationData: PersonalizationData): number {
    // Simplifié : basé sur le style de communication
    const preferredStyle = personalizationData.customerPreferences.communicationStyle;
    
    if (preferredStyle === 'formal' && content.includes('Cordialement')) return 90;
    if (preferredStyle === 'casual' && !content.includes('Cordialement')) return 85;
    if (preferredStyle === 'technical' && content.includes('technique')) return 88;
    
    return 75;
  }

  // API publique pour la gestion des templates
  static async addTemplate(template: Omit<ResponseTemplate, 'id' | 'successRate' | 'usageCount' | 'lastUpdated'>): Promise<ResponseTemplate> {
    const newTemplate: ResponseTemplate = {
      ...template,
      id: `template_${Date.now()}`,
      successRate: 0,
      usageCount: 0,
      lastUpdated: new Date()
    };

    this.templates.push(newTemplate);
    return newTemplate;
  }

  static async updateTemplateUsage(templateId: string, success: boolean): Promise<void> {
    const template = this.templates.find(t => t.id === templateId);
    if (template) {
      template.usageCount++;
      if (success) {
        template.successRate = ((template.successRate * (template.usageCount - 1)) + 100) / template.usageCount;
      } else {
        template.successRate = ((template.successRate * (template.usageCount - 1)) + 0) / template.usageCount;
      }
      template.lastUpdated = new Date();
    }
  }

  static getTemplates(): ResponseTemplate[] {
    return this.templates;
  }

  static getTemplateById(id: string): ResponseTemplate | undefined {
    return this.templates.find(t => t.id === id);
  }
}