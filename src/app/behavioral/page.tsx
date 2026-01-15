'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Brain, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Eye, 
  MessageSquare,
  Settings,
  Zap,
  Target,
  Activity,
  BarChart3
} from 'lucide-react';

interface BehavioralMetrics {
  totalUsers: number;
  activeAdaptations: number;
  frustrationDetection: number;
  urgencyResponse: number;
  satisfactionImprovement: number;
  adaptationAccuracy: number;
}

interface UserBehavior {
  userId: string;
  name: string;
  currentStyle: string;
  emotionalState: string;
  urgencyLevel: string;
  lastAdaptation: string;
  adaptationEffectiveness: number;
}

interface AdaptationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  priority: number;
  enabled: boolean;
  successRate: number;
  usageCount: number;
}

export default function BehavioralDashboard() {
  const [metrics, setMetrics] = useState<BehavioralMetrics>({
    totalUsers: 1247,
    activeAdaptations: 89,
    frustrationDetection: 94,
    urgencyResponse: 87,
    satisfactionImprovement: 76,
    adaptationAccuracy: 82
  });

  const [userBehaviors, setUserBehaviors] = useState<UserBehavior[]>([
    {
      userId: '1',
      name: 'Marie Dubois',
      currentStyle: 'Visuel',
      emotionalState: 'Satisfait',
      urgencyLevel: 'Moyen',
      lastAdaptation: 'Interface simplifiée',
      adaptationEffectiveness: 92
    },
    {
      userId: '2',
      name: 'Jean Martin',
      currentStyle: 'Textuel',
      emotionalState: 'Frustré',
      urgencyLevel: 'Élevé',
      lastAdaptation: 'Escalade senior',
      adaptationEffectiveness: 88
    },
    {
      userId: '3',
      name: 'Sophie Bernard',
      currentStyle: 'Auditif',
      emotionalState: 'Confiant',
      urgencyLevel: 'Bas',
      lastAdaptation: 'Option appel proposée',
      adaptationEffectiveness: 95
    }
  ]);

  const [adaptationRules, setAdaptationRules] = useState<AdaptationRule[]>([
    {
      id: '1',
      name: 'Détection Frustration Élevée',
      trigger: 'Messages > 3/min + Sentiment négatif',
      action: 'Escalade vers expert senior',
      priority: 1,
      enabled: true,
      successRate: 94,
      usageCount: 156
    },
    {
      id: '2',
      name: 'Adaptation Style Visuel',
      trigger: 'Mots-clés visuels détectés',
      action: 'Interface avec captures d\'écran',
      priority: 2,
      enabled: true,
      successRate: 87,
      usageCount: 89
    },
    {
      id: '3',
      name: 'Urgence Critique',
      trigger: 'Rage clicks + Messages urgents',
      action: 'Support immédiat sans file',
      priority: 1,
      enabled: true,
      successRate: 91,
      usageCount: 45
    }
  ]);

  const getEmotionalStateColor = (state: string) => {
    switch (state) {
      case 'Satisfait': return 'bg-green-100 text-green-800';
      case 'Frustré': return 'bg-red-100 text-red-800';
      case 'Confiant': return 'bg-blue-100 text-blue-800';
      case 'Confus': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'Élevé': return 'bg-red-100 text-red-800';
      case 'Moyen': return 'bg-yellow-100 text-yellow-800';
      case 'Bas': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleRule = (ruleId: string) => {
    setAdaptationRules(rules => 
      rules.map(rule => 
        rule.id === ruleId 
          ? { ...rule, enabled: !rule.enabled }
          : rule
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Brain className="w-8 h-8 text-violet-600" />
              Personnalisation Comportementale
            </h1>
            <p className="text-slate-600 mt-2">
              Adaptation en temps réel des interactions utilisateur
            </p>
          </div>
          <Button className="bg-violet-600 hover:bg-violet-700">
            <Settings className="w-4 h-4 mr-2" />
            Configuration IA
          </Button>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Utilisateurs Actifs</p>
                  <p className="text-2xl font-bold text-slate-900">{metrics.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Adaptations</p>
                  <p className="text-2xl font-bold text-slate-900">{metrics.activeAdaptations}</p>
                </div>
                <Zap className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Détection Frustration</p>
                  <p className="text-2xl font-bold text-slate-900">{metrics.frustrationDetection}%</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Réponse Urgence</p>
                  <p className="text-2xl font-bold text-slate-900">{metrics.urgencyResponse}%</p>
                </div>
                <Activity className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Amélioration Satisfaction</p>
                  <p className="text-2xl font-bold text-slate-900">+{metrics.satisfactionImprovement}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Précision Adaptation</p>
                  <p className="text-2xl font-bold text-slate-900">{metrics.adaptationAccuracy}%</p>
                </div>
                <Target className="w-8 h-8 text-violet-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Comportements Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Règles d'Adaptation
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytiques
            </TabsTrigger>
            <TabsTrigger value="predictions" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Prédictions IA
            </TabsTrigger>
          </TabsList>

          {/* User Behaviors Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Comportements en Temps Réel
                </CardTitle>
                <CardDescription>
                  Analyse comportementale et adaptations actives
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userBehaviors.map((user) => (
                    <div key={user.userId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{user.name}</p>
                          <p className="text-sm text-slate-600">Style: {user.currentStyle}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge className={getEmotionalStateColor(user.emotionalState)}>
                          {user.emotionalState}
                        </Badge>
                        <Badge className={getUrgencyColor(user.urgencyLevel)}>
                          {user.urgencyLevel}
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-900">{user.lastAdaptation}</p>
                          <p className="text-xs text-slate-600">Efficacité: {user.adaptationEffectiveness}%</p>
                        </div>
                        <Progress value={user.adaptationEffectiveness} className="w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Adaptation Rules Tab */}
          <TabsContent value="rules" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Règles d'Adaptation Automatique
                </CardTitle>
                <CardDescription>
                  Configurez les règles de détection et d'adaptation comportementale
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adaptationRules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-slate-900">{rule.name}</h3>
                          <Badge variant={rule.priority === 1 ? 'destructive' : 'secondary'}>
                            Priorité {rule.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-1">
                          <strong>Déclencheur:</strong> {rule.trigger}
                        </p>
                        <p className="text-sm text-slate-600">
                          <strong>Action:</strong> {rule.action}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-slate-500">
                            Succès: {rule.successRate}% ({rule.usageCount} utilisations)
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={() => toggleRule(rule.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance des Adaptations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Taux de Réussite Global</span>
                        <span className="text-sm">82%</span>
                      </div>
                      <Progress value={82} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Satisfaction Utilisateurs</span>
                        <span className="text-sm">76%</span>
                      </div>
                      <Progress value={76} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Précision de Détection</span>
                        <span className="text-sm">89%</span>
                      </div>
                      <Progress value={89} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Impact sur les KPIs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Temps de Résolution</span>
                      <span className="text-sm font-medium text-green-600">-34%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Taux de Satisfaction</span>
                      <span className="text-sm font-medium text-green-600">+28%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Escalades Réduites</span>
                      <span className="text-sm font-medium text-green-600">-41%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Engagement Utilisateur</span>
                      <span className="text-sm font-medium text-green-600">+52%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Prédictions Comportementales par IA
                </CardTitle>
                <CardDescription>
                  Modèles prédictifs pour anticiper les besoins utilisateurs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium text-slate-900 mb-2">Risque de Frustration</h3>
                    <p className="text-2xl font-bold text-red-600 mb-1">23%</p>
                    <p className="text-sm text-slate-600">Utilisateurs à risque</p>
                    <Button variant="outline" size="sm" className="mt-3 w-full">
                      Voir les prédictions
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium text-slate-900 mb-2">Opportunités de Proactivité</h3>
                    <p className="text-2xl font-bold text-blue-600 mb-1">47</p>
                    <p className="text-sm text-slate-600">Interventions suggérées</p>
                    <Button variant="outline" size="sm" className="mt-3 w-full">
                      Analyser les opportunités
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium text-slate-900 mb-2">Précision du Modèle</h3>
                    <p className="text-2xl font-bold text-green-600 mb-1">91%</p>
                    <p className="text-sm text-slate-600">Fiabilité des prédictions</p>
                    <Button variant="outline" size="sm" className="mt-3 w-full">
                      Optimiser le modèle
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}