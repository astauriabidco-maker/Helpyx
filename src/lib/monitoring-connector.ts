import { KnowledgeGraphEngine } from './knowledge-graph';
import { ZAI } from 'z-ai-web-dev-sdk';

export interface MonitoringSystem {
  id: string;
  name: string;
  type: 'network' | 'server' | 'application' | 'security';
  endpoint: string;
  credentials: {
    apiKey?: string;
    username?: string;
    password?: string;
    token?: string;
  };
  isActive: boolean;
  lastSync: Date;
  config: MonitoringConfig;
}

export interface MonitoringConfig {
  syncInterval: number; // en minutes
  dataTypes: string[];
  filters: Record<string, any>;
  mappingRules: MappingRule[];
}

export interface MappingRule {
  sourceField: string;
  targetType: 'EQUIPMENT' | 'ERROR' | 'SOLUTION' | 'USER';
  targetField: string;
  transformation?: string;
  confidence: number;
}

export interface MonitoringData {
  systemId: string;
  timestamp: Date;
  metrics: Array<{
    name: string;
    value: number | string;
    unit?: string;
    status: 'normal' | 'warning' | 'critical';
  }>;
  events: Array<{
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    source: string;
  }>;
  topology: Array<{
    id: string;
    name: string;
    type: string;
    relationships: Array<{
      target: string;
      type: string;
    }>;
  }>;
}

export class MonitoringConnector {
  private knowledgeGraph: KnowledgeGraphEngine;
  private activeConnections: Map<string, MonitoringSystem> = new Map();
  private syncIntervals: Map<string, NodeJS.Timeout> = new Map();
  private zai: ZAI;

  constructor() {
    this.knowledgeGraph = new KnowledgeGraphEngine();
    this.zai = new ZAI();
  }

  /**
   * Ajouter un système de monitoring
   */
  async addMonitoringSystem(system: MonitoringSystem): Promise<boolean> {
    try {
      // Valider la connexion
      const isValid = await this.validateConnection(system);
      if (!isValid) {
        throw new Error(`Impossible de se connecter à ${system.name}`);
      }

      // Ajouter le système
      this.activeConnections.set(system.id, system);

      // Démarrer la synchronisation
      this.startSync(system);

      console.log(`✅ Système de monitoring ajouté: ${system.name}`);
      return true;
    } catch (error) {
      console.error(`❌ Erreur lors de l'ajout du système ${system.name}:`, error);
      return false;
    }
  }

  /**
   * Supprimer un système de monitoring
   */
  async removeMonitoringSystem(systemId: string): Promise<boolean> {
    try {
      // Arrêter la synchronisation
      this.stopSync(systemId);

      // Supprimer le système
      this.activeConnections.delete(systemId);

      console.log(`✅ Système de monitoring supprimé: ${systemId}`);
      return true;
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression du système ${systemId}:`, error);
      return false;
    }
  }

  /**
   * Valider la connexion à un système de monitoring
   */
  private async validateConnection(system: MonitoringSystem): Promise<boolean> {
    try {
      const response = await fetch(`${system.endpoint}/health`, {
        headers: {
          'Authorization': `Bearer ${system.credentials.apiKey || system.credentials.token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error(`Erreur de validation pour ${system.name}:`, error);
      return false;
    }
  }

  /**
   * Démarrer la synchronisation pour un système
   */
  private startSync(system: MonitoringSystem): void {
    const interval = setInterval(async () => {
      await this.syncData(system);
    }, system.config.syncInterval * 60 * 1000); // Convertir en millisecondes

    this.syncIntervals.set(system.id, interval);

    // Synchronisation immédiate
    this.syncData(system);
  }

  /**
   * Arrêter la synchronisation pour un système
   */
  private stopSync(systemId: string): void {
    const interval = this.syncIntervals.get(systemId);
    if (interval) {
      clearInterval(interval);
      this.syncIntervals.delete(systemId);
    }
  }

  /**
   * Synchroniser les données depuis un système de monitoring
   */
  private async syncData(system: MonitoringSystem): Promise<void> {
    try {
      console.log(`🔄 Synchronisation des données depuis ${system.name}...`);

      // Récupérer les données du système
      const data = await this.fetchMonitoringData(system);

      // Traiter et transformer les données
      const processedData = await this.processMonitoringData(data, system);

      // Intégrer dans le Knowledge Graph
      await this.integrateData(processedData);

      // Mettre à jour le timestamp de dernière synchronisation
      system.lastSync = new Date();

      console.log(`✅ Synchronisation terminée pour ${system.name}`);
    } catch (error) {
      console.error(`❌ Erreur lors de la synchronisation avec ${system.name}:`, error);
    }
  }

  /**
   * Récupérer les données depuis un système de monitoring
   */
  private async fetchMonitoringData(system: MonitoringSystem): Promise<MonitoringData> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (system.credentials.apiKey) {
      headers['Authorization'] = `Bearer ${system.credentials.apiKey}`;
    } else if (system.credentials.token) {
      headers['X-API-Token'] = system.credentials.token;
    }

    // Récupérer les métriques
    const metricsResponse = await fetch(`${system.endpoint}/metrics`, { headers });
    const metrics = await metricsResponse.json();

    // Récupérer les événements
    const eventsResponse = await fetch(`${system.endpoint}/events`, { headers });
    const events = await eventsResponse.json();

    // Récupérer la topologie
    const topologyResponse = await fetch(`${system.endpoint}/topology`, { headers });
    const topology = await topologyResponse.json();

    return {
      systemId: system.id,
      timestamp: new Date(),
      metrics: metrics.data || [],
      events: events.data || [],
      topology: topology.data || []
    };
  }

  /**
   * Traiter les données de monitoring
   */
  private async processMonitoringData(
    data: MonitoringData, 
    system: MonitoringSystem
  ): Promise<Array<{ entity: any; relations: any[] }>> {
    const results: Array<{ entity: any; relations: any[] }> = [];

    // Traiter les équipements depuis la topologie
    for (const node of data.topology) {
      const entity = await this.mapToEntity(node, system.config.mappingRules);
      if (entity) {
        const relations = await this.extractRelations(node, data.topology, system.config.mappingRules);
        results.push({ entity, relations });
      }
    }

    // Traiter les erreurs depuis les événements
    for (const event of data.events) {
      if (event.severity === 'high' || event.severity === 'critical') {
        const entity = await this.mapEventToEntity(event, system.config.mappingRules);
        if (entity) {
          results.push({ entity, relations: [] });
        }
      }
    }

    // Traiter les métriques anormales
    for (const metric of data.metrics) {
      if (metric.status === 'warning' || metric.status === 'critical') {
        const entity = await this.mapMetricToEntity(metric, system.config.mappingRules);
        if (entity) {
          results.push({ entity, relations: [] });
        }
      }
    }

    return results;
  }

  /**
   * Mapper un nœud de topologie vers une entité
   */
  private async mapToEntity(
    node: any, 
    mappingRules: MappingRule[]
  ): Promise<any | null> {
    try {
      // Utiliser l'IA pour améliorer le mapping
      const prompt = `
        Analyse cet équipement de monitoring et extrait les informations pertinentes:
        ${JSON.stringify(node)}
        
        Retourne un objet JSON avec:
        - name: nom de l'équipement
        - type: type d'équipement (server, router, switch, etc.)
        - brand: marque si détectable
        - model: modèle si détectable
        - description: description technique
        - properties: propriétés supplémentaires
      `;

      const response = await this.zai.chat.completions.create({
        messages: [
          { role: 'system', content: 'Tu es un expert en infrastructure IT.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.3
      });

      const aiAnalysis = JSON.parse(response.choices[0].message.content || '{}');

      return {
        id: `monitoring_${node.id}`,
        type: 'EQUIPMENT',
        name: aiAnalysis.name || node.name,
        description: aiAnalysis.description || `Équipement ${node.type}`,
        properties: {
          ...aiAnalysis.properties,
          source: 'monitoring',
          systemId: node.id,
          originalType: node.type,
          brand: aiAnalysis.brand,
          model: aiAnalysis.model
        },
        confidence: 0.8,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          source: 'monitoring',
          frequency: 1,
          lastSeen: new Date()
        }
      };
    } catch (error) {
      console.error('Erreur lors du mapping de l\'entité:', error);
      return null;
    }
  }

  /**
   * Mapper un événement vers une entité d'erreur
   */
  private async mapEventToEntity(
    event: any, 
    mappingRules: MappingRule[]
  ): Promise<any | null> {
    return {
      id: `event_${Date.now()}_${Math.random()}`,
      type: 'ERROR',
      name: event.type,
      description: event.message,
      properties: {
        source: event.source,
        severity: event.severity,
        systemId: event.systemId
      },
      confidence: 0.9,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        source: 'monitoring',
        frequency: 1,
        lastSeen: new Date()
      }
    };
  }

  /**
   * Mapper une métrique anormale vers une entité
   */
  private async mapMetricToEntity(
    metric: any, 
    mappingRules: MappingRule[]
  ): Promise<any | null> {
    return {
      id: `metric_${Date.now()}_${Math.random()}`,
      type: 'ERROR',
      name: `Anomalie: ${metric.name}`,
      description: `Valeur anormale détectée: ${metric.value} ${metric.unit || ''}`,
      properties: {
        metricName: metric.name,
        value: metric.value,
        unit: metric.unit,
        status: metric.status
      },
      confidence: 0.7,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        source: 'monitoring',
        frequency: 1,
        lastSeen: new Date()
      }
    };
  }

  /**
   * Extraire les relations depuis la topologie
   */
  private async extractRelations(
    node: any, 
    topology: any[], 
    mappingRules: MappingRule[]
  ): Promise<any[]> {
    const relations: any[] = [];

    for (const relationship of node.relationships || []) {
      relations.push({
        id: `rel_${Date.now()}_${node.id}_${relationship.target}`,
        sourceId: `monitoring_${node.id}`,
        targetId: `monitoring_${relationship.target}`,
        type: relationship.type.toUpperCase().replace('-', '_'),
        weight: 0.8,
        confidence: 0.75,
        properties: {
          source: 'monitoring',
          frequency: 1
        },
        createdAt: new Date(),
        metadata: {
          source: 'monitoring',
          frequency: 1,
          verified: false
        }
      });
    }

    return relations;
  }

  /**
   * Intégrer les données dans le Knowledge Graph
   */
  private async integrateData(
    processedData: Array<{ entity: any; relations: any[] }>
  ): Promise<void> {
    for (const { entity, relations } of processedData) {
      // Ajouter l'entité
      this.knowledgeGraph.addEntity(entity);

      // Ajouter les relations
      for (const relation of relations) {
        this.knowledgeGraph.addRelation(relation);
      }
    }
  }

  /**
   * Obtenir la liste des systèmes actifs
   */
  getActiveSystems(): MonitoringSystem[] {
    return Array.from(this.activeConnections.values());
  }

  /**
   * Obtenir les statistiques de synchronisation
   */
  getSyncStats(): Array<{
    systemId: string;
    name: string;
    lastSync: Date;
    status: 'active' | 'error' | 'inactive';
    dataPoints: number;
  }> {
    return Array.from(this.activeConnections.values()).map(system => ({
      systemId: system.id,
      name: system.name,
      lastSync: system.lastSync,
      status: system.isActive ? 'active' : 'inactive',
      dataPoints: Math.floor(Math.random() * 1000) // Simulation
    }));
  }

  /**
   * Forcer la synchronisation manuelle
   */
  async forceSync(systemId: string): Promise<boolean> {
    const system = this.activeConnections.get(systemId);
    if (!system) {
      throw new Error(`Système ${systemId} non trouvé`);
    }

    try {
      await this.syncData(system);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la synchronisation forcée de ${systemId}:`, error);
      return false;
    }
  }

  /**
   * Nettoyer les ressources
   */
  cleanup(): void {
    // Arrêter toutes les synchronisations
    for (const systemId of this.syncIntervals.keys()) {
      this.stopSync(systemId);
    }

    // Vider les connexions
    this.activeConnections.clear();
  }
}