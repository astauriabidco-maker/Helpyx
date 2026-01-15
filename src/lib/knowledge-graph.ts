import { 
  KnowledgeGraph, 
  Entity, 
  Relation, 
  EntityType, 
  RelationType,
  ContextualSearchQuery,
  SearchResult,
  GraphInsight,
  LearningData,
  GraphVisualization,
  GraphNode,
  GraphEdge
} from '@/types/knowledge-graph';

export class KnowledgeGraphEngine {
  private graph: KnowledgeGraph;
  private embeddingCache: Map<string, number[]> = new Map();
  private learningHistory: LearningData[] = [];

  constructor() {
    this.graph = {
      entities: [],
      relationships: [],
      embeddings: new Map(),
      confidence: 0.85,
      lastUpdated: new Date(),
      metadata: {
        totalEntities: 0,
        totalRelations: 0,
        avgConfidence: 0.85,
        learningRate: 0.1
      }
    };
    this.initializeGraph();
  }

  private async initializeGraph(): Promise<void> {
    // Initialiser avec des données de base
    await this.seedInitialData();
  }

  private async seedInitialData(): Promise<void> {
    // Équipements courants
    const equipment = [
      { name: 'Dell Latitude 5420', brand: 'Dell', type: 'Laptop' },
      { name: 'HP LaserJet Pro M404n', brand: 'HP', type: 'Printer' },
      { name: 'Cisco Catalyst 2960', brand: 'Cisco', type: 'Switch' },
      { name: 'APC Smart-UPS 1500', brand: 'APC', type: 'UPS' },
      { name: 'Synology DS220+', brand: 'Synology', type: 'NAS' }
    ];

    // Erreurs communes
    const errors = [
      { name: 'BSOD - Critical Process Died', code: '0x000000EF' },
      { name: 'Blue Screen - IRQL Not Less Or Equal', code: '0x0000000A' },
      { name: 'Printer Offline Error', code: '0x00000057' },
      { name: 'Network Connection Failed', code: '0x800704cf' },
      { name: 'Memory Management Error', code: '0x0000001A' }
    ];

    // Solutions
    const solutions = [
      { name: 'Update graphics drivers', procedure: 'Download latest drivers from manufacturer website' },
      { name: 'Run memory diagnostic', procedure: 'Use Windows Memory Diagnostic tool' },
      { name: 'Reset printer spooler', procedure: 'Restart Print Spooler service in services.msc' },
      { name: 'Reinstall network drivers', procedure: 'Uninstall and reinstall network adapter drivers' },
      { name: 'Check disk space', procedure: 'Run disk cleanup and free up space' }
    ];

    // Créer les entités
    for (const eq of equipment) {
      this.addEntity({
        id: `eq_${Date.now()}_${Math.random()}`,
        type: EntityType.EQUIPMENT,
        name: eq.name,
        description: `${eq.type} manufactured by ${eq.brand}`,
        properties: { brand: eq.brand, type: eq.type },
        confidence: 0.9,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          source: 'manual',
          frequency: 1,
          lastSeen: new Date()
        }
      });
    }

    for (const err of errors) {
      this.addEntity({
        id: `err_${Date.now()}_${Math.random()}`,
        type: EntityType.ERROR,
        name: err.name,
        description: `System error with code ${err.code}`,
        properties: { code: err.code },
        confidence: 0.85,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          source: 'manual',
          frequency: 1,
          lastSeen: new Date()
        }
      });
    }

    for (const sol of solutions) {
      this.addEntity({
        id: `sol_${Date.now()}_${Math.random()}`,
        type: EntityType.SOLUTION,
        name: sol.name,
        description: sol.procedure,
        properties: { procedure: sol.procedure },
        confidence: 0.8,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          source: 'manual',
          frequency: 1,
          lastSeen: new Date()
        }
      });
    }

    // Créer quelques relations initiales
    this.createInitialRelations();
  }

  private createInitialRelations(): void {
    // Relations entre équipements et erreurs
    const dellLaptop = this.graph.entities.find(e => e.name.includes('Dell'));
    const bsodError = this.graph.entities.find(e => e.name.includes('BSOD'));
    const memoryError = this.graph.entities.find(e => e.name.includes('Memory Management'));
    const updateDrivers = this.graph.entities.find(e => e.name.includes('Update graphics'));
    const memoryDiagnostic = this.graph.entities.find(e => e.name.includes('Run memory'));

    if (dellLaptop && bsodError) {
      this.addRelation({
        id: `rel_${Date.now()}_1`,
        sourceId: dellLaptop.id,
        targetId: bsodError.id,
        type: RelationType.HAS_SYMPTOM,
        weight: 0.7,
        confidence: 0.8,
        properties: { frequency: 15 },
        createdAt: new Date(),
        metadata: {
          source: 'auto',
          frequency: 15,
          verified: true
        }
      });
    }

    if (bsodError && updateDrivers) {
      this.addRelation({
        id: `rel_${Date.now()}_2`,
        sourceId: updateDrivers.id,
        targetId: bsodError.id,
        type: RelationType.RESOLVES,
        weight: 0.85,
        confidence: 0.9,
        properties: { successRate: 0.85 },
        createdAt: new Date(),
        metadata: {
          source: 'auto',
          frequency: 12,
          verified: true
        }
      });
    }

    if (memoryError && memoryDiagnostic) {
      this.addRelation({
        id: `rel_${Date.now()}_3`,
        sourceId: memoryDiagnostic.id,
        targetId: memoryError.id,
        type: RelationType.RESOLVES,
        weight: 0.75,
        confidence: 0.85,
        properties: { successRate: 0.75 },
        createdAt: new Date(),
        metadata: {
          source: 'auto',
          frequency: 8,
          verified: true
        }
      });
    }
  }

  // Ajouter une entité au graphe
  addEntity(entity: Entity): void {
    // Vérifier si l'entité existe déjà
    const existing = this.graph.entities.find(e => 
      e.name.toLowerCase() === entity.name.toLowerCase() && 
      e.type === entity.type
    );

    if (existing) {
      // Mettre à jour l'entité existante
      existing.properties = { ...existing.properties, ...entity.properties };
      existing.confidence = Math.min(1, (existing.confidence + entity.confidence) / 2);
      existing.updatedAt = new Date();
      if (existing.metadata) {
        existing.metadata.frequency += 1;
        existing.metadata.lastSeen = new Date();
      }
    } else {
      // Ajouter la nouvelle entité
      this.graph.entities.push(entity);
      this.generateEmbedding(entity);
    }

    this.updateGraphMetadata();
  }

  // Ajouter une relation au graphe
  addRelation(relation: Relation): void {
    // Vérifier si la relation existe déjà
    const existing = this.graph.relationships.find(r => 
      r.sourceId === relation.sourceId && 
      r.targetId === relation.targetId && 
      r.type === relation.type
    );

    if (existing) {
      // Renforcer la relation existante
      existing.weight = Math.min(1, (existing.weight + relation.weight) / 2);
      existing.confidence = Math.min(1, (existing.confidence + relation.confidence) / 2);
      if (existing.metadata) {
        existing.metadata.frequency += 1;
      }
    } else {
      // Ajouter la nouvelle relation
      this.graph.relationships.push(relation);
    }

    this.updateGraphMetadata();
  }

  // Générer des embeddings pour une entité
  private generateEmbedding(entity: Entity): void {
    // Simulation de génération d'embeddings
    const embedding = this.simulateEmbedding(entity.name + ' ' + entity.description);
    this.graph.embeddings.set(entity.id, embedding);
    this.embeddingCache.set(entity.id, embedding);
  }

  private simulateEmbedding(text: string): number[] {
    // Simulation d'un embedding de 128 dimensions
    const embedding: number[] = [];
    const hash = this.hashCode(text);
    
    for (let i = 0; i < 128; i++) {
      embedding.push(Math.sin(hash * (i + 1)) * 0.5 + 0.5);
    }
    
    return embedding;
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }

  // Recherche contextuelle
  async contextualSearch(query: ContextualSearchQuery): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    // Extraire les entités de la requête
    const queryEntities = this.extractEntitiesFromQuery(query.query);
    
    // Rechercher des entités correspondantes
    for (const entity of this.graph.entities) {
      let score = 0;
      
      // Score de base : correspondance du nom
      if (entity.name.toLowerCase().includes(query.query.toLowerCase())) {
        score += 0.5;
      }
      
      // Score sémantique si demandé
      if (query.semantic) {
        const semanticScore = this.calculateSemanticSimilarity(query.query, entity);
        score += semanticScore * 0.3;
      }
      
      // Score contextuel
      if (query.context) {
        const contextScore = this.calculateContextScore(entity, query.context);
        score += contextScore * 0.2;
      }
      
      // Score de confiance
      score *= entity.confidence;
      
      if (score > 0.1) {
        const relatedEntities = this.getRelatedEntities(entity.id);
        results.push({
          entity,
          score,
          relatedEntities
        });
      }
    }
    
    // Trier par score et limiter les résultats
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, query.filters?.maxResults || 20);
  }

  private extractEntitiesFromQuery(query: string): string[] {
    // Extraction simple d'entités (brands, models, etc.)
    const entities: string[] = [];
    const brands = ['Dell', 'HP', 'Cisco', 'APC', 'Synology', 'Microsoft', 'Apple'];
    const errors = ['BSOD', 'error', 'failed', 'crash'];
    
    for (const brand of brands) {
      if (query.toLowerCase().includes(brand.toLowerCase())) {
        entities.push(brand);
      }
    }
    
    for (const error of errors) {
      if (query.toLowerCase().includes(error.toLowerCase())) {
        entities.push(error);
      }
    }
    
    return entities;
  }

  private calculateSemanticSimilarity(query: string, entity: Entity): number {
    const queryEmbedding = this.simulateEmbedding(query);
    const entityEmbedding = this.graph.embeddings.get(entity.id);
    
    if (!entityEmbedding) return 0;
    
    // Calcul de la similarité cosinus
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < queryEmbedding.length; i++) {
      dotProduct += queryEmbedding[i] * entityEmbedding[i];
      normA += queryEmbedding[i] * queryEmbedding[i];
      normB += entityEmbedding[i] * entityEmbedding[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private calculateContextScore(entity: Entity, context: any): number {
    let score = 0;
    
    if (context.brand && entity.properties.brand === context.brand) {
      score += 0.3;
    }
    
    if (context.model && entity.name.includes(context.model)) {
      score += 0.2;
    }
    
    if (context.errorType && entity.type === EntityType.ERROR) {
      score += 0.2;
    }
    
    return score;
  }

  // Obtenir les entités liées
  getRelatedEntities(entityId: string, maxDepth: number = 2): Entity[] {
    const related: Entity[] = [];
    const visited = new Set<string>();
    
    const traverse = (currentId: string, depth: number) => {
      if (depth >= maxDepth || visited.has(currentId)) return;
      
      visited.add(currentId);
      
      // Relations sortantes
      const outgoingRelations = this.graph.relationships.filter(r => r.sourceId === currentId);
      for (const relation of outgoingRelations) {
        const targetEntity = this.graph.entities.find(e => e.id === relation.targetId);
        if (targetEntity && !visited.has(targetEntity.id)) {
          related.push(targetEntity);
          traverse(targetEntity.id, depth + 1);
        }
      }
      
      // Relations entrantes
      const incomingRelations = this.graph.relationships.filter(r => r.targetId === currentId);
      for (const relation of incomingRelations) {
        const sourceEntity = this.graph.entities.find(e => e.id === relation.sourceId);
        if (sourceEntity && !visited.has(sourceEntity.id)) {
          related.push(sourceEntity);
          traverse(sourceEntity.id, depth + 1);
        }
      }
    };
    
    traverse(entityId, 0);
    return related;
  }

  // Générer des insights
  async generateInsights(): Promise<GraphInsight[]> {
    const insights: GraphInsight[] = [];
    
    // Analyser les corrélations
    const correlations = this.analyzeCorrelations();
    insights.push(...correlations);
    
    // Détecter les anomalies
    const anomalies = this.detectAnomalies();
    insights.push(...anomalies);
    
    // Générer des prédictions
    const predictions = this.generatePredictions();
    insights.push(...predictions);
    
    return insights;
  }

  private analyzeCorrelations(): GraphInsight[] {
    const insights: GraphInsight[] = [];
    
    // Exemple: Corrélation entre les imprimantes HP et les erreurs réseau
    const hpPrinters = this.graph.entities.filter(e => 
      e.type === EntityType.EQUIPMENT && 
      e.properties.brand === 'HP'
    );
    
    const networkErrors = this.graph.entities.filter(e => 
      e.type === EntityType.ERROR && 
      e.name.toLowerCase().includes('network')
    );
    
    if (hpPrinters.length > 0 && networkErrors.length > 0) {
      const relations = this.graph.relationships.filter(r => 
        hpPrinters.some(p => p.id === r.sourceId) && 
        networkErrors.some(e => e.id === r.targetId)
      );
      
      if (relations.length > 0) {
        const avgFrequency = relations.reduce((sum, r) => sum + (r.metadata?.frequency || 0), 0) / relations.length;
        
        insights.push({
          id: `insight_${Date.now()}_1`,
          type: 'correlation',
          title: 'Corrélation Imprimantes HP - Erreurs Réseau',
          description: `${Math.round(avgFrequency * 100)}% des pannes imprimante HP sont liées à des problèmes réseau`,
          confidence: 0.73,
          entities: [...hpPrinters, ...networkErrors],
          relationships: relations,
          metrics: {
            frequency: avgFrequency,
            correlation: 0.73,
            impact: 0.6
          },
          recommendations: [
            'Vérifier les pilotes réseau des imprimantes HP',
            'Mettre à jour le firmware des imprimantes',
            'Configurer les paramètres réseau avancés'
          ],
          createdAt: new Date()
        });
      }
    }
    
    return insights;
  }

  private detectAnomalies(): GraphInsight[] {
    const insights: GraphInsight[] = [];
    
    // Détecter les entités avec une confiance anormalement basse
    const lowConfidenceEntities = this.graph.entities.filter(e => e.confidence < 0.5);
    
    if (lowConfidenceEntities.length > 0) {
      insights.push({
        id: `insight_${Date.now()}_2`,
        type: 'anomaly',
        title: 'Entités à faible confiance',
        description: `${lowConfidenceEntities.length} entités nécessitent une validation manuelle`,
        confidence: 0.8,
        entities: lowConfidenceEntities,
        relationships: [],
        metrics: {
          frequency: lowConfidenceEntities.length,
          correlation: 0.3,
          impact: 0.4
        },
        recommendations: [
          'Valider manuellement les entités à faible confiance',
          'Améliorer la qualité des données source',
          'Ajouter plus d\'exemples d\'entraînement'
        ],
        createdAt: new Date()
      });
    }
    
    return insights;
  }

  private generatePredictions(): GraphInsight[] {
    const insights: GraphInsight[] = [];
    
    // Prédire les pannes probables
    const equipment = this.graph.entities.filter(e => e.type === EntityType.EQUIPMENT);
    const errors = this.graph.entities.filter(e => e.type === EntityType.ERROR);
    
    for (const eq of equipment) {
      const relatedErrors = this.graph.relationships
        .filter(r => r.sourceId === eq.id && errors.some(e => e.id === r.targetId))
        .map(r => ({ relation: r, error: errors.find(e => e.id === r.targetId)! }))
        .filter(item => item.error);
      
      if (relatedErrors.length > 0) {
        const maxWeight = Math.max(...relatedErrors.map(item => item.relation.weight));
        const mostLikelyError = relatedErrors.find(item => item.relation.weight === maxWeight);
        
        if (mostLikelyError && maxWeight > 0.7) {
          insights.push({
            id: `insight_${Date.now()}_3`,
            type: 'prediction',
            title: `Risque de panne pour ${eq.name}`,
            description: `Risque de ${mostLikelyError.error.name} : ${Math.round(maxWeight * 100)}%`,
            confidence: maxWeight,
            entities: [eq, mostLikelyError.error],
            relationships: [mostLikelyError.relation],
            metrics: {
              frequency: mostLikelyError.relation.metadata?.frequency || 0,
              correlation: maxWeight,
              impact: 0.8
            },
            recommendations: [
              'Effectuer une maintenance préventive',
              'Surveiller les indicateurs de performance',
              'Préparer les pièces de rechange'
            ],
            createdAt: new Date()
          });
        }
      }
    }
    
    return insights;
  }

  // Apprentissage continu
  async learnFromTicket(ticketData: LearningData): Promise<void> {
    this.learningHistory.push(ticketData);
    
    // Extraire et ajouter de nouvelles entités
    for (const entity of ticketData.entitiesExtracted) {
      this.addEntity(entity);
    }
    
    // Extraire et ajouter de nouvelles relations
    for (const relation of ticketData.relationsExtracted) {
      this.addRelation(relation);
    }
    
    // Mettre à jour les poids basés sur le résultat
    this.updateWeightsFromOutcome(ticketData);
    
    // Mettre à jour le taux d'apprentissage
    this.updateLearningRate();
  }

  private updateWeightsFromOutcome(ticketData: LearningData): void {
    const learningFactor = this.graph.metadata.learningRate;
    
    if (ticketData.outcome === 'resolved') {
      // Renforcer les relations qui ont mené à la résolution
      for (const relation of ticketData.relationsExtracted) {
        const existingRelation = this.graph.relationships.find(r => 
          r.sourceId === relation.sourceId && 
          r.targetId === relation.targetId && 
          r.type === relation.type
        );
        
        if (existingRelation) {
          existingRelation.weight = Math.min(1, existingRelation.weight + learningFactor * 0.1);
          existingRelation.confidence = Math.min(1, existingRelation.confidence + learningFactor * 0.05);
        }
      }
    } else if (ticketData.outcome === 'escalated') {
      // Réduire le poids des relations qui n'ont pas fonctionné
      for (const relation of ticketData.relationsExtracted) {
        const existingRelation = this.graph.relationships.find(r => 
          r.sourceId === relation.sourceId && 
          r.targetId === relation.targetId && 
          r.type === relation.type
        );
        
        if (existingRelation) {
          existingRelation.weight = Math.max(0.1, existingRelation.weight - learningFactor * 0.05);
          existingRelation.confidence = Math.max(0.1, existingRelation.confidence - learningFactor * 0.02);
        }
      }
    }
  }

  private updateLearningRate(): void {
    // Adapter le taux d'apprentissage basé sur la performance
    const recentTickets = this.learningHistory.slice(-100);
    const successRate = recentTickets.filter(t => t.outcome === 'resolved').length / recentTickets.length;
    
    if (successRate > 0.8) {
      this.graph.metadata.learningRate = Math.max(0.01, this.graph.metadata.learningRate * 0.95);
    } else if (successRate < 0.6) {
      this.graph.metadata.learningRate = Math.min(0.2, this.graph.metadata.learningRate * 1.05);
    }
  }

  // Visualisation du graphe
  generateVisualization(layout: 'force' | 'hierarchical' | 'circular' | 'grid' = 'force'): GraphVisualization {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    
    // Créer les nœuds
    for (const entity of this.graph.entities) {
      nodes.push({
        id: entity.id,
        label: entity.name,
        type: entity.type,
        x: Math.random() * 800,
        y: Math.random() * 600,
        size: 10 + entity.confidence * 20,
        color: this.getEntityColor(entity.type),
        properties: entity.properties
      });
    }
    
    // Créer les arêtes
    for (const relation of this.graph.relationships) {
      edges.push({
        id: relation.id,
        source: relation.sourceId,
        target: relation.targetId,
        label: relation.type,
        type: relation.type,
        weight: relation.weight,
        color: this.getRelationColor(relation.type)
      });
    }
    
    return {
      nodes,
      edges,
      layout
    };
  }

  private getEntityColor(type: EntityType): string {
    const colors = {
      [EntityType.EQUIPMENT]: '#3b82f6',
      [EntityType.ERROR]: '#ef4444',
      [EntityType.SOLUTION]: '#10b981',
      [EntityType.USER]: '#8b5cf6',
      [EntityType.BRAND]: '#f59e0b',
      [EntityType.MODEL]: '#06b6d4',
      [EntityType.OS]: '#84cc16',
      [EntityType.SOFTWARE]: '#f97316',
      [EntityType.COMPONENT]: '#6366f1',
      [EntityType.SYMPTOM]: '#ec4899',
      [EntityType.DIAGNOSIS]: '#14b8a6',
      [EntityType.PROCEDURE]: '#a855f7'
    };
    
    return colors[type] || '#6b7280';
  }

  private getRelationColor(type: RelationType): string {
    const colors = {
      [RelationType.CONNECTED_TO]: '#3b82f6',
      [RelationType.RESOLVES]: '#10b981',
      [RelationType.CAUSES]: '#ef4444',
      [RelationType.PART_OF]: '#8b5cf6',
      [RelationType.HAS_SYMPTOM]: '#f59e0b',
      [RelationType.DIAGNOSED_AS]: '#06b6d4',
      [RelationType.TREATED_WITH]: '#84cc16',
      [RelationType.LOCATED_AT]: '#f97316',
      [RelationType.MANUFACTURED_BY]: '#6366f1',
      [RelationType.COMPATIBLE_WITH]: '#ec4899',
      [RelationType.REQUIRES]: '#14b8a6',
      [RelationType.PRECEDES]: '#a855f7',
      [RelationType.FOLLOWS]: '#f43f5e',
      [RelationType.SIMILAR_TO]: '#0ea5e9',
      [RelationType.OPPOSITE_OF]: '#dc2626',
      [RelationType.RELATED_TO]: '#6b7280'
    };
    
    return colors[type] || '#6b7280';
  }

  private updateGraphMetadata(): void {
    this.graph.metadata.totalEntities = this.graph.entities.length;
    this.graph.metadata.totalRelations = this.graph.relationships.length;
    this.graph.metadata.avgConfidence = 
      this.graph.entities.reduce((sum, e) => sum + e.confidence, 0) / this.graph.entities.length;
    this.graph.lastUpdated = new Date();
  }

  // Getters
  getGraph(): KnowledgeGraph {
    return { ...this.graph };
  }

  getEntities(type?: EntityType): Entity[] {
    if (type) {
      return this.graph.entities.filter(e => e.type === type);
    }
    return [...this.graph.entities];
  }

  getRelations(type?: RelationType): Relation[] {
    if (type) {
      return this.graph.relationships.filter(r => r.type === type);
    }
    return [...this.graph.relationships];
  }

  getLearningHistory(): LearningData[] {
    return [...this.learningHistory];
  }
}