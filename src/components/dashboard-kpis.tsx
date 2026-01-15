'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Ticket, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  Package,
  DollarSign,
  Download,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface KPIData {
  periode: number;
  generaux: {
    totalTickets: number;
    ticketsPeriode: number;
    ticketsResolus: number;
    ticketsEnCours: number;
    ticketsCritiques: number;
    tauxResolution: number;
    tempsResolutionMoyen: number | null;
  };
  distribution: {
    byStatus: Array<{ status: string; _count: { id: number } }>;
    byPriority: Array<{ priorite: string; _count: { id: number } }>;
    byCategory: Array<{ categorie: string; _count: { id: number } }>;
  };
  performance: {
    agents: Array<{ agentId: string; agentName: string; ticketCount: number }>;
    satisfaction: {
      moyenne: number;
      totalEnquetes: number;
      tauxReponse: number;
      distribution: Record<number, number>;
    };
  };
  stock: {
    totalItems: number;
    lowStockItems: number;
    stockValue: number;
    pendingOrders: number;
  };
  evolution: Array<any>;
}

export function DashboardKPIs() {
  const [kpiData, setKPIData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  const fetchKPIs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reports/kpis?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setKPIData(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des KPIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (type: string) => {
    try {
      const params = new URLSearchParams();
      params.append('format', 'csv');
      params.append('type', type);
      if (period !== '30') {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(period));
        params.append('dateDebut', startDate.toISOString().split('T')[0]);
        params.append('dateFin', endDate.toISOString().split('T')[0]);
      }

      const response = await fetch(`/api/reports/export?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    }
  };

  useEffect(() => {
    fetchKPIs();
  }, [period]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des KPIs...</p>
        </div>
      </div>
    );
  }

  if (!kpiData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Impossible de charger les KPIs</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'OUVERT': 'text-red-600',
      'EN_DIAGNOSTIC': 'text-yellow-600',
      'EN_REPARATION': 'text-blue-600',
      'REPARÉ': 'text-green-600',
      'FERMÉ': 'text-gray-600'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'BASSE': 'text-green-600',
      'MOYENNE': 'text-yellow-600',
      'HAUTE': 'text-orange-600',
      'CRITIQUE': 'text-red-600'
    };
    return colors[priority as keyof typeof colors] || 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec contrôles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tableau de Bord</h2>
          <p className="text-muted-foreground">
            KPIs des derniers {period} jours
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 jours</SelectItem>
              <SelectItem value="30">30 jours</SelectItem>
              <SelectItem value="90">90 jours</SelectItem>
              <SelectItem value="365">1 an</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => exportData('tickets')}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.generaux.totalTickets}</div>
            <p className="text-xs text-muted-foreground">
              +{kpiData.generaux.ticketsPeriode} cette période
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux Résolution</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.generaux.tauxResolution.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {kpiData.generaux.ticketsResolus} résolus
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps Moyen</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpiData.generaux.tempsResolutionMoyen ? `${kpiData.generaux.tempsResolutionMoyen}j` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Temps de résolution moyen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Critiques</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{kpiData.generaux.ticketsCritiques}</div>
            <p className="text-xs text-muted-foreground">
              Requiert attention immédiate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques et statistiques détaillées */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Distribution par statut */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribution par Statut
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {kpiData.distribution.byStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`} />
                    <span className="text-sm font-medium">{item.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{item._count.id}</span>
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getStatusColor(item.status)}`}
                        style={{ width: `${(item._count.id / kpiData.generaux.totalTickets) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Distribution par priorité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Distribution par Priorité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {kpiData.distribution.byPriority.map((item) => (
                <div key={item.priorite} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(item.priorite)}`} />
                    <span className="text-sm font-medium">{item.priorite}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{item._count.id}</span>
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getPriorityColor(item.priorite)}`}
                        style={{ width: `${(item._count.id / kpiData.generaux.totalTickets) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance des agents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Performance des Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {kpiData.performance.agents.slice(0, 5).map((agent) => (
                <div key={agent.agentId} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{agent.agentName}</div>
                    <div className="text-xs text-muted-foreground">{agent.ticketCount} tickets</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Actif</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Statistiques de stock */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Statistiques de Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold">{kpiData.stock.totalItems}</div>
                <p className="text-xs text-muted-foreground">Articles totaux</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{kpiData.stock.lowStockItems}</div>
                <p className="text-xs text-muted-foreground">Stock bas</p>
              </div>
              <div>
                <div className="text-2xl font-bold">{kpiData.stock.stockValue.toFixed(0)}€</div>
                <p className="text-xs text-muted-foreground">Valeur totale</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{kpiData.stock.pendingOrders}</div>
                <p className="text-xs text-muted-foreground">Commandes en cours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Satisfaction client */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Satisfaction Client
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {kpiData.performance.satisfaction.moyenne.toFixed(1)}/5
              </div>
              <p className="text-sm text-muted-foreground">Note moyenne</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {(kpiData.performance.satisfaction.tauxReponse * 100).toFixed(0)}%
              </div>
              <p className="text-sm text-muted-foreground">Taux de réponse</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{kpiData.performance.satisfaction.totalEnquetes}</div>
              <p className="text-sm text-muted-foreground">Enquêtes totales</p>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Distribution des notes</span>
            </div>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((note) => (
                <div key={note} className="flex items-center gap-2">
                  <span className="text-sm w-8">{note}⭐</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ 
                        width: `${(kpiData.performance.satisfaction.distribution[note] || 0) / kpiData.performance.satisfaction.totalEnquetes * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">
                    {kpiData.performance.satisfaction.distribution[note] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}