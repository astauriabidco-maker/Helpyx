'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Zap,
  Activity,
  Network,
  Lightbulb,
  Eye,
  Download,
  RefreshCw,
  Filter,
  Calendar,
  Clock,
  Users,
  Monitor,
  Smartphone,
  Router,
  HardDrive,
  Cpu,
  Wifi,
  Battery
} from 'lucide-react';
import { Entity, Relation, GraphInsight, EntityType } from '@/types/knowledge-graph';

interface GraphAnalyticsProps {
  entities: Entity[];
  relations: Relation[];
  insights?: GraphInsight[];
  onInsightClick?: (insight: GraphInsight) => void;
  className?: string;
}

interface AnalyticsData {
  entityDistribution: Record<EntityType, number>;
  relationTypes: Record<string, number>;
  confidenceMetrics: {
    high: number;
    medium: number;
    low: number;
    average: number;
  };
  growthMetrics: {
    newEntities: number;
    newRelations: number;
    updatedConfidence: number;
  };
  topEntities: Array<{
    entity: Entity;
    connections: number;
    influence: number;
  }>;
  anomalies: Array<{
    entity: Entity;
    reason: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export function GraphAnalytics({
  entities,
  relations,
  insights = [],
  onInsightClick,
  className = ""
}: GraphAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    performAnalytics();
  }, [entities, relations, selectedTimeRange]);

  const performAnalytics = async () => {
    setIsAnalyzing(true);
    try {
      const data = await analyzeGraph();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Analytics error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeGraph = async (): Promise<AnalyticsData> => {
    // Distribution des entités
    const entityDistribution: Record<EntityType, number> = {} as Record<EntityType, number>;
    entities.forEach(entity => {
      entityDistribution[entity.type] = (entityDistribution[entity.type] || 0) + 1;
    });

    // Types de relations
    const relationTypes: Record<string, number> = {};
    relations.forEach(relation => {
      relationTypes[relation.type] = (relationTypes[relation.type] || 0) + 1;
    });

    // Métriques de confiance
    const confidenceScores = entities.map(e => e.confidence);
    const averageConfidence = confidenceScores.length > 0
      ? confidenceScores.reduce((sum, c) => sum + c, 0) / confidenceScores.length
      : 0;

    const confidenceMetrics = {
      high: confidenceScores.filter(c => c > 0.8).length,
      medium: confidenceScores.filter(c => c > 0.5 && c <= 0.8).length,
      low: confidenceScores.filter(c => c <= 0.5).length,
      average: averageConfidence
    };

    // Entités les plus connectées
    const entityConnections: Record<string, number> = {};
    relations.forEach(relation => {
      entityConnections[relation.sourceId] = (entityConnections[relation.sourceId] || 0) + 1;
      entityConnections[relation.targetId] = (entityConnections[relation.targetId] || 0) + 1;
    });

    const topEntities = Object.entries(entityConnections)
      .map(([entityId, connections]) => {
        const entity = entities.find(e => e.id === entityId);
        if (!entity) return null;

        // Calculer l'influence basée sur les connexions et la confiance
        const influence = connections * entity.confidence;

        return {
          entity,
          connections,
          influence
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.influence - a.influence)
      .slice(0, 10);

    // Détection d'anomalies
    const anomalies = entities
      .filter(entity => {
        // Entités avec très faible confiance
        if (entity.confidence < 0.3) return true;

        // Entités isolées (pas de relations)
        const hasConnections = entityConnections[entity.id] > 0;
        if (!hasConnections && entity.type !== EntityType.BRAND) return true;

        return false;
      })
      .map(entity => ({
        entity,
        reason: entity.confidence < 0.3 ? 'Faible confiance' : 'Entité isolée',
        severity: (entity.confidence < 0.2 ? 'high' : 'medium') as 'low' | 'medium' | 'high'
      }));

    // Métriques de croissance (simulées)
    const growthMetrics = {
      newEntities: Math.floor(entities.length * 0.1),
      newRelations: Math.floor(relations.length * 0.15),
      updatedConfidence: Math.random() * 0.1
    };

    return {
      entityDistribution,
      relationTypes,
      confidenceMetrics,
      growthMetrics,
      topEntities,
      anomalies
    };
  };

  const getEntityTypeIcon = (type: EntityType) => {
    const icons = {
      [EntityType.EQUIPMENT]: <Monitor className="w-4 h-4" />,
      [EntityType.ERROR]: <AlertTriangle className="w-4 h-4" />,
      [EntityType.SOLUTION]: <CheckCircle className="w-4 h-4" />,
      [EntityType.USER]: <Users className="w-4 h-4" />,
      [EntityType.BRAND]: <Brain className="w-4 h-4" />,
      [EntityType.MODEL]: <Cpu className="w-4 h-4" />,
      [EntityType.OS]: <HardDrive className="w-4 h-4" />,
      [EntityType.SOFTWARE]: <Smartphone className="w-4 h-4" />,
      [EntityType.COMPONENT]: <Wifi className="w-4 h-4" />,
      [EntityType.SYMPTOM]: <Battery className="w-4 h-4" />,
      [EntityType.DIAGNOSIS]: <Eye className="w-4 h-4" />,
      [EntityType.PROCEDURE]: <Target className="w-4 h-4" />,
      [EntityType.LOCATION]: <Router className="w-4 h-4" />
    };
    return icons[type] || <Brain className="w-4 h-4" />;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return 'text-green-500';
    if (confidence > 0.5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête avec contrôles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Analytics du Knowledge Graph
          </h2>
          <p className="text-muted-foreground">
            Analyse intelligente des données et tendances
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">90 derniers jours</option>
            <option value="all">Toute la période</option>
          </select>
          <Button
            variant="outline"
            onClick={performAnalytics}
            disabled={isAnalyzing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Entités</p>
                <p className="text-2xl font-bold text-blue-500">{entities.length}</p>
                <p className="text-xs text-green-500">+{analyticsData.growthMetrics.newEntities} nouveaux</p>
              </div>
              <Network className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Relations</p>
                <p className="text-2xl font-bold text-green-500">{relations.length}</p>
                <p className="text-xs text-green-500">+{analyticsData.growthMetrics.newRelations} nouvelles</p>
              </div>
              <Activity className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confiance Moyenne</p>
                <p className={`text-2xl font-bold ${getConfidenceColor(analyticsData.confidenceMetrics.average)}`}>
                  {Math.round(analyticsData.confidenceMetrics.average * 100)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {analyticsData.confidenceMetrics.high} élevées, {analyticsData.confidenceMetrics.low} faibles
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Anomalies</p>
                <p className="text-2xl font-bold text-red-500">{analyticsData.anomalies.length}</p>
                <p className="text-xs text-muted-foreground">À vérifier</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets d'analyse détaillée */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="entities">Entités</TabsTrigger>
          <TabsTrigger value="relations">Relations</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribution des entités */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Distribution des Entités
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analyticsData.entityDistribution).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getEntityTypeIcon(type as EntityType)}
                        <span className="text-sm font-medium capitalize">{type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(count / entities.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top entités influentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Entités les Plus Influentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.topEntities.slice(0, 5).map((item, index) => (
                    <div key={item.entity.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>
                        <div>
                          <p className="text-sm font-medium">{item.entity.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{item.entity.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{Math.round(item.influence)}</p>
                        <p className="text-xs text-muted-foreground">{item.connections} connexions</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analyse des entités */}
        <TabsContent value="entities" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Confiance des entités */}
            <Card>
              <CardHeader>
                <CardTitle>Niveaux de Confiance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Élevée (&gt;80%)</span>
                    <span>{analyticsData.confidenceMetrics.high}</span>
                  </div>
                  <Progress value={(analyticsData.confidenceMetrics.high / entities.length) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Moyenne (50-80%)</span>
                    <span>{analyticsData.confidenceMetrics.medium}</span>
                  </div>
                  <Progress value={(analyticsData.confidenceMetrics.medium / entities.length) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Faible (&lt;50%)</span>
                    <span>{analyticsData.confidenceMetrics.low}</span>
                  </div>
                  <Progress value={(analyticsData.confidenceMetrics.low / entities.length) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Types d'entités */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Détail par Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(analyticsData.entityDistribution).map(([type, count]) => {
                    const typeEntities = entities.filter(e => e.type === type);
                    const avgConfidence = typeEntities.length > 0
                      ? typeEntities.reduce((sum, e) => sum + e.confidence, 0) / typeEntities.length
                      : 0;

                    return (
                      <div key={type} className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          {getEntityTypeIcon(type as EntityType)}
                          <span className="font-medium capitalize">{type}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>Quantité: {count}</p>
                          <p>Confiance: {Math.round(avgConfidence * 100)}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analyse des relations */}
        <TabsContent value="relations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="w-5 h-5" />
                Types de Relations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(analyticsData.relationTypes).map(([type, count]) => (
                  <div key={type} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{type.replace('-', ' ')}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights IA */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {insights.map((insight) => (
              <Card key={insight.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                    <Badge variant={insight.confidence > 0.8 ? 'default' : 'secondary'}>
                      {Math.round(insight.confidence * 100)}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Fréquence:</span>
                      <span>{Math.round(insight.metrics.frequency * 100)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Impact:</span>
                      <span>{Math.round(insight.metrics.impact * 100)}%</span>
                    </div>
                  </div>

                  {insight.recommendations.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-1">Recommandations:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {insight.recommendations.slice(0, 2).map((rec, index) => (
                          <li key={index}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                    onClick={() => onInsightClick?.(insight)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Voir les détails
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Anomalies */}
        <TabsContent value="anomalies" className="space-y-6">
          {analyticsData.anomalies.length > 0 ? (
            <div className="space-y-4">
              {analyticsData.anomalies.map((anomaly) => (
                <Alert key={anomaly.entity.id}>
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{anomaly.entity.name}</p>
                        <p className="text-sm">{anomaly.reason}</p>
                      </div>
                      <Badge variant={getSeverityColor(anomaly.severity)}>
                        {anomaly.severity}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-medium">Aucune anomalie détectée</p>
                <p className="text-sm text-muted-foreground">Toutes les entités semblent normales</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}