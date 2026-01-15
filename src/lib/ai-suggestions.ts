import ZAI from 'z-ai-web-dev-sdk';

interface TicketAnalysis {
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedResolutionTime: number;
  suggestedSolutions: Solution[];
  relatedEquipment: string[];
  confidence: number;
}

interface Solution {
  title: string;
  description: string;
  steps: string[];
  probability: number;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  relatedArticles: string[];
}

interface SimilarTicket {
  id: string;
  description: string;
  solution: string;
  resolutionTime: number;
  satisfaction: number;
  similarity: number;
}

export class AISuggestionEngine {
  private zai: ZAI;

  constructor() {
    this.zai = null as any;
  }

  async initialize() {
    try {
      this.zai = await ZAI.create();
    } catch (error) {
      console.error('Failed to initialize AI:', error);
    }
  }

  /**
   * Analyse un ticket et suggère des solutions
   */
  async analyzeTicket(ticketDescription: string, equipmentInfo?: any): Promise<TicketAnalysis> {
    if (!this.zai) {
      await this.initialize();
    }

    try {
      const prompt = `
En tant qu'expert technique senior, analyse ce ticket de support et suggère les solutions les plus probables :

DESCRIPTION DU TICKET :
${ticketDescription}

${equipmentInfo ? `
INFORMATIONS ÉQUIPEMENT :
- Type: ${equipmentInfo.type || 'Non spécifié'}
- Marque: ${equipmentInfo.marque || 'Non spécifié'}
- Modèle: ${equipmentInfo.modele || 'Non spécifié'}
- Système: ${equipmentInfo.systeme_exploitation || 'Non spécifié'}
` : ''}

Fournis ta réponse au format JSON exact :
{
  "category": "catégorie principale (hardware/software/réseau/autre)",
  "priority": "low|medium|high|critical",
  "estimatedResolutionTime": nombre_en_minutes,
  "suggestedSolutions": [
    {
      "title": "Titre de la solution",
      "description": "Description brève",
      "steps": ["Étape 1", "Étape 2", "Étape 3"],
      "probability": 0.85,
      "difficulty": "easy|medium|hard",
      "estimatedTime": 15,
      "relatedArticles": ["article-id-1", "article-id-2"]
    }
  ],
  "relatedEquipment": ["PC-123", "Imprimante-HP"],
  "confidence": 0.87
}

Sois précis et réaliste dans tes estimations. Base tes suggestions sur les problèmes courants.
`;

      const completion = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert technique avec 15 ans d\'expérience en support IT. Tu analyses les problèmes et suggères des solutions pratiques avec des estimations réalistes.'
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
      
      if (response) {
        // Nettoyer la réponse JSON
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }

      // Fallback si l'IA ne répond pas
      return this.getFallbackAnalysis(ticketDescription);

    } catch (error) {
      console.error('AI Analysis failed:', error);
      return this.getFallbackAnalysis(ticketDescription);
    }
  }

  /**
   * Trouve des tickets similaires dans l'historique
   */
  async findSimilarTickets(ticketDescription: string, companyId: string): Promise<SimilarTicket[]> {
    // Simulation de recherche dans la base de données
    // En production, ceci serait une vraie requête avec embeddings
    
    const mockSimilarTickets: SimilarTicket[] = [
      {
        id: "TK-001",
        description: "Écran noir sur PC Dell après mise à jour Windows",
        solution: "Redémarrer en mode sans échec, désinstaller la dernière mise à jour vidéo",
        resolutionTime: 25,
        satisfaction: 4.5,
        similarity: 0.89
      },
      {
        id: "TK-045",
        description: "PC portable ne s'allume plus, voyant clignotant",
        solution: "Débrancher batterie, maintenir power button 30s, rebrancher secteur",
        resolutionTime: 15,
        satisfaction: 4.8,
        similarity: 0.76
      },
      {
        id: "TK-123",
        description: "Problème d'affichage, écran reste noir mais ordinateur allumé",
        solution: "Vérifier connexion câble HDMI, tester avec autre moniteur, mettre à jour pilotes",
        resolutionTime: 20,
        satisfaction: 4.2,
        similarity: 0.82
      }
    ];

    // Filtrer par pertinence
    return mockSimilarTickets
      .filter(ticket => ticket.similarity > 0.7)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);
  }

  /**
   * Génère une réponse automatique pour le client
   */
  async generateAutoResponse(ticketDescription: string, analysis: TicketAnalysis): Promise<string> {
    if (!this.zai) {
      await this.initialize();
    }

    try {
      const prompt = `
Génère une réponse empathique et professionnelle pour ce ticket de support :

DESCRIPTION : ${ticketDescription}
ANALYSE IA : ${JSON.stringify(analysis, null, 2)}

La réponse doit :
1. Être empathique et rassurante
2. Expliquer la prochaine étape
3. Donner une estimation de temps réaliste
4. Proposer une solution immédiate si possible
5. Terminer sur une note positive

Sois concis mais complet (max 150 mots).
`;

      const completion = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Tu es un agent de support expérimenté, excellent en communication client.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      });

      return completion.choices[0]?.message?.content || this.getFallbackResponse(analysis);

    } catch (error) {
      console.error('Auto-response generation failed:', error);
      return this.getFallbackResponse(analysis);
    }
  }

  /**
   * Prédit la probabilité de succès d'une solution
   */
  async predictSolutionSuccess(solution: Solution, ticketContext: any): Promise<number> {
    // Simulation d'un modèle de machine learning
    // En production, ceci utiliserait un vrai modèle entraîné
    
    const baseScore = solution.probability;
    const contextFactors = {
      hasSimilarHistory: 0.1,
      isWellDocumented: 0.05,
      isEasyDifficulty: 0.1,
      hasGoodEquipmentInfo: 0.05
    };

    let adjustedScore = baseScore;
    
    if (ticketContext.similarTicketsCount > 0) {
      adjustedScore += contextFactors.hasSimilarHistory;
    }
    
    if (solution.relatedArticles.length > 0) {
      adjustedScore += contextFactors.isWellDocumented;
    }
    
    if (solution.difficulty === 'easy') {
      adjustedScore += contextFactors.isEasyDifficulty;
    }
    
    if (ticketContext.equipmentInfo) {
      adjustedScore += contextFactors.hasGoodEquipmentInfo;
    }

    return Math.min(adjustedScore, 0.95); // Max 95% de confiance
  }

  /**
   * Analyse fallback si l'IA n'est pas disponible
   */
  private getFallbackAnalysis(ticketDescription: string): TicketAnalysis {
    const keywords = ticketDescription.toLowerCase();
    
    let category = 'autre';
    let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    let estimatedTime = 30;

    if (keywords.includes('écran') || keywords.includes('affichage')) {
      category = 'hardware';
      priority = keywords.includes('noir') ? 'high' : 'medium';
      estimatedTime = 25;
    } else if (keywords.includes('connexion') || keywords.includes('réseau')) {
      category = 'réseau';
      priority = 'medium';
      estimatedTime = 20;
    } else if (keywords.includes('mot de passe') || keywords.includes('login')) {
      category = 'software';
      priority = 'low';
      estimatedTime = 10;
    }

    return {
      category,
      priority,
      estimatedResolutionTime: estimatedTime,
      suggestedSolutions: [
        {
          title: "Diagnostic standard",
          description: "Analyse des symptômes et test des solutions communes",
          steps: [
            "Redémarrer l'équipement",
            "Vérifier les connexions",
            "Tester avec une autre configuration"
          ],
          probability: 0.6,
          difficulty: 'easy',
          estimatedTime: 15,
          relatedArticles: []
        }
      ],
      relatedEquipment: [],
      confidence: 0.5
    };
  }

  /**
   * Réponse fallback si l'IA n'est pas disponible
   */
  private getFallbackResponse(analysis: TicketAnalysis): string {
    return `Bonjour ! J'ai bien reçu votre demande et je comprends votre situation.

D'après l'analyse, il s'agit d'un problème ${analysis.category} avec une priorité ${analysis.priority}. 
Le temps de résolution estimé est d'environ ${analysis.estimatedResolutionTime} minutes.

Je vous propose de commencer par la première solution suggérée. Un agent va prendre en charge votre ticket dans les plus brefs délais.

Merci de votre patience !`;
  }
}

export const aiSuggestionEngine = new AISuggestionEngine();