'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  TrendingUp,
  Users,
  DollarSign,
  Target,
  BarChart3,
  Brain,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Building,
  Zap,
  Lightbulb
} from 'lucide-react';
import { Header } from '@/components/header';
import BiIntegrations from '@/components/bi/BiIntegrations';
import BiAlerts from '@/components/bi/BiAlerts';
import BiRoleDashboards from '@/components/bi/BiRoleDashboards';
import BiCrmErpIntegration from '@/components/bi/BiCrmErpIntegration';

interface KPIData {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
}

export default function PredictiveBIDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('3months');

  const [kpiData, setKPIData] = useState<KPIData[]>([
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
  ]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/welcome');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      setTimeout(() => setLoading(false), 1000);
    }
  }, [status]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="w-4 h-4 text-green-500" />;
      case 'down':
        return <ArrowDownRight className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des données prédictives...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header companyName="Helpyx" />

      <main className="container px-4 py-8 md:px-8">
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
                        <span className={`text-sm font-medium ${kpi.trend === 'up' ? 'text-green-600' :
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
                          <Badge variant="outline">3.2%</Badge>
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

            <TabsContent value="integrations" className="space-y-6">
              <Tabs defaultValue="exports" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="exports">Exports</TabsTrigger>
                  <TabsTrigger value="alerts">Alertes</TabsTrigger>
                  <TabsTrigger value="dashboards">Tableaux de bord</TabsTrigger>
                  <TabsTrigger value="crm-erp">CRM/ERP</TabsTrigger>
                </TabsList>

                <TabsContent value="exports">
                  <BiIntegrations />
                </TabsContent>

                <TabsContent value="alerts">
                  <BiAlerts />
                </TabsContent>

                <TabsContent value="dashboards">
                  <BiRoleDashboards />
                </TabsContent>

                <TabsContent value="crm-erp">
                  <BiCrmErpIntegration />
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}