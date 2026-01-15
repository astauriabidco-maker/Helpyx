'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, 
  Search, 
  Network, 
  Lightbulb,
  TrendingUp,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Zap,
  Database,
  GitBranch,
  Eye,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  BookOpen,
  Users,
  Monitor,
  Smartphone,
  Router,
  HardDrive,
  Cpu,
  Wifi,
  Battery,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  Save,
  Play,
  Pause
} from 'lucide-react';
import { EntityType, RelationType, SearchResult, GraphInsight, Entity, Relation } from '@/types/knowledge-graph';
import { GraphVisualization } from '@/components/knowledge-graph/graph-visualization';
import { GraphAnalytics } from '@/components/knowledge-graph/graph-analytics';
import { IntelligentDiagnosis } from '@/components/knowledge-graph/intelligent-diagnosis';
import { AdvancedNLP } from '@/components/knowledge-graph/advanced-nlp';
import { RealTimeProcessing } from '@/components/knowledge-graph/realtime-processing';
import { ARVRIntegration } from '@/components/knowledge-graph/ar-vr-integration';
import { SaaSPremium } from '@/components/knowledge-graph/saas-premium';
import { APIService } from '@/components/knowledge-graph/api-service';
import { ConsultingServices } from '@/components/knowledge-graph/consulting-services';
import { MonetizationDashboard } from '@/components/knowledge-graph/monetization-dashboard';

interface SearchQuery {
  query: string;
  context: {
    brand?: string;
    model?: string;
    os?: string;
    errorType?: string;
  };
  semantic: boolean;
}

export default function KnowledgeGraphPage() {
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({
    query: '',
    context: {},
    semantic: true
  });
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [insights, setInsights] = useState<GraphInsight[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [relations, setRelations] = useState<Relation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<GraphInsight | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [graphStats, setGraphStats] = useState({
    entities: 0,
    relations: 0,
    confidence: 0,
    learningRate: 0
  });
  const [activeTab, setActiveTab] = useState('search');

  useEffect(() => {
    loadGraphData();
    loadGraphStats();
    loadInsights();
  }, []);

  useEffect(() => {
    loadGraphStats();
  }, [entities, relations]);

  const loadGraphData = async () => {
    try {
      // Simuler le chargement des données du graphe
      // En production, ceci viendrait de l'API
      const mockEntities: Entity[] = [
        {
          id: '1',
          type: EntityType.EQUIPMENT,
          name: 'Dell Latitude 5420',
          description: 'Laptop manufactured by Dell',
          properties: { brand: 'Dell', type: 'Laptop' },
          confidence: 0.92,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          type: EntityType.ERROR,
          name: 'BSOD - Critical Process Died',
          description: 'System error with code 0x000000EF',
          properties: { code: '0x000000EF' },
          confidence: 0.85,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '3',
          type: EntityType.SOLUTION,
          name: 'Update graphics drivers',
          description: 'Download latest drivers from manufacturer website',
          properties: { procedure: 'Download and install' },
          confidence: 0.8,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '4',
          type: EntityType.BRAND,
          name: 'Dell',
          description: 'Computer hardware manufacturer',
          properties: { industry: 'Technology' },
          confidence: 0.95,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const mockRelations: Relation[] = [
        {
          id: '1',
          sourceId: '1',
          targetId: '2',
          type: RelationType.HAS_SYMPTOM,
          weight: 0.7,
          confidence: 0.8,
          properties: { frequency: 15 },
          createdAt: new Date()
        },
        {
          id: '2',
          sourceId: '3',
          targetId: '2',
          type: RelationType.RESOLVES,
          weight: 0.85,
          confidence: 0.9,
          properties: { successRate: 0.85 },
          createdAt: new Date()
        },
        {
          id: '3',
          sourceId: '4',
          targetId: '1',
          type: RelationType.MANUFACTURED_BY,
          weight: 0.9,
          confidence: 0.95,
          properties: {},
          createdAt: new Date()
        }
      ];

      setEntities(mockEntities);
      setRelations(mockRelations);
    } catch (error) {
      console.error('Error loading graph data:', error);
    }
  };

  const loadGraphStats = async () => {
    try {
      // Calculer les statistiques réelles basées sur les données
      const avgConfidence = entities.length > 0 
        ? entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length 
        : 0;

      setGraphStats({
        entities: entities.length,
        relations: relations.length,
        confidence: avgConfidence,
        learningRate: 0.12
      });
    } catch (error) {
      console.error('Error loading graph stats:', error);
    }
  };

  const loadInsights = async () => {
    try {
      const response = await fetch('/api/knowledge-graph/insights');
      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights || []);
      }
    } catch (error) {
      console.error('Error loading insights:', error);
      // Données de démonstration
      setInsights([
        {
          id: '1',
          type: 'correlation',
          title: 'Corrélation Imprimantes HP - Erreurs Réseau',
          description: '73% des pannes imprimante HP viennent du driver réseau',
          confidence: 0.73,
          entities: [],
          relationships: [],
          metrics: {
            frequency: 0.73,
            correlation: 0.73,
            impact: 0.6
          },
          recommendations: [
            'Vérifier les pilotes réseau des imprimantes HP',
            'Mettre à jour le firmware',
            'Configurer les paramètres réseau avancés'
          ],
          createdAt: new Date()
        },
        {
          id: '2',
          type: 'prediction',
          title: 'Risque de panne Dell Latitude',
          description: 'Probabilité de BSOD élevée sur Windows 11',
          confidence: 0.68,
          entities: [],
          relationships: [],
          metrics: {
            frequency: 0.45,
            correlation: 0.68,
            impact: 0.8
          },
          recommendations: [
            'Mettre à jour les pilotes graphiques',
            'Vérifier la compatibilité Windows 11',
            'Effectuer une analyse mémoire'
          ],
          createdAt: new Date()
        }
      ]);
    }
  };

  const performSearch = async () => {
    if (!searchQuery.query.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch('/api/knowledge-graph/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchQuery),
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
      } else {
        console.error('Search failed');
        // Données de démonstration
        setSearchResults([
          {
            entity: {
              id: '1',
              type: EntityType.EQUIPMENT,
              name: 'Dell Latitude 5420',
              description: 'Laptop manufactured by Dell',
              properties: { brand: 'Dell', type: 'Laptop' },
              confidence: 0.92,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            score: 0.89,
            relatedEntities: []
          },
          {
            entity: {
              id: '2',
              type: EntityType.ERROR,
              name: 'BSOD - Critical Process Died',
              description: 'System error with code 0x000000EF',
              properties: { code: '0x000000EF' },
              confidence: 0.85,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            score: 0.76,
            relatedEntities: []
          }
        ]);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const getEntityTypeIcon = (type: EntityType) => {
    switch (type) {
      case EntityType.EQUIPMENT: return <Monitor className="w-4 h-4" />;
      case EntityType.ERROR: return <AlertTriangle className="w-4 h-4" />;
      case EntityType.SOLUTION: return <CheckCircle className="w-4 h-4" />;
      case EntityType.USER: return <Users className="w-4 h-4" />;
      case EntityType.BRAND: return <Database className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'correlation': return <GitBranch className="w-5 h-5 text-blue-500" />;
      case 'prediction': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'anomaly': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'pattern': return <BarChart3 className="w-5 h-5 text-purple-500" />;
      default: return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return 'text-green-500';
    if (confidence > 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const handleEntityClick = (entity: Entity) => {
    setSelectedEntity(entity);
    setActiveTab('search');
  };

  const handleInsightClick = (insight: GraphInsight) => {
    setSelectedInsight(insight);
    setActiveTab('insights');
  };

  const enrichWithAI = async () => {
    try {
      const response = await fetch('/api/knowledge-graph/enrich', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate-insights',
          data: {
            entities,
            relations,
            timeRange: '30d'
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Ajouter les nouveaux insights
        setInsights(prev => [...prev, ...data.insights]);
      }
    } catch (error) {
      console.error('AI enrichment error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Brain className="w-8 h-8 text-purple-500" />
              Knowledge Graph Intelligence
            </h1>
            <p className="text-muted-foreground">
              Graphe de connaissances relationnel avec apprentissage continu
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Confiance moyenne</p>
              <p className={`text-2xl font-bold ${getConfidenceColor(graphStats.confidence)}`}>
                {Math.round(graphStats.confidence * 100)}%
              </p>
            </div>
            <Button variant="outline" onClick={enrichWithAI}>
              <Brain className="w-4 h-4 mr-2" />
              Enrichir avec IA
            </Button>
            <Button variant="outline" onClick={loadGraphStats}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Entités</p>
                  <p className="text-2xl font-bold text-blue-500">{graphStats.entities}</p>
                </div>
                <Database className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Relations</p>
                  <p className="text-2xl font-bold text-green-500">{graphStats.relations}</p>
                </div>
                <Network className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taux d'apprentissage</p>
                  <p className="text-2xl font-bold text-purple-500">
                    {Math.round(graphStats.learningRate * 100)}%
                  </p>
                </div>
                <Activity className="w-8 h-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Insights actifs</p>
                  <p className="text-2xl font-bold text-orange-500">{insights.length}</p>
                </div>
                <Lightbulb className="w-8 h-8 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-13">
            <TabsTrigger value="search">Recherche</TabsTrigger>
            <TabsTrigger value="diagnosis">Diagnostic IA</TabsTrigger>
            <TabsTrigger value="visualization">Visualisation</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="learning">Apprentissage</TabsTrigger>
            <TabsTrigger value="nlp">NLP Avancé</TabsTrigger>
            <TabsTrigger value="realtime">Real-time</TabsTrigger>
            <TabsTrigger value="arvr">AR/VR</TabsTrigger>
            <TabsTrigger value="saas">SaaS</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="consulting">Consulting</TabsTrigger>
            <TabsTrigger value="monetization">Monétisation</TabsTrigger>
          </TabsList>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Recherche Contextuelle
                </CardTitle>
                <CardDescription>
                  Recherche sémantique et contextuelle dans le graphe de connaissances
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Requête</label>
                    <Textarea
                      placeholder="ex: Tous les tickets Dell avec erreur BSOD sur Windows 11"
                      value={searchQuery.query}
                      onChange={(e) => setSearchQuery(prev => ({ ...prev, query: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Marque</label>
                      <Select
                        value={searchQuery.context.brand}
                        onValueChange={(value) => setSearchQuery(prev => ({
                          ...prev,
                          context: { ...prev.context, brand: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Toutes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes</SelectItem>
                          <SelectItem value="Dell">Dell</SelectItem>
                          <SelectItem value="HP">HP</SelectItem>
                          <SelectItem value="Cisco">Cisco</SelectItem>
                          <SelectItem value="APC">APC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Système</label>
                      <Select
                        value={searchQuery.context.os}
                        onValueChange={(value) => setSearchQuery(prev => ({
                          ...prev,
                          context: { ...prev.context, os: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tous" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous</SelectItem>
                          <SelectItem value="Windows 10">Windows 10</SelectItem>
                          <SelectItem value="Windows 11">Windows 11</SelectItem>
                          <SelectItem value="macOS">macOS</SelectItem>
                          <SelectItem value="Linux">Linux</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Type d'erreur</label>
                      <Select
                        value={searchQuery.context.errorType}
                        onValueChange={(value) => setSearchQuery(prev => ({
                          ...prev,
                          context: { ...prev.context, errorType: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tous" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous</SelectItem>
                          <SelectItem value="BSOD">BSOD</SelectItem>
                          <SelectItem value="Network">Réseau</SelectItem>
                          <SelectItem value="Hardware">Matériel</SelectItem>
                          <SelectItem value="Software">Logiciel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-end">
                      <Button 
                        onClick={performSearch} 
                        disabled={isSearching || !searchQuery.query.trim()}
                        className="w-full"
                      >
                        {isSearching ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Recherche...
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4 mr-2" />
                            Rechercher
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="semantic"
                      checked={searchQuery.semantic}
                      onChange={(e) => setSearchQuery(prev => ({ ...prev, semantic: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="semantic" className="text-sm">
                      Activer la recherche sémantique (IA)
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Résultats ({searchResults.length})
                    </span>
                    <Badge variant="outline">
                      {Math.round(searchResults.reduce((acc, r) => acc + r.score, 0) / searchResults.length * 100)}% pertinence
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {searchResults.map((result, index) => (
                      <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-muted rounded">
                              {getEntityTypeIcon(result.entity.type)}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold">{result.entity.name}</h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {result.entity.description}
                              </p>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="capitalize">
                                  {result.entity.type}
                                </Badge>
                                <Badge variant="outline" className={getConfidenceColor(result.entity.confidence)}>
                                  {Math.round(result.entity.confidence * 100)}% confiance
                                </Badge>
                                <Badge variant="outline">
                                  {Math.round(result.score * 100)}% pertinence
                                </Badge>
                              </div>
                              {result.entity.properties && Object.keys(result.entity.properties).length > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  {Object.entries(result.entity.properties).map(([key, value]) => (
                                    <span key={key} className="mr-3">
                                      {key}: {String(value)}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Voir
                            </Button>
                            <Button variant="outline" size="sm">
                              <Share2 className="w-4 h-4 mr-1" />
                              Partager
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Diagnosis Tab */}
          <TabsContent value="diagnosis" className="space-y-6">
            <IntelligentDiagnosis
              onDiagnosisComplete={(result) => {
                console.log('Diagnosis completed:', result);
                // Enrichir le graphe avec les résultats du diagnostic
                if (result.primaryIssue) {
                  // Optionnel: ajouter les nouvelles entités au graphe
                }
              }}
            />
          </TabsContent>

          {/* Visualization Tab */}
          <TabsContent value="visualization" className="space-y-6">
            <GraphVisualization
              entities={entities}
              relations={relations}
              onEntityClick={handleEntityClick}
              onRelationClick={(relation) => console.log('Relation clicked:', relation)}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <GraphAnalytics
              entities={entities}
              relations={relations}
              insights={insights}
              onInsightClick={handleInsightClick}
            />
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Insights Découverts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insights.map((insight) => (
                      <div
                        key={insight.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedInsight?.id === insight.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedInsight(insight)}
                      >
                        <div className="flex items-start gap-3">
                          {getInsightIcon(insight.type)}
                          <div className="flex-1">
                            <h3 className="font-semibold">{insight.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {insight.description}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={getConfidenceColor(insight.confidence)}>
                                {Math.round(insight.confidence * 100)}% confiance
                              </Badge>
                              <Badge variant="outline" className="capitalize">
                                {insight.type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {selectedInsight && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getInsightIcon(selectedInsight.type)}
                      {selectedInsight.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      {selectedInsight.description}
                    </p>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-500">
                          {Math.round(selectedInsight.metrics.frequency * 100)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Fréquence</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-500">
                          {Math.round(selectedInsight.metrics.correlation * 100)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Corrélation</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-500">
                          {Math.round(selectedInsight.metrics.impact * 100)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Impact</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Recommandations:</h4>
                      <ul className="space-y-1">
                        {selectedInsight.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        Utile
                      </Button>
                      <Button variant="outline" size="sm">
                        <ThumbsDown className="w-4 h-4 mr-1" />
                        Pas utile
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4 mr-1" />
                        Partager
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Visualization Tab */}
          <TabsContent value="visualization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="w-5 h-5" />
                  Visualisation du Graphe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-muted/20 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/25">
                  <div className="text-center text-muted-foreground">
                    <Network className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">Visualisation interactive du graphe</p>
                    <p className="text-sm mb-4">Explorez les relations entre les entités</p>
                    <div className="flex gap-2 justify-center">
                      <Button variant="outline" size="sm">
                        <Play className="w-4 h-4 mr-1" />
                        Force
                      </Button>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="w-4 h-4 mr-1" />
                        Hiérarchique
                      </Button>
                      <Button variant="outline" size="sm">
                        <PieChart className="w-4 h-4 mr-1" />
                        Circulaire
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learning Tab */}
          <TabsContent value="learning" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Apprentissage Continu
                </CardTitle>
                <CardDescription>
                  Le système s'améliore automatiquement avec chaque ticket résolu
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">Statistiques d'apprentissage</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Taux de réussite</span>
                          <span>87%</span>
                        </div>
                        <Progress value={87} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Vitesse d'apprentissage</span>
                          <span>{Math.round(graphStats.learningRate * 100)}%</span>
                        </div>
                        <Progress value={graphStats.learningRate * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Tickets analysés</span>
                          <span>1,247</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Performances récentes</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Dernière semaine</span>
                        <span className="text-green-500">+12%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Dernier mois</span>
                        <span className="text-green-500">+28%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Précision globale</span>
                        <span className="text-blue-500">89%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    Le système a identifié 3 nouvelles corrélations cette semaine et a amélioré sa précision de 12%.
                  </AlertDescription>
                </Alert>
                
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Exporter les données
                  </Button>
                  <Button variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Réinitialiser l'apprentissage
                  </Button>
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Paramètres avancés
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced NLP Tab */}
          <TabsContent value="nlp" className="space-y-6">
            <AdvancedNLP />
          </TabsContent>

          {/* Real-time Processing Tab */}
          <TabsContent value="realtime" className="space-y-6">
            <RealTimeProcessing />
          </TabsContent>

          {/* AR/VR Integration Tab */}
          <TabsContent value="arvr" className="space-y-6">
            <ARVRIntegration />
          </TabsContent>

          {/* SaaS Premium Tab */}
          <TabsContent value="saas" className="space-y-6">
            <SaaSPremium />
          </TabsContent>

          {/* API Service Tab */}
          <TabsContent value="api" className="space-y-6">
            <APIService />
          </TabsContent>

          {/* Consulting Services Tab */}
          <TabsContent value="consulting" className="space-y-6">
            <ConsultingServices />
          </TabsContent>

          {/* Monetization Dashboard Tab */}
          <TabsContent value="monetization" className="space-y-6">
            <MonetizationDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}