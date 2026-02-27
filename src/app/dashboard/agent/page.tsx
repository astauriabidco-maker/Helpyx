'use client'

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardKPIs } from '@/components/dashboard-kpis';
import { InventoryManagement } from '@/components/inventory-management';
import { AdvancedSearch } from '@/components/advanced-search';
import {
  BarChart3,
  Package,
  BookOpen,
  Search,
  Settings,
  Download,
  RefreshCw,
  Bell,
  TrendingUp,
  User,
  ArrowLeft,
  Loader2,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Ticket
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface TicketData {
  id: number;
  titre?: string;
  description: string;
  status: string;
  categorie?: string;
  priorite: string;
  assignedTo?: any;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  commentCount: number;
  fileCount: number;
}

interface AgentStats {
  totalTickets: number;
  ticketsOuverts: number;
  ticketsResolus: number;
  ticketsCritiques: number;
  tempsResolutionMoyen: string;
  tauxResolution: number;
}

export default function AgentDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('overview');
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(false);
  const [agentStats, setAgentStats] = useState<AgentStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Charger les stats agent depuis les données réelles
  const fetchAgentStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch('/api/tickets?limit=100');
      if (res.ok) {
        const data = await res.json();
        const allTickets: TicketData[] = data.tickets || [];

        const ouverts = allTickets.filter(t =>
          t.status === 'OUVERT' || t.status === 'EN_DIAGNOSTIC' || t.status === 'EN_REPARATION'
        );
        const resolus = allTickets.filter(t => t.status === 'REPARÉ' || t.status === 'FERMÉ');
        const critiques = allTickets.filter(t =>
          t.priorite === 'CRITIQUE' && t.status !== 'FERMÉ' && t.status !== 'REPARÉ'
        );

        // Calculer temps moyen de résolution
        let avgTime = 'N/A';
        const resolvedWithDates = resolus.filter(t => t.createdAt && t.updatedAt);
        if (resolvedWithDates.length > 0) {
          const totalHours = resolvedWithDates.reduce((sum, t) => {
            const diff = new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime();
            return sum + diff / (1000 * 60 * 60);
          }, 0);
          const avg = totalHours / resolvedWithDates.length;
          if (avg < 1) avgTime = `${Math.round(avg * 60)}min`;
          else if (avg < 24) avgTime = `${avg.toFixed(1)}h`;
          else avgTime = `${(avg / 24).toFixed(1)}j`;
        }

        setAgentStats({
          totalTickets: allTickets.length,
          ticketsOuverts: ouverts.length,
          ticketsResolus: resolus.length,
          ticketsCritiques: critiques.length,
          tempsResolutionMoyen: avgTime,
          tauxResolution: allTickets.length > 0
            ? Math.round((resolus.length / allTickets.length) * 100)
            : 0,
        });
      }
    } catch (error) {
      console.error('Erreur stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgentStats();
  }, [fetchAgentStats]);

  const handleFiltersChange = async (filters: any) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value as string);
      });

      const response = await fetch(`/api/tickets?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      'OUVERT': { label: 'Ouvert', className: 'bg-blue-100 text-blue-800' },
      'EN_DIAGNOSTIC': { label: 'Diagnostic', className: 'bg-yellow-100 text-yellow-800' },
      'EN_REPARATION': { label: 'Réparation', className: 'bg-orange-100 text-orange-800' },
      'REPARÉ': { label: 'Réparé', className: 'bg-green-100 text-green-800' },
      'FERMÉ': { label: 'Fermé', className: 'bg-gray-100 text-gray-800' },
    };
    const badge = map[status] || { label: status, className: 'bg-gray-100' };
    return <Badge className={badge.className}>{badge.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const map: Record<string, { label: string; className: string }> = {
      'CRITIQUE': { label: 'Critique', className: 'bg-red-600 text-white' },
      'HAUTE': { label: 'Haute', className: 'bg-orange-500 text-white' },
      'MOYENNE': { label: 'Moyenne', className: 'bg-yellow-500 text-white' },
      'BASSE': { label: 'Basse', className: 'bg-green-500 text-white' },
    };
    const badge = map[priority] || { label: priority, className: 'bg-gray-500 text-white' };
    return <Badge className={badge.className}>{badge.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Dashboard Agent</h1>
                <p className="text-muted-foreground">
                  Bienvenue, {session?.user?.name || 'Agent'} — Gestion des tickets
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { fetchAgentStats(); }}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              <Button variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Vue d&apos;ensemble
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Tickets
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Inventaire
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Rapports
            </TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-6">
            <DashboardKPIs />

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Actions Rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <Button className="h-20 flex-col" onClick={() => setActiveTab('tickets')}>
                    <Search className="h-6 w-6 mb-2" />
                    Rechercher tickets
                  </Button>
                  <Link href="/admin/articles" className="w-full">
                    <Button variant="outline" className="h-20 flex-col w-full">
                      <BookOpen className="h-6 w-6 mb-2" />
                      Base de connaissances
                    </Button>
                  </Link>
                  <Button variant="outline" className="h-20 flex-col" onClick={() => setActiveTab('inventory')}>
                    <Package className="h-6 w-6 mb-2" />
                    Inventaire
                  </Button>
                  <Button variant="outline" className="h-20 flex-col" onClick={() => setActiveTab('reports')}>
                    <TrendingUp className="h-6 w-6 mb-2" />
                    Rapports
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recherche de tickets */}
          <TabsContent value="tickets" className="space-y-6">
            <AdvancedSearch
              onFiltersChange={handleFiltersChange}
              loading={loading}
              resultCount={tickets.length}
            />

            {tickets.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Résultats ({tickets.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tickets.map((ticket) => (
                      <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                          <div className="flex items-center gap-4 flex-1">
                            <span className="text-sm font-mono text-muted-foreground">#{ticket.id}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{ticket.titre || 'Sans titre'}</p>
                              <p className="text-sm text-muted-foreground truncate">{ticket.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                            {getPriorityBadge(ticket.priorite)}
                            {getStatusBadge(ticket.status)}
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatDate(ticket.createdAt)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Inventaire */}
          <TabsContent value="inventory" className="space-y-6">
            <InventoryManagement />
          </TabsContent>

          {/* Rapports — Données réelles */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Exports de données</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Tickets</h4>
                    <p className="text-sm text-muted-foreground">
                      Exportez tous les tickets avec leurs détails
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = '/api/reports/export?type=tickets&format=csv';
                          link.download = `tickets_${new Date().toISOString().split('T')[0]}.csv`;
                          link.click();
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        CSV
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Statistiques en temps réel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                  ) : agentStats ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Ticket className="h-4 w-4 text-blue-600" />
                            <span className="text-xs text-muted-foreground">Total tickets</span>
                          </div>
                          <div className="text-2xl font-bold">{agentStats.totalTickets}</div>
                        </div>
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-4 w-4 text-amber-600" />
                            <span className="text-xs text-muted-foreground">En cours</span>
                          </div>
                          <div className="text-2xl font-bold text-amber-600">{agentStats.ticketsOuverts}</div>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Taux de résolution
                        </h4>
                        <div className="text-2xl font-bold text-green-600">{agentStats.tauxResolution}%</div>
                        <p className="text-sm text-muted-foreground">
                          {agentStats.ticketsResolus} ticket{agentStats.ticketsResolus > 1 ? 's' : ''} résolu{agentStats.ticketsResolus > 1 ? 's' : ''}
                        </p>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                          <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${agentStats.tauxResolution}%` }} />
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          Temps moyen de résolution
                        </h4>
                        <div className="text-2xl font-bold">{agentStats.tempsResolutionMoyen}</div>
                      </div>

                      {agentStats.ticketsCritiques > 0 && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <span className="text-sm text-red-700 dark:text-red-300">
                            {agentStats.ticketsCritiques} ticket{agentStats.ticketsCritiques > 1 ? 's' : ''} critique{agentStats.ticketsCritiques > 1 ? 's' : ''} en attente
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">Impossible de charger les statistiques</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}