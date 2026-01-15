'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Zap, 
  Target, 
  TrendingUp,
  Clock,
  CheckCircle,
  Users,
  BarChart3,
  Lightbulb,
  Shield,
  Rocket,
  Cpu,
  MessageSquare,
  GraduationCap
} from 'lucide-react';
import { AIDiagnostic } from '@/components/ai/ai-diagnostic';
import { AgentTraining } from '@/components/ai/agent-training';
import { AutoResponse } from '@/components/ai/auto-response';

export default function AIDemo() {
  const [activeDemo, setActiveDemo] = useState('overview');

  const demoTicket = {
    id: 'TK-DEMO-001',
    description: 'Problème de connexion réseau intermittent depuis 2 jours. La connexion se coupe toutes les 30 minutes environ. J\'ai déjà redémarré le routeur plusieurs fois sans succès.',
    type_panne: 'RÉSEAU',
    priorite: 'HAUTE',
    categorie: 'Connectivité',
    titre: 'Connexion réseau instable',
    symptomes: ['Déconnexions fréquentes', 'Pertes de paquets', 'Lenteur'],
    messages_erreur: ['Timeout de connexion', 'Hôte inaccessible'],
    equipement_type: 'Routeur',
    marque: 'Cisco',
    modele: 'RV340'
  };

  const demoCustomer = {
    id: 'customer-demo-001',
    name: 'Marie Dubois',
    email: 'marie.dubois@entreprise.fr',
    preferences: {
      language: 'fr',
      communicationStyle: 'friendly',
      technicalLevel: 'intermediate'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
              IA Assistant
            </h1>
          </div>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Système de suggestion automatique avec IA pour transformer votre support technique 
            en une expérience intelligente et efficace.
          </p>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Efficacité</p>
                  <p className="text-3xl font-bold text-slate-900">85%</p>
                  <p className="text-xs text-green-600">Pertinence des suggestions</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-full -mr-10 -mt-10"></div>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Vitesse</p>
                  <p className="text-3xl font-bold text-slate-900">2.5x</p>
                  <p className="text-xs text-green-600">Plus rapide que le support traditionnel</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-full -mr-10 -mt-10"></div>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Satisfaction</p>
                  <p className="text-3xl font-bold text-slate-900">4.7/5</p>
                  <p className="text-xs text-green-600">Note moyenne des clients</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
            <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-50 rounded-full -mr-10 -mt-10"></div>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Économie</p>
                  <p className="text-3xl font-bold text-slate-900">40%</p>
                  <p className="text-xs text-green-600">Réduction des coûts de support</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-50 rounded-full -mr-10 -mt-10"></div>
          </Card>
        </div>

        <Tabs value={activeDemo} onValueChange={setActiveDemo} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              Aperçu
            </TabsTrigger>
            <TabsTrigger value="diagnostic" className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              Diagnostic
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Formation
            </TabsTrigger>
            <TabsTrigger value="response" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Réponses
            </TabsTrigger>
          </TabsList>

          {/* Onglet Aperçu */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Cpu className="h-5 w-5 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">Diagnostic Automatique</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    L'IA analyse les symptômes et propose les 3 solutions les plus probables 
                    avec une précision de 85%.
                  </p>
                  <div className="space-y-2">
                    <Badge variant="outline">⚡ Analyse en temps réel</Badge>
                    <Badge variant="outline">🎯 3 solutions probables</Badge>
                    <Badge variant="outline">📊 85% de pertinence</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <CardTitle className="text-lg">Prédictions de Pannes</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Basées sur l'historique pour anticiper les problèmes avant qu'ils ne surviennent.
                  </p>
                  <div className="space-y-2">
                    <Badge variant="outline">🔮 Anticipation</Badge>
                    <Badge variant="outline">📈 Historique analysé</Badge>
                    <Badge variant="outline">🛡️ Prévention</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-purple-600" />
                    </div>
                    <CardTitle className="text-lg">Réponses Auto-générées</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Templates personnalisés avec 85% de pertinence pour accélérer le support.
                  </p>
                  <div className="space-y-2">
                    <Badge variant="outline">📝 Templates intelligents</Badge>
                    <Badge variant="outline">🎨 Personnalisation</Badge>
                    <Badge variant="outline">⚡ 85% pertinent</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-orange-600" />
                    </div>
                    <CardTitle className="text-lg">Formation Agents</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    L'IA suggère les meilleures pratiques en temps réel pour améliorer les compétences.
                  </p>
                  <div className="space-y-2">
                    <Badge variant="outline">🎓 Formation continue</Badge>
                    <Badge variant="outline">💡 Suggestions temps réel</Badge>
                    <Badge variant="outline">📊 Analyse des écarts</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-red-600" />
                    </div>
                    <CardTitle className="text-lg">Sécurité Renforcée</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Détection automatique des menaces et suggestions de sécurisation.
                  </p>
                  <div className="space-y-2">
                    <Badge variant="outline">🔒 Menaces détectées</Badge>
                    <Badge variant="outline">🛡️ Sécurisation proactive</Badge>
                    <Badge variant="outline">🚨 Alertes en temps réel</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Lightbulb className="h-5 w-5 text-yellow-600" />
                    </div>
                    <CardTitle className="text-lg">Intelligence Collective</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Apprentissage continu à partir de toutes les interactions pour améliorer les performances.
                  </p>
                  <div className="space-y-2">
                    <Badge variant="outline">🧠 Apprentissage auto</Badge>
                    <Badge variant="outline">📈 Amélioration continue</Badge>
                    <Badge variant="outline">🔄 Optimisation</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Impact sur les performances */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Impact Mesuré sur les Performances
                </CardTitle>
                <CardDescription>
                  Résultats concrets après implémentation de l'IA Assistant
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">-60%</div>
                    <p className="text-sm text-gray-600">Temps de résolution</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">+45%</div>
                    <p className="text-sm text-gray-600">Taux de résolution au premier contact</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">+35%</div>
                    <p className="text-sm text-gray-600">Satisfaction client</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">-50%</div>
                    <p className="text-sm text-gray-600">Escalades</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Diagnostic */}
          <TabsContent value="diagnostic">
            <AIDiagnostic 
              ticketData={demoTicket}
              onSolutionSelect={(solution) => {
                console.log('Solution sélectionnée:', solution);
              }}
            />
          </TabsContent>

          {/* Onglet Formation */}
          <TabsContent value="training">
            <AgentTraining 
              agentId="agent-demo-001"
              currentTicket={demoTicket}
              currentAction="diagnostic"
            />
          </TabsContent>

          {/* Onglet Réponses */}
          <TabsContent value="response">
            <AutoResponse 
              ticketData={demoTicket}
              customerData={demoCustomer}
              onResponseGenerated={(response) => {
                console.log('Réponse générée:', response);
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}