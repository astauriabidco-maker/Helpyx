export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  description: string;
  properties: Record<string, any>;
  embeddings?: number[];
  confidence: number;
  createdAt: Date;
  updatedAt: Date;
  ticketIds?: string[];
  metadata?: {
    source: 'manual' | 'auto' | 'ai';
    frequency: number;
    lastSeen: Date;
  };
}

export enum EntityType {
  EQUIPMENT = 'equipment',
  ERROR = 'error',
  SOLUTION = 'solution',
  USER = 'user',
  LOCATION = 'location',
  BRAND = 'brand',
  MODEL = 'model',
  OS = 'os',
  SOFTWARE = 'software',
  COMPONENT = 'component',
  SYMPTOM = 'symptom',
  DIAGNOSIS = 'diagnosis',
  PROCEDURE = 'procedure'
}

export interface Relation {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationType;
  weight: number;
  confidence: number;
  properties: Record<string, any>;
  createdAt: Date;
  metadata?: {
    source: 'manual' | 'auto' | 'ai';
    frequency: number;
    verified: boolean;
  };
}

export enum RelationType {
  CONNECTED_TO = 'connected-to',
  RESOLVES = 'resolves',
  CAUSES = 'causes',
  PART_OF = 'part-of',
  HAS_SYMPTOM = 'has-symptom',
  DIAGNOSED_AS = 'diagnosed-as',
  TREATED_WITH = 'treated-with',
  LOCATED_AT = 'located-at',
  MANUFACTURED_BY = 'manufactured-by',
  COMPATIBLE_WITH = 'compatible-with',
  REQUIRES = 'requires',
  PRECEDES = 'precedes',
  FOLLOWS = 'follows',
  SIMILAR_TO = 'similar-to',
  OPPOSITE_OF = 'opposite-of',
  RELATED_TO = 'related-to'
}

export interface KnowledgeGraph {
  entities: Entity[];
  relationships: Relation[];
  embeddings: Map<string, number[]>;
  confidence: number;
  lastUpdated: Date;
  metadata: {
    totalEntities: number;
    totalRelations: number;
    avgConfidence: number;
    learningRate: number;
  };
}

export interface ContextualSearchQuery {
  query: string;
  context?: {
    brand?: string;
    model?: string;
    os?: string;
    errorType?: string;
    timeRange?: {
      start: Date;
      end: Date;
    };
    location?: string;
    userId?: string;
  };
  filters?: {
    entityTypes?: EntityType[];
    relationTypes?: RelationType[];
    minConfidence?: number;
    maxResults?: number;
  };
  semantic?: boolean;
}

export interface SearchResult {
  entity: Entity;
  score: number;
  path?: Relation[];
  explanation?: string;
  relatedEntities?: Entity[];
}

export interface GraphInsight {
  id: string;
  type: 'pattern' | 'correlation' | 'anomaly' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  entities: Entity[];
  relationships: Relation[];
  metrics: {
    frequency: number;
    correlation: number;
    impact: number;
  };
  recommendations: string[];
  createdAt: Date;
}

export interface LearningData {
  ticketId: string;
  entitiesExtracted: Entity[];
  relationsExtracted: Relation[];
  outcome: 'resolved' | 'pending' | 'escalated';
  resolutionTime?: number;
  userFeedback?: {
    helpful: boolean;
    accuracy: number;
    comments?: string;
  };
  timestamp: Date;
}

export interface GraphVisualization {
  nodes: GraphNode[];
  edges: GraphEdge[];
  layout: 'force' | 'hierarchical' | 'circular' | 'grid';
  clusters?: GraphCluster[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: EntityType;
  x: number;
  y: number;
  size: number;
  color: string;
  properties: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: RelationType;
  weight: number;
  color: string;
}

export interface GraphCluster {
  id: string;
  name: string;
  entities: string[];
  centroid: { x: number; y: number };
  coherence: number;
}