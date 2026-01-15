'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, 
  MessageSquare,
  Zap,
  BookOpen,
  Target,
  TrendingUp,
  Lightbulb,
  FileText,
  Languages,
  Cpu,
  Radio,
  Eye,
  Download,
  Upload,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

interface NLPAnalysis {
  id: string;
  text: string;
  entities: Array<{
    name: string;
    type: string;
    confidence: number;
    position: { start: number; end: number };
  }>;
  sentiment: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
    confidence: number;
  };
  intent: {
    label: string;
    confidence: number;
    parameters: Record<string, any>;
  };
  summary: string;
  keywords: string[];
  language: string;
  complexity: {
    score: number;
    level: 'low' | 'medium' | 'high';
  };
  embeddings: number[];
  createdAt: Date;
}

interface GPT4Insight {
  id: string;
  type: 'pattern' | 'prediction' | 'recommendation' | 'explanation';
  title: string;
  content: string;
  confidence: number;
  context: string;
  sources: string[];
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

interface ProcessingMetrics {
  totalProcessed: number;
  averageTime: number;
  accuracy: number;
  throughput: number;
  errorRate: number;
  modelVersion: string;
  lastUpdate: Date;
}

export function AdvancedNLP() {
  const [inputText, setInputText] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4-turbo');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analyses, setAnalyses] = useState<NLPAnalysis[]>([]);
  const [insights, setInsights] = useState<GPT4Insight[]>([]);
  const [metrics, setMetrics] = useState<ProcessingMetrics>({
    totalProcessed: 0,
    averageTime: 0,
    accuracy: 0,
    throughput: 0,
    errorRate: 0,
    modelVersion: 'gpt-4-turbo',
    lastUpdate: new Date()
  });
  const [activeTab, setActiveTab] = useState('analysis');
  const [realTimeMode, setRealTimeMode] = useState(false);

  useEffect(() => {
    loadMetrics();
    loadRecentAnalyses();
    loadInsights();
  }, []);

  const loadMetrics = async () => {
    try {
      const response = await fetch('/api/knowledge-graph/nlp/metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const loadRecentAnalyses = async () => {
    try {
      const response = await fetch('/api/knowledge-graph/nlp/analyses');
      if (response.ok) {
        const data = await response.json();
        setAnalyses(data.analyses.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading analyses:', error);
    }
  };

  const loadInsights = async () => {
    try {
      const response = await fetch('/api/knowledge-graph/nlp/insights');
      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights);
      }
    } catch (error) {
      console.error('Error loading insights:', error);
    }
  };

  const performAnalysis = async () => {
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/knowledge-graph/nlp/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          model: selectedModel,
          includeEntities: true,
          includeSentiment: true,
          includeIntent: true,
          includeSummary: true,
          includeEmbeddings: true
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnalyses(prev => [data.analysis, ...prev.slice(0, 9)]);
        setMetrics(prev => ({
          ...prev,
          totalProcessed: prev.totalProcessed + 1,
          lastUpdate: new Date()
        }));
      }
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateGPT4Insights = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/knowledge-graph/nlp/gpt4-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: inputText,
          analyses: analyses.slice(0, 3),
          insightTypes: ['pattern', 'prediction', 'recommendation', 'explanation']
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setInsights(prev => [...data.insights, ...prev.slice(0, 7)]);
      }
    } catch (error) {
      console.error('GPT-4 insights error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startRealTimeProcessing = async () => {
    setRealTimeMode(true);
    setIsProcessing(true);
    try {
      const response = await fetch('/api/knowledge-graph/nlp/realtime/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          batchSize: 10,
          interval: 5000
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Real-time processing started:', data);
      }
    } catch (error) {
      console.error('Real-time processing error:', error);
      setRealTimeMode(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const stopRealTimeProcessing = async () => {
    setRealTimeMode(false);
    try {
      const response = await fetch('/api/knowledge-graph/nlp/realtime/stop', {
        method: 'POST',
      });

      if (response.ok) {
        console.log('Real-time processing stopped');
      }
    } catch (error) {
      console.error('Stop real-time processing error:', error);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-500';
      case 'negative': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getComplexityColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      default: return 'text-green-500';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern': return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'prediction': return <Target className="w-4 h-4 text-purple-500" />;
      case 'recommendation': return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      case 'explanation': return <BookOpen className="w-4 h-4 text-green-500" />;
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
            <Brain className="w-6 h-6 text-purple-500" />
            NLP Avancé avec GPT-4
          </h2>
          <p className="text-muted-foreground">
            Analyse linguistique avancée et génération d'insights intelligents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Cpu className="w-3 h-3" />
            {selectedModel}
          </Badge>
          <Badge variant={realTimeMode ? "default" : "secondary"} className="flex items-center gap-1">
            <Radio className="w-3 h-3" />
            {realTimeMode ? "Real-time ON" : "Real-time OFF"}
          </Badge>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Textes analysés</p>
                <p className="text-xl font-bold text-blue-500">{metrics.totalProcessed}</p>
              </div>
              <FileText className="w-6 h-6 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Temps moyen</p>
                <p className="text-xl font-bold text-green-500">{metrics.averageTime}ms</p>
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
                <p className="text-xl font-bold text-purple-500">{Math.round(metrics.accuracy * 100)}%</p>
              </div>
              <Target className="w-6 h-6 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Débit</p>
                <p className="text-xl font-bold text-orange-500">{metrics.throughput}/s</p>
              </div>
              <TrendingUp className="w-6 h-6 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taux d'erreur</p>
                <p className="text-xl font-bold text-red-500">{Math.round(metrics.errorRate * 100)}%</p>
              </div>
              <AlertTriangle className="w-6 h-6 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analysis">Analyse</TabsTrigger>
          <TabsTrigger value="insights">Insights GPT-4</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Analyse Textuelle Avancée
              </CardTitle>
              <CardDescription>
                Analyse complète avec GPT-4 : entités, sentiment, intention, résumé et embeddings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Modèle</label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Texte à analyser</label>
                  <Textarea
                    placeholder="Entrez le texte à analyser (ticket, email, rapport, etc.)"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={6}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={performAnalysis} disabled={isAnalyzing || !inputText.trim()}>
                    <Brain className="w-4 h-4 mr-2" />
                    {isAnalyzing ? 'Analyse...' : 'Analyser'}
                  </Button>
                  <Button variant="outline" onClick={generateGPT4Insights} disabled={isAnalyzing || !inputText.trim()}>
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Générer Insights GPT-4
                  </Button>
                  <Button variant="outline" onClick={() => setInputText('')}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Effacer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Latest Analysis */}
          {analyses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Dernière Analyse</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyses[0] && (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Sentiment</p>
                          <p className={`font-semibold ${getSentimentColor(analyses[0].sentiment.label)}`}>
                            {analyses[0].sentiment.label} ({Math.round(analyses[0].sentiment.confidence * 100)}%)
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Intention</p>
                          <p className="font-semibold">{analyses[0].intent.label}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Complexité</p>
                          <p className={`font-semibold ${getComplexityColor(analyses[0].complexity.level)}`}>
                            {analyses[0].complexity.level}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Langue</p>
                          <p className="font-semibold">{analyses[0].language.toUpperCase()}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Résumé</p>
                        <p className="text-sm bg-muted p-3 rounded">{analyses[0].summary}</p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Entités détectées</p>
                        <div className="flex flex-wrap gap-2">
                          {analyses[0].entities.map((entity, idx) => (
                            <Badge key={idx} variant="outline">
                              {entity.name} ({entity.type})
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Mots-clés</p>
                        <div className="flex flex-wrap gap-2">
                          {analyses[0].keywords.map((keyword, idx) => (
                            <Badge key={idx} variant="secondary">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Insights GPT-4
              </CardTitle>
              <CardDescription>
                Analyses profondes et recommandations générées par GPT-4
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {insights.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun insight disponible. Analysez du texte pour générer des insights.</p>
                  </div>
                ) : (
                  insights.map((insight) => (
                    <Card key={insight.id} className="border-l-4 border-l-purple-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getInsightIcon(insight.type)}
                            <h4 className="font-semibold">{insight.title}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {Math.round(insight.confidence * 100)}%
                            </Badge>
                            <Badge className={`text-xs ${getPriorityColor(insight.priority)}`}>
                              {insight.priority}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{insight.content}</p>
                        {insight.actionable && (
                          <div className="flex items-center gap-2 text-xs text-green-600">
                            <CheckCircle className="w-3 h-3" />
                            Actionnable
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Real-time Tab */}
        <TabsContent value="realtime" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="w-5 h-5" />
                Traitement en Temps Réel
              </CardTitle>
              <CardDescription>
                Apprentissage et analyse continue des données entrantes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Mode Real-time</h4>
                  <p className="text-sm text-muted-foreground">
                    Analyse automatique des nouveaux tickets et commentaires
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={realTimeMode ? "default" : "secondary"}>
                    {realTimeMode ? "Actif" : "Inactif"}
                  </Badge>
                  {!realTimeMode ? (
                    <Button onClick={startRealTimeProcessing} disabled={isProcessing}>
                      <Play className="w-4 h-4 mr-2" />
                      Démarrer
                    </Button>
                  ) : (
                    <Button variant="destructive" onClick={stopRealTimeProcessing}>
                      <Pause className="w-4 h-4 mr-2" />
                      Arrêter
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Modèle</label>
                      <Select value={selectedModel} onValueChange={setSelectedModel}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                          <SelectItem value="gpt-4">GPT-4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Taille du batch</label>
                      <Select defaultValue="10">
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
                      <Select defaultValue="5000">
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
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Statistiques</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">CPU</span>
                        <span className="text-sm font-medium">45%</span>
                      </div>
                      <Progress value={45} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Mémoire</span>
                        <span className="text-sm font-medium">2.3 GB</span>
                      </div>
                      <Progress value={72} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Queue</span>
                        <span className="text-sm font-medium">23 items</span>
                      </div>
                      <Progress value={23} />
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        Dernière mise à jour: {metrics.lastUpdate.toLocaleTimeString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Historique des Analyses
              </CardTitle>
              <CardDescription>
                Historique complet des analyses NLP et insights générés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {analyses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune analyse dans l'historique</p>
                  </div>
                ) : (
                  analyses.map((analysis) => (
                    <Card key={analysis.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-sm line-clamp-2">
                              {analysis.text.substring(0, 100)}...
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {analysis.createdAt.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {analysis.language}
                            </Badge>
                            <Badge className={`text-xs ${getComplexityColor(analysis.complexity.level)}`}>
                              {analysis.complexity.level}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className={getSentimentColor(analysis.sentiment.label)}>
                            {analysis.sentiment.label}
                          </span>
                          <span>{analysis.entities.length} entités</span>
                          <span>{analysis.keywords.length} mots-clés</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}