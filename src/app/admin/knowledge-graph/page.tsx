'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, 
  Network, 
  TrendingUp, 
  Activity,
  BarChart3,
  LineChart,
  PieChart,
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
  Pause,
  Lightbulb,
  Search,
  Globe,
  Server,
  Shield,
  Rocket
} from 'lucide-react';
import { useKnowledgeGraph } from '@/hooks/use-knowledge-graph';

interface GraphStats {
  entities: number;
  relations: number;
  confidence: number;
  learningRate: number;
  processedTickets: number;
  accuracy: number;
  avgResolutionTime: number;
  insightsGenerated: number;
}

interface LearningMetrics {
  daily: Array<{ date: string; tickets: number; accuracy: number; insights: number }>;
  weekly: Array<{ week: string; tickets: number; accuracy: number; insights: number }>;
  monthly: Array<{ month: string; tickets: number; accuracy: number; insights: number }>;
}

interface TopEntities {
  equipment: Array<{ name: string; count: number; confidence: number }>;
  errors: Array<{ name: string; count: number; confidence: number }>;
  solutions: Array<{ name: string; count: number; successRate: number }>;
}

export default function KnowledgeGraphDashboard() {
  const [stats, setStats] = useState<GraphStats>({
    entities: 156,
    relations: 342,
    confidence: 0.87,
    learningRate: 0.12,
    processedTickets: 1247,
    accuracy: 0.89,
    avgResolutionTime: 2.3,
    insightsGenerated: 89
  });

  const [learningMetrics, setLearningMetrics] = useState<LearningMetrics>({
    daily: [
      { date: '2024-01-08', tickets: 12, accuracy: 0.85, insights: 3 },
      { date: '2024-01-09', tickets: 18, accuracy: 0.87, insights: 5 },
      { date: '2024-01-10', tickets: 15, accuracy: 0.88, insights: 4 },
      { date: '2024-01-11', tickets: 22, accuracy: 0.89, insights: 7 },
      { date: '2024-01-12', tickets: 19, accuracy: 0.90, insights: 6 },
      { date: '2024-01-13', tickets: 25, accuracy: 0.91, insights: 8 },
      { date: '2024-01-14', tickets: 21, accuracy: 0.89, insights: 7 }
    ],
    weekly: [
      { week: 'S1', tickets: 85, accuracy: 0.84, insights: 22 },
      { week: 'S2', tickets: 92, accuracy: 0.86, insights: 28 },
      { week: 'S3', tickets: 78, accuracy: 0.88, insights: 25 },
      { week: 'S4', tickets: 95, accuracy: 0.89, insights: 31 }
    ],
    monthly: [
      { month: 'Oct', tickets: 320, accuracy: 0.82, insights: 85 },
      { month: 'Nov', tickets: 345, accuracy: 0.85, insights: 92 },
      { month: 'Dec', tickets: 380, accuracy: 0.87, insights: 98 },
      { month: 'Jan', tickets: 1247, accuracy: 0.89, insights: 89 }
    ]
  });

  const [topEntities, setTopEntities] = useState<TopEntities>({
    equipment: [
      { name: 'Dell Latitude 5420', count: 45, confidence: 0.92 },
      { name: 'HP LaserJet Pro', count: 38, confidence: 0.88 },
      { name: 'Cisco Catalyst 2960', count: 32, confidence: 0.85 },
      { name: 'Synology DS220+', count: 28, confidence: 0.90 },
      { name: 'APC Smart-UPS 1500', count: 25, confidence: 0.87 }
    ],
    errors: [
      { name: 'BSOD - Critical Process Died', count: 67, confidence: 0.91 },
      { name: 'Network Connection Failed', count: 54, confidence: 0.86 },
      { name: 'Memory Management Error', count: 48, confidence: 0.88 },
      { name: 'Printer Offline Error', count: 42, confidence: 0.84 },
      { name: 'Driver Error', count: 39, confidence: 0.89 }
    ],
    solutions: [
      { name: 'Update Graphics Drivers', count: 89, successRate: 0.85 },
      { name: 'Restart System', count: 76, successRate: 0.72 },
      { name: 'Reset Printer Spooler', count: 65, successRate: 0.78 },
      { name: 'Run Memory Diagnostic', count: 58, successRate: 0.81 },
      { name: 'Reinstall Network Drivers', count: 52, successRate: 0.83 }
    ]
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('daily');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('accuracy');

  const { loadInsights, insights } = useKnowledgeGraph();

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      // Simuler le rafraîchissement des données
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setStats(prev => ({
        ...prev,
        entities: prev.entities + Math.floor(Math.random() * 5),
        relations: prev.relations + Math.floor(Math.random() * 10),
        processedTickets: prev.processedTickets + Math.floor(Math.random() * 3),
        insightsGenerated: prev.insightsGenerated + Math.floor(Math.random() * 2),
        confidence: Math.min(0.95, prev.confidence + 0.01),
        accuracy: Math.min(0.95, prev.accuracy + 0.01)
      }));
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return 'text-green-500';
    if (confidence > 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'accuracy': return <Target className="h-4 w-4" />;
      case 'tickets': return <Database className="h-4 w-4" />;
      case 'insights': return <Lightbulb className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Brain className="w-8 h-8 text-purple-500" />
              Knowledge Graph Admin
            </h1>
            <p className="text-muted-foreground">
              Dashboard de monitoring et d'administration du graphe de connaissances
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Quotidien</SelectItem>
                <SelectItem value="weekly">Hebdomadaire</SelectItem>
                <SelectItem value="monthly">Mensuel</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={refreshData} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Actualisation...' : 'Actualiser'}
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exporter
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
                  <p className="text-2xl font-bold text-blue-500">{stats.entities}</p>
                  <p className="text-xs text-green-500">+{Math.floor(Math.random() * 10)}%</p>
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
                  <p className="text-2xl font-bold text-green-500">{stats.relations}</p>
                  <p className="text-xs text-green-500">+{Math.floor(Math.random() * 15)}%</p>
                </div>
                <Network className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Précision</p>
                  <p className={`text-2xl font-bold ${getConfidenceColor(stats.accuracy)}`}>
                    {Math.round(stats.accuracy * 100)}%
                  </p>
                  <p className="text-xs text-green-500">+{Math.floor(Math.random() * 3)}%</p>
                </div>
                <Target className="w-8 h-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tickets traités</p>
                  <p className="text-2xl font-bold text-orange-500">{stats.processedTickets}</p>
                  <p className="text-xs text-green-500">+{Math.floor(Math.random() * 20)}%</p>
                </div>
                <Activity className="w-8 h-8 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="learning">Apprentissage</TabsTrigger>
            <TabsTrigger value="entities">Entités</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Performance d'apprentissage
                  </CardTitle>
                  <CardDescription>
                    Évolution de la précision et du nombre de tickets traités
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Taux d'apprentissage</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(stats.learningRate * 100)}%
                      </span>
                    </div>
                    <Progress value={stats.learningRate * 100} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Confiance moyenne</span>
                      <span className={`text-sm ${getConfidenceColor(stats.confidence)}`}>
                        {Math.round(stats.confidence * 100)}%
                      </span>
                    </div>
                    <Progress value={stats.confidence * 100} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Temps de résolution moyen</span>
                      <span className="text-sm text-muted-foreground">
                        {stats.avgResolutionTime}h
                      </span>
                    </div>
                    <Progress value={(1 - stats.avgResolutionTime / 5) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Distribution des entités
                  </CardTitle>
                  <CardDescription>
                    Répartition des types d'entités dans le graphe
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">Équipements</span>
                      </div>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="text-sm">Erreurs</span>
                      </div>
                      <span className="text-sm font-medium">30%</span>
                    </div>
                    <Progress value={30} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Solutions</span>
                      </div>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Activité récente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Nouvelle corrélation détectée</p>
                        <p className="text-xs text-muted-foreground">
                          HP LaserJet Pro -&gt; Network Driver (73% de confiance)
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">Il y a 2 min</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Batch de tickets traité</p>
                        <p className="text-xs text-muted-foreground">
                          25 tickets analysés avec 89% de précision
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">Il y a 15 min</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Nouvel insight généré</p>
                        <p className="text-xs text-muted-foreground">
                          Augmentation de 28% du taux de résolution
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">Il y a 1 h</span>
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
                  <LineChart className="w-5 h-5" />
                  Métriques d'apprentissage
                </CardTitle>
                <CardDescription>
                  Suivi des performances d'apprentissage sur le temps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="accuracy">Précision</SelectItem>
                        <SelectItem value="tickets">Tickets traités</SelectItem>
                        <SelectItem value="insights">Insights générés</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      {getMetricIcon(selectedMetric)}
                      <span className="text-sm font-medium">
                        {selectedMetric === 'accuracy' ? 'Précision' : 
                         selectedMetric === 'tickets' ? 'Tickets traités' : 'Insights générés'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Simulation de graphique */}
                  <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <LineChart className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Graphique d'évolution {selectedMetric === 'accuracy' ? 'de la précision' : 
                                                 selectedMetric === 'tickets' ? 'des tickets traités' : 
                                                 'des insights générés'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Taux de réussite</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500 mb-2">
                      {Math.round(stats.accuracy * 100)}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Prédiction correcte
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Vitesse d'apprentissage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-500 mb-2">
                      {Math.round(stats.learningRate * 100)}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Amélioration par jour
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Impact sur résolution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-500 mb-2">
                      -28%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Temps de résolution
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Entities Tab */}
          <TabsContent value="entities" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-blue-500" />
                    Top Équipements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topEntities.equipment.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.count} occurrences
                          </p>
                        </div>
                        <Badge variant="outline">
                          {Math.round(item.confidence * 100)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Top Erreurs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topEntities.errors.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.count} occurrences
                          </p>
                        </div>
                        <Badge variant="outline">
                          {Math.round(item.confidence * 100)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Top Solutions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topEntities.solutions.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.count} utilisations
                          </p>
                        </div>
                        <Badge variant="outline">
                          {Math.round(item.successRate * 100)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Insights générés automatiquement
                </CardTitle>
                <CardDescription>
                  Découvertes et corrélations identifiées par le Knowledge Graph
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.slice(0, 5).map((insight, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={insight.type === 'correlation' ? 'default' : 'secondary'}>
                              {insight.type}
                            </Badge>
                            <Badge variant="outline">
                              {Math.round(insight.confidence * 100)}% confiance
                            </Badge>
                          </div>
                          <h4 className="font-medium mb-1">{insight.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {insight.description}
                          </p>
                          {insight.recommendations && insight.recommendations.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium mb-1">Recommandations:</p>
                              <ul className="text-xs text-muted-foreground space-y-1">
                                {insight.recommendations.slice(0, 2).map((rec, i) => (
                                  <li key={i}>• {rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(insight.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Paramètres d'apprentissage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Taux d'apprentissage automatique
                    </label>
                    <Select defaultValue="enabled">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enabled">Activé</SelectItem>
                        <SelectItem value="disabled">Désactivé</SelectItem>
                        <SelectItem value="scheduled">Programmé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Seuil de confiance minimum
                    </label>
                    <Select defaultValue="0.7">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.5">50%</SelectItem>
                        <SelectItem value="0.6">60%</SelectItem>
                        <SelectItem value="0.7">70%</SelectItem>
                        <SelectItem value="0.8">80%</SelectItem>
                        <SelectItem value="0.9">90%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Fréquence d'analyse
                    </label>
                    <Select defaultValue="hourly">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">Temps réel</SelectItem>
                        <SelectItem value="hourly">Chaque heure</SelectItem>
                        <SelectItem value="daily">Quotidien</SelectItem>
                        <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Paramètres de sécurité
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Anonymisation des données
                    </label>
                    <Select defaultValue="partial">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucune</SelectItem>
                        <SelectItem value="partial">Partielle</SelectItem>
                        <SelectItem value="full">Complète</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Rétention des données
                    </label>
                    <Select defaultValue="365">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 jours</SelectItem>
                        <SelectItem value="90">90 jours</SelectItem>
                        <SelectItem value="365">1 an</SelectItem>
                        <SelectItem value="1095">3 ans</SelectItem>
                        <SelectItem value="unlimited">Illimité</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Niveau de logging
                    </label>
                    <Select defaultValue="info">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="error">Erreur uniquement</SelectItem>
                        <SelectItem value="warn">Avertissements</SelectItem>
                        <SelectItem value="info">Information</SelectItem>
                        <SelectItem value="debug">Debug</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  Actions système
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button variant="outline" className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Réinitialiser le graphe
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Exporter les données
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Importer des données
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}