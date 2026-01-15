'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Building, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Phone,
  Mail,
  Calendar,
  RefreshCw,
  Database,
  Target,
  Lightbulb
} from 'lucide-react';
import { toast } from 'sonner';

interface Customer360 {
  customerId: string;
  overview: {
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    segment?: string;
    tier?: string;
    status?: string;
  };
  metrics: {
    totalRevenue: number;
    lifetimeValue: number;
    supportTickets: number;
    satisfactionScore: number;
    lastInteraction?: string;
    nextRenewal?: string;
  };
  support: {
    tickets: any[];
    openTickets: number;
    averageResolutionTime: number;
    escalationRate: number;
  };
  sales: {
    opportunities: any[];
    deals: any[];
    totalDealValue: number;
    conversionRate: number;
  };
  billing: {
    subscriptions: any[];
    invoices: any[];
    paymentHistory: any[];
    outstandingBalance: number;
  };
  interactions: {
    emails: any[];
    calls: any[];
    meetings: any[];
    supportInteractions: any[];
  };
  insights: {
    riskLevel: string;
    churnProbability: number;
    upsellOpportunities: string[];
    recommendedActions: string[];
  };
}

interface CrmErpIntegration {
  id: string;
  name: string;
  type: string;
  status: string;
  lastSync?: string;
  config: any;
}

export default function BiCrmErpIntegration() {
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [customer360, setCustomer360] = useState<Customer360 | null>(null);
  const [integrations, setIntegrations] = useState<CrmErpIntegration[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/bi/crm-erp');
      const data = await response.json();
      setIntegrations(data.integrations || []);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast.error('Erreur lors du chargement des intégrations');
    }
  };

  const fetchCustomer360 = async (customerId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/bi/crm-erp?customerId=${customerId}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setCustomer360(data);
      setActiveTab('overview');
    } catch (error) {
      console.error('Error fetching customer 360:', error);
      toast.error('Erreur lors du chargement du profil client');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (integrationId: string, type: string) => {
    setSyncing(integrationId);
    try {
      const response = await fetch('/api/bi/crm-erp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          config: { integrationId },
          data: {},
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Synchronisation ${type} réussie`);
        fetchIntegrations();
      } else {
        throw new Error(result.error || 'Sync failed');
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error(`Erreur lors de la synchronisation ${type}`);
    } finally {
      setSyncing(null);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'High':
        return 'text-red-600 bg-red-50';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-green-600 bg-green-50';
    }
  };

  const getRiskLevelIcon = (level: string) => {
    switch (level) {
      case 'High':
        return <AlertTriangle className="h-4 w-4" />;
      case 'Medium':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'salesforce':
        return <Database className="h-5 w-5 text-blue-600" />;
      case 'hubspot':
        return <Database className="h-5 w-5 text-orange-600" />;
      case 'sap':
        return <Database className="h-5 w-5 text-blue-800" />;
      case 'netsuite':
        return <Database className="h-5 w-5 text-green-600" />;
      default:
        return <Database className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      error: 'destructive',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Intégrations CRM/ERP</h2>
          <p className="text-muted-foreground">
            Vue 360° des clients et synchronisation des données
          </p>
        </div>
        <Button onClick={fetchIntegrations} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Customer Search */}
      <Card>
        <CardHeader>
          <CardTitle>Recherche Client 360°</CardTitle>
          <CardDescription>
            Accédez à la vue complète du client avec données enrichies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="ID Client, email, nom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && searchTerm.trim()) {
                    setSelectedCustomer(searchTerm.trim());
                    fetchCustomer360(searchTerm.trim());
                  }
                }}
              />
            </div>
            <Button 
              onClick={() => {
                if (searchTerm.trim()) {
                  setSelectedCustomer(searchTerm.trim());
                  fetchCustomer360(searchTerm.trim());
                }
              }}
              disabled={!searchTerm.trim() || loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customer 360 View */}
      {customer360 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Vue 360° - {customer360.overview.name}
                </CardTitle>
                <CardDescription>
                  Profil client complet avec données multi-sources
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getRiskLevelColor(customer360.insights.riskLevel)}>
                  {getRiskLevelIcon(customer360.insights.riskLevel)}
                  Risque: {customer360.insights.riskLevel}
                </Badge>
                <Badge variant="outline">
                  {customer360.overview.tier}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Aperçu</TabsTrigger>
                <TabsTrigger value="metrics">Métriques</TabsTrigger>
                <TabsTrigger value="support">Support</TabsTrigger>
                <TabsTrigger value="sales">Ventes</TabsTrigger>
                <TabsTrigger value="billing">Facturation</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Informations Générales</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{customer360.overview.company}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{customer360.overview.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{customer360.overview.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{customer360.overview.segment}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Statut</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Statut client</span>
                        <Badge variant={customer360.overview.status === 'Active' ? 'default' : 'secondary'}>
                          {customer360.overview.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Niveau</span>
                        <Badge variant="outline">{customer360.overview.tier}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Prochain renouvellement</span>
                      </div>
                      <div className="text-sm font-medium">
                        {customer360.metrics.nextRenewal ? 
                          new Date(customer360.metrics.nextRenewal).toLocaleDateString() : 
                          'Non défini'
                        }
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Dernière Interaction</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {customer360.metrics.lastInteraction ? 
                            new Date(customer360.metrics.lastInteraction).toLocaleDateString() : 
                            'Aucune interaction'
                          }
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="metrics" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Revenu Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {customer360.metrics.totalRevenue.toLocaleString()}€
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Valeur Vie Client</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {customer360.metrics.lifetimeValue.toLocaleString()}€
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Tickets Support</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {customer360.metrics.supportTickets}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Satisfaction</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {customer360.metrics.satisfactionScore.toFixed(1)}/5
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="support" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Tickets Ouverts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {customer360.support.openTickets}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Temps de Résolution Moyen</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {customer360.support.averageResolutionTime.toFixed(1)}h
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Taux d'Escalade</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {(customer360.support.escalationRate * 100).toFixed(1)}%
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="sales" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Valeur Totale des Deals</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {customer360.sales.totalDealValue.toLocaleString()}€
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Taux de Conversion</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {(customer360.sales.conversionRate * 100).toFixed(1)}%
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="billing" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Solde Impayé</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {customer360.billing.outstandingBalance.toLocaleString()}€
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Abonnements Actifs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {customer360.billing.subscriptions.length}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="insights" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Probabilité de Churn
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {(customer360.insights.churnProbability * 100).toFixed(1)}%
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${customer360.insights.churnProbability * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Opportunités d'Upsell
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {customer360.insights.upsellOpportunities.map((opportunity, index) => (
                          <Badge key={index} variant="outline" className="mr-2 mb-2">
                            {opportunity}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Actions Recommandées</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {customer360.insights.recommendedActions.map((action, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{action}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* CRM/ERP Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Intégrations Configurées</CardTitle>
          <CardDescription>
            Gérez vos connexions avec les systèmes CRM et ERP
          </CardDescription>
        </CardHeader>
        <CardContent>
          {integrations.length === 0 ? (
            <div className="text-center py-8">
              <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Aucune intégration CRM/ERP configurée
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {integrations.map((integration) => (
                <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getIntegrationIcon(integration.type)}
                    <div>
                      <h3 className="font-medium">{integration.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {integration.type}
                      </p>
                      {integration.lastSync && (
                        <p className="text-xs text-muted-foreground">
                          Dernière synchro: {new Date(integration.lastSync).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(integration.status)}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSync(integration.id, integration.type)}
                      disabled={syncing === integration.id}
                    >
                      {syncing === integration.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}