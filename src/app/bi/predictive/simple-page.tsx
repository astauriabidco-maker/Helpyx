'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  BarChart3,
  Database,
  Bell,
  Building
} from 'lucide-react';

export default function PredictiveBIDashboard() {
  const [loading, setLoading] = useState(false);

  const kpiData = [
    {
      label: 'Revenus Prévus',
      value: '€284,500',
      change: 12.5,
      trend: 'up',
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-green-600'
    },
    {
      label: 'Taux de Rétention Prédit',
      value: '94.2%',
      change: 2.1,
      trend: 'up',
      icon: <Users className="w-5 h-5" />,
      color: 'text-blue-600'
    },
    {
      label: 'ROI Support',
      value: '324%',
      change: 18.7,
      trend: 'up',
      icon: <Target className="w-5 h-5" />,
      color: 'text-purple-600'
    },
    {
      label: 'Tickets Prévus',
      value: '1,247',
      change: -5.3,
      trend: 'down',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'text-orange-600'
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default:
        return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8 md:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight flex items-center justify-center gap-3">
              <Brain className="w-8 h-8 text-purple-500" />
              Business Intelligence Prédictive
            </h1>
            <p className="text-xl text-muted-foreground">
              Tableau de bord C-Level avec prévisions et recommandations stratégiques
            </p>
          </div>

          {/* KPI Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpiData.map((kpi, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                      <p className="text-2xl font-bold">{kpi.value}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {getTrendIcon(kpi.trend)}
                        <span className={`text-sm font-medium ${
                          kpi.trend === 'up' ? 'text-green-600' : 
                          kpi.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {kpi.change > 0 ? '+' : ''}{kpi.change}%
                        </span>
                      </div>
                    </div>
                    <div className={kpi.color}>
                      {kpi.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content */}
          <Tabs defaultValue="forecasting" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="forecasting">Prévisions</TabsTrigger>
              <TabsTrigger value="resources">Ressources</TabsTrigger>
              <TabsTrigger value="roi">ROI Analyse</TabsTrigger>
              <TabsTrigger value="benchmarking">Benchmarking</TabsTrigger>
              <TabsTrigger value="insights">Insights IA</TabsTrigger>
              <TabsTrigger value="integrations">Intégrations</TabsTrigger>
            </TabsList>

            <TabsContent value="forecasting" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Prévisions de Revenus
                    </CardTitle>
                    <CardDescription>
                      Prédictions basées sur les tendances historiques des tickets
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">Insight Prédictif</h4>
                        <p className="text-sm text-blue-700">
                          Les modèles prévoient une croissance de 28% du revenu support au trimestre prochain,
                          principalement portée par l'adoption du nouveau module IA.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Prédictions de Churn
                    </CardTitle>
                    <CardDescription>
                      Analyse prédictive des risques de départ client
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Risque de churn global</span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                            3.2%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '3.2%' }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Intégrations BI
                  </CardTitle>
                  <CardDescription>
                    Connectez vos outils BI et exportez vos données
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                      <Database className="h-6 w-6" />
                      <span>Power BI</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                      <Database className="h-6 w-6" />
                      <span>Excel</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                      <Database className="h-6 w-6" />
                      <span>Tableau</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                      <Database className="h-6 w-6" />
                      <span>Google Sheets</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Alertes Proactives
                  </CardTitle>
                  <CardDescription>
                    Configurez des alertes basées sur vos seuils critiques
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Alerte de revenu mensuel</h4>
                          <p className="text-sm text-muted-foreground">
                            Se déclenche si le revenu tombe en dessous de 100k€
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Tableaux de Bord par Rôle
                  </CardTitle>
                  <CardDescription>
                    Visualisations adaptées à chaque fonction
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button variant="outline" className="h-16 flex flex-col gap-1">
                      <Building className="h-5 w-5" />
                      <span className="text-sm">CEO</span>
                    </Button>
                    <Button variant="outline" className="h-16 flex flex-col gap-1">
                      <DollarSign className="h-5 w-5" />
                      <span className="text-sm">CFO</span>
                    </Button>
                    <Button variant="outline" className="h-16 flex flex-col gap-1">
                      <Users className="h-5 w-5" />
                      <span className="text-sm">COO</span>
                    </Button>
                    <Button variant="outline" className="h-16 flex flex-col gap-1">
                      <Target className="h-5 w-5" />
                      <span className="text-sm">CMO</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Optimisation des Ressources
                  </CardTitle>
                  <CardDescription>
                    Recommandations basées sur les prédictions de volume
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">Recommandation IA</h4>
                    <p className="text-sm text-purple-700 mb-3">
                      Recrutez 2 agents techniques le mois prochain pour gérer l'augmentation prévue de 15% du volume de tickets.
                    </p>
                    <Button size="sm">
                      <Brain className="w-4 h-4 mr-2" />
                      Voir les détails
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="roi" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Calculateur de ROI Support</CardTitle>
                  <CardDescription>
                    Mesurez l'impact direct de votre support client sur les revenus
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-green-50 rounded">
                      <div className="text-2xl font-bold text-green-600">€2.4M</div>
                      <div className="text-sm text-green-600">Revenus générés</div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded">
                      <div className="text-2xl font-bold text-blue-600">€740K</div>
                      <div className="text-sm text-blue-600">Coûts support</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded">
                      <div className="text-2xl font-bold text-purple-600">324%</div>
                      <div className="text-sm text-purple-600">ROI global</div>
                    </div>
                    <div className="p-4 bg-orange-50 rounded">
                      <div className="text-2xl font-bold text-orange-600">-18%</div>
                      <div className="text-sm text-orange-600">Churn réduit</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="benchmarking" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Benchmarking Anonymisé
                  </CardTitle>
                  <CardDescription>
                    Comparez vos performances avec des entreprises similaires
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Position Concurrentielle</h4>
                    <p className="text-sm text-green-700">
                      Votre entreprise se situe dans le top quartile pour 2 des 4 indicateurs clés,
                      avec une performance globale supérieure de 23% à la moyenne du secteur.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Insights IA et Recommandations Stratégiques
                  </CardTitle>
                  <CardDescription>
                    Analyses avancées générées par IA pour optimiser votre stratégie
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border-l-4 border-green-500 bg-green-50">
                      <h4 className="font-medium text-green-800 mb-2">Automatisation Intelligente</h4>
                      <p className="text-sm text-green-700 mb-2">
                        35% des tickets actuels pourraient être résolus automatiquement avec l'IA
                      </p>
                      <p className="text-xs text-green-600">
                        Économie potentielle: €125K/an
                      </p>
                    </div>
                    
                    <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                      <h4 className="font-medium text-blue-800 mb-2">Expansion Premium</h4>
                      <p className="text-sm text-blue-700 mb-2">
                        22% des clients sont prêts pour une offre premium
                      </p>
                      <p className="text-xs text-blue-600">
                        Revenu additionnel: €340K/an
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}