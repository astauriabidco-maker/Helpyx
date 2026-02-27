'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Activity,
  Zap,
  Radio,
  Play,
  Pause,
  RotateCcw,
  Settings,
  BarChart3,
  TrendingUp,
  Clock,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  CheckCircle,
  AlertTriangle,
  Info,
  Filter,
  Download,
  Upload,
  Eye,
  Target,
  Brain,
  GitBranch,
  RefreshCw,
  MessageSquare,
  FileText
} from 'lucide-react';

interface ProcessingStream {
  id: string;
  source: string;
  type: 'ticket' | 'comment' | 'log' | 'metric';
  status: 'pending' | 'processing' | 'completed' | 'error';
  data: any;
  timestamp: Date;
  processingTime: number;
  confidence: number;
}

interface RealTimeMetrics {
  throughput: number;
  latency: number;
  errorRate: number;
  accuracy: number;
  queueSize: number;
  processingRate: number;
  memoryUsage: number;
  cpuUsage: number;
  networkLatency: number;
  uptime: number;
  lastUpdate: Date;
}

interface ProcessingRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: {
    sourceType: string[];
    keywords: string[];
    confidence: number;
  };
  actions: {
    enrichGraph: boolean;
    generateInsights: boolean;
    sendAlert: boolean;
    updateModel: boolean;
  };
  priority: 'low' | 'medium' | 'high';
}

export function RealTimeProcessing() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [streams, setStreams] = useState<ProcessingStream[]>([]);
  const [metrics, setMetrics] = useState<RealTimeMetrics>({
    throughput: 0,
    latency: 0,
    errorRate: 0,
    accuracy: 0,
    queueSize: 0,
    processingRate: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    networkLatency: 0,
    uptime: 0,
    lastUpdate: new Date()
  });
  const [rules, setRules] = useState<ProcessingRule[]>([]);
  const [selectedSource, setSelectedSource] = useState('all');
  const [batchSize, setBatchSize] = useState('10');
  const [intervalValue, setIntervalValue] = useState('5000');
  const [activeTab, setActiveTab] = useState('dashboard');
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    loadMetrics();
    loadRules();
    loadRecentStreams();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isProcessing) {
      intervalRef.current = globalThis.setInterval(() => {
        loadMetrics();
        simulateNewStream();
      }, 2000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isProcessing]);

  const loadMetrics = async () => {
    try {
      const response = await fetch('/api/knowledge-graph/realtime/metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
      // Simulate metrics for demo
      setMetrics(prev => ({
        ...prev,
        throughput: Math.random() * 100,
        latency: Math.random() * 500,
        errorRate: Math.random() * 5,
        accuracy: 85 + Math.random() * 15,
        queueSize: Math.floor(Math.random() * 50),
        processingRate: Math.random() * 20,
        memoryUsage: 50 + Math.random() * 30,
        cpuUsage: 30 + Math.random() * 40,
        networkLatency: Math.random() * 100,
        uptime: prev.uptime + 2,
        lastUpdate: new Date()
      }));
    }
  };

  const loadRules = async () => {
    try {
      const response = await fetch('/api/knowledge-graph/realtime/rules');
      if (response.ok) {
        const data = await response.json();
        setRules(data.rules);
      }
    } catch (error) {
      console.error('Error loading rules:', error);
      // Demo rules
      setRules([
        {
          id: '1',
          name: 'Détection de pannes critiques',
          description: 'Détecte les pannes système et génère des alertes',
          enabled: true,
          conditions: {
            sourceType: ['ticket', 'log'],
            keywords: ['bsod', 'crash', 'panic', 'critical'],
            confidence: 0.8
          },
          actions: {
            enrichGraph: true,
            generateInsights: true,
            sendAlert: true,
            updateModel: true
          },
          priority: 'high'
        },
        {
          id: '2',
          name: 'Enrichissement automatique',
          description: 'Enrichit le graphe avec les nouvelles entités',
          enabled: true,
          conditions: {
            sourceType: ['ticket', 'comment'],
            keywords: [],
            confidence: 0.6
          },
          actions: {
            enrichGraph: true,
            generateInsights: false,
            sendAlert: false,
            updateModel: false
          },
          priority: 'medium'
        }
      ]);
    }
  };

  const loadRecentStreams = async () => {
    try {
      const response = await fetch('/api/knowledge-graph/realtime/streams');
      if (response.ok) {
        const data = await response.json();
        setStreams(data.streams.slice(0, 10));
      }
    } catch (error) {
      console.error('Error loading streams:', error);
    }
  };

  const simulateNewStream = () => {
    const sources = ['tickets', 'comments', 'logs', 'metrics'];
    const types: ('ticket' | 'comment' | 'log' | 'metric')[] = ['ticket', 'comment', 'log', 'metric'];
    const statuses: ('pending' | 'processing' | 'completed' | 'error')[] = ['pending', 'processing', 'completed', 'error'];

    const newStream: ProcessingStream = {
      id: Date.now().toString(),
      source: sources[Math.floor(Math.random() * sources.length)],
      type: types[Math.floor(Math.random() * types.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      data: { message: `Nouveau ${types[0]} reçu` },
      timestamp: new Date(),
      processingTime: Math.random() * 1000,
      confidence: 0.7 + Math.random() * 0.3
    };

    setStreams(prev => [newStream, ...prev.slice(0, 19)]);
  };

  const startProcessing = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/knowledge-graph/realtime/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batchSize: parseInt(batchSize),
          interval: parseInt(intervalValue),
          sources: selectedSource === 'all' ? ['tickets', 'comments', 'logs', 'metrics'] : [selectedSource]
        }),
      });

      if (response.ok) {
        console.log('Real-time processing started');
      }
    } catch (error) {
      console.error('Error starting processing:', error);
    }
  };

  const stopProcessing = async () => {
    setIsProcessing(false);
    try {
      const response = await fetch('/api/knowledge-graph/realtime/stop', {
        method: 'POST',
      });

      if (response.ok) {
        console.log('Real-time processing stopped');
      }
    } catch (error) {
      console.error('Error stopping processing:', error);
    }
  };

  const toggleRule = async (ruleId: string) => {
    setRules(prev => prev.map(rule =>
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));

    try {
      await fetch(`/api/knowledge-graph/realtime/rules/${ruleId}/toggle`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error toggling rule:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'processing': return 'text-blue-500';
      case 'error': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ticket': return <Database className="w-4 h-4" />;
      case 'comment': return <MessageSquare className="w-4 h-4" />;
      case 'log': return <FileText className="w-4 h-4" />;
      case 'metric': return <BarChart3 className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Radio className="w-6 h-6 text-green-500" />
            Real-time Processing
          </h2>
          <p className="text-muted-foreground">
            Apprentissage continu et analyse en temps réel
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isProcessing ? "default" : "secondary"} className="flex items-center gap-1">
            <Activity className="w-3 h-3" />
            {isProcessing ? "Actif" : "Inactif"}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {Math.floor(metrics.uptime / 60)}min
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Débit</p>
                <p className="text-xl font-bold text-blue-500">{metrics.throughput.toFixed(1)}/s</p>
              </div>
              <TrendingUp className="w-6 h-6 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Latence</p>
                <p className="text-xl font-bold text-green-500">{metrics.latency.toFixed(0)}ms</p>
              </div>
              <Zap className="w-6 h-6 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Précision</p>
                <p className="text-xl font-bold text-purple-500">{metrics.accuracy.toFixed(1)}%</p>
              </div>
              <Target className="w-6 h-6 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Queue</p>
                <p className="text-xl font-bold text-orange-500">{metrics.queueSize}</p>
              </div>
              <Database className="w-6 h-6 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="streams">Flux</TabsTrigger>
          <TabsTrigger value="rules">Règles</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Control Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Panneau de Contrôle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Source</label>
                  <Select value={selectedSource} onValueChange={setSelectedSource}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les sources</SelectItem>
                      <SelectItem value="tickets">Tickets</SelectItem>
                      <SelectItem value="comments">Commentaires</SelectItem>
                      <SelectItem value="logs">Logs système</SelectItem>
                      <SelectItem value="metrics">Métriques</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Taille du batch</label>
                  <Select value={batchSize} onValueChange={setBatchSize}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Intervalle (ms)</label>
                  <Select value={intervalValue} onValueChange={setIntervalValue}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1000">1 seconde</SelectItem>
                      <SelectItem value="5000">5 secondes</SelectItem>
                      <SelectItem value="10000">10 secondes</SelectItem>
                      <SelectItem value="30000">30 secondes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  {!isProcessing ? (
                    <Button onClick={startProcessing} className="flex-1">
                      <Play className="w-4 h-4 mr-2" />
                      Démarrer
                    </Button>
                  ) : (
                    <Button variant="destructive" onClick={stopProcessing} className="flex-1">
                      <Pause className="w-4 h-4 mr-2" />
                      Arrêter
                    </Button>
                  )}
                  <Button variant="outline" onClick={loadMetrics}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  État du Système
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">CPU</span>
                    <span className="text-sm font-medium">{metrics.cpuUsage.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.cpuUsage} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Mémoire</span>
                    <span className="text-sm font-medium">{metrics.memoryUsage.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.memoryUsage} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Réseau</span>
                    <span className="text-sm font-medium">{metrics.networkLatency.toFixed(0)}ms</span>
                  </div>
                  <Progress value={(metrics.networkLatency / 100) * 100} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Taux d'erreur</span>
                    <span className="text-sm font-medium">{metrics.errorRate.toFixed(2)}%</span>
                  </div>
                  <Progress value={metrics.errorRate} />
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Dernière mise à jour: {metrics.lastUpdate.toLocaleTimeString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Streams Tab */}
        <TabsContent value="streams" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                Flux de Données
              </CardTitle>
              <CardDescription>
                Flux de données en temps réel avec statut de traitement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {streams.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Radio className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun flux actif. Démarrez le traitement pour voir les flux.</p>
                  </div>
                ) : (
                  streams.map((stream) => (
                    <div key={stream.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(stream.type)}
                        <div>
                          <p className="font-medium text-sm">{stream.source}</p>
                          <p className="text-xs text-muted-foreground">
                            {stream.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className={`text-sm font-medium ${getStatusColor(stream.status)}`}>
                            {stream.status}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {stream.processingTime.toFixed(0)}ms
                          </p>
                        </div>
                        {getStatusIcon(stream.status)}
                        <Badge variant="outline" className="text-xs">
                          {Math.round(stream.confidence * 100)}%
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Règles de Traitement
              </CardTitle>
              <CardDescription>
                Configurez les règles de traitement automatique
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules.map((rule) => (
                  <Card key={rule.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{rule.name}</h4>
                          <p className="text-sm text-muted-foreground">{rule.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${getPriorityColor(rule.priority)}`}>
                            {rule.priority}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleRule(rule.id)}
                          >
                            {rule.enabled ? 'Désactiver' : 'Activer'}
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium mb-2">Conditions</p>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">
                              Sources: {rule.conditions.sourceType.join(', ')}
                            </p>
                            {rule.conditions.keywords.length > 0 && (
                              <p className="text-xs text-muted-foreground">
                                Mots-clés: {rule.conditions.keywords.join(', ')}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Confiance minimale: {Math.round(rule.conditions.confidence * 100)}%
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-2">Actions</p>
                          <div className="flex flex-wrap gap-1">
                            {rule.actions.enrichGraph && (
                              <Badge variant="secondary" className="text-xs">Enrichir graphe</Badge>
                            )}
                            {rule.actions.generateInsights && (
                              <Badge variant="secondary" className="text-xs">Générer insights</Badge>
                            )}
                            {rule.actions.sendAlert && (
                              <Badge variant="secondary" className="text-xs">Envoyer alerte</Badge>
                            )}
                            {rule.actions.updateModel && (
                              <Badge variant="secondary" className="text-xs">Mettre à jour modèle</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Métriques de Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Débit moyen</p>
                    <p className="text-lg font-bold text-blue-500">
                      {metrics.throughput.toFixed(1)}/s
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Latence moyenne</p>
                    <p className="text-lg font-bold text-green-500">
                      {metrics.latency.toFixed(0)}ms
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Taux de réussite</p>
                    <p className="text-lg font-bold text-purple-500">
                      {(100 - metrics.errorRate).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vitesse de traitement</p>
                    <p className="text-lg font-bold text-orange-500">
                      {metrics.processingRate.toFixed(1)}/s
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Utilisation des Ressources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Cpu className="w-4 h-4" />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="text-sm">CPU</span>
                        <span className="text-sm">{metrics.cpuUsage.toFixed(1)}%</span>
                      </div>
                      <Progress value={metrics.cpuUsage} className="h-2" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <HardDrive className="w-4 h-4" />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="text-sm">Mémoire</span>
                        <span className="text-sm">{metrics.memoryUsage.toFixed(1)}%</span>
                      </div>
                      <Progress value={metrics.memoryUsage} className="h-2" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Wifi className="w-4 h-4" />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="text-sm">Réseau</span>
                        <span className="text-sm">{metrics.networkLatency.toFixed(0)}ms</span>
                      </div>
                      <Progress value={(metrics.networkLatency / 100) * 100} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}