'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Ticket,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  Settings,
  Search,
  Filter,
  BarChart3,
  Activity,
  DollarSign,
  Server,
  Shield,
  Database,
  Cpu,
  Package,
  BookOpen,
  AlertTriangle,
  Clock,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useSocket } from '@/hooks/useSocket';

interface AdminStats {
  totalUsers: number;
  totalAgents: number;
  admins: number;
  totalTickets: number;
  activeTickets: number;
  resolvedTickets: number;
  criticalTickets: number;
  resolutionRate: number;
  inventoryCount: number;
  lowStockCount: number;
  articlesCount: number;
}

interface RecentTicket {
  id: number;
  titre: string | null;
  status: string;
  priorite: string;
  createdAt: string;
  user: { name: string | null; email: string };
  assignedTo: { name: string | null; email: string } | null;
}

interface RecentActivity {
  id: string;
  user: string;
  action: string;
  type: string;
  timestamp: string;
}

interface StatsData {
  stats: AdminStats;
  ticketsByStatus: Record<string, number>;
  ticketsByPriority: Record<string, number>;
  recentTickets: RecentTicket[];
  recentActivities: RecentActivity[];
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isConnected, on, off, declareOnline } = useSocket();

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Erreur de chargement');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError('Impossible de charger les statistiques');
      console.error('Fetch stats error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      declareOnline(session.user.id, 'ADMIN');
    }

    const handleUpdate = () => fetchStats();
    on('ticket_update', handleUpdate);
    on('notification', handleUpdate);

    return () => {
      off('ticket_update', handleUpdate);
      off('notification', handleUpdate);
    }
  }, [on, off, session, declareOnline]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      'OUVERT': { label: 'Ouvert', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      'EN_DIAGNOSTIC': { label: 'Diagnostic', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      'EN_REPARATION': { label: 'Réparation', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
      'REPARÉ': { label: 'Réparé', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      'FERMÉ': { label: 'Fermé', className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' },
      'ANNULÉ': { label: 'Annulé', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    };
    const badge = map[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-slate-600 dark:text-slate-400">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">{error || 'Erreur de chargement'}</p>
            <Button onClick={fetchStats}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { stats, ticketsByStatus, ticketsByPriority, recentTickets, recentActivities } = data;

  return (
    <div>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tableau de Bord Administrateur</h1>
            <p className="text-muted-foreground">
              Vue d'ensemble de l'activité du support informatique.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isConnected && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                En temps réel
              </div>
            )}
            <Button onClick={fetchStats} variant="outline" className="gap-2">
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button className="gap-2">
              <FileText className="h-4 w-4" />
              Rapport
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalAgents} agents · {stats.admins} admins
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tickets actifs</CardTitle>
              <Ticket className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.activeTickets}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalTickets} au total
                {stats.criticalTickets > 0 && (
                  <span className="text-red-600 ml-1">· {stats.criticalTickets} critique{stats.criticalTickets > 1 ? 's' : ''}</span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de résolution</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.resolutionRate}%
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.resolvedTickets} ticket{stats.resolvedTickets > 1 ? 's' : ''} résolu{stats.resolvedTickets > 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventaire</CardTitle>
              <Package className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.inventoryCount}</div>
              <p className="text-xs text-muted-foreground">
                pièces · {stats.articlesCount} articles KB
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="activity">Activité</TabsTrigger>
          </TabsList>

          {/* Onglet Aperçu */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Répartition par statut */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Tickets par statut
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries({
                    'OUVERT': { label: 'Ouverts', color: 'bg-blue-500' },
                    'EN_DIAGNOSTIC': { label: 'En diagnostic', color: 'bg-yellow-500' },
                    'EN_REPARATION': { label: 'En réparation', color: 'bg-orange-500' },
                    'REPARÉ': { label: 'Réparés', color: 'bg-green-500' },
                    'FERMÉ': { label: 'Fermés', color: 'bg-gray-400' },
                  }).map(([status, { label, color }]) => {
                    const count = ticketsByStatus[status] || 0;
                    const pct = stats.totalTickets > 0 ? (count / stats.totalTickets) * 100 : 0;
                    return (
                      <div key={status} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{label}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Répartition par priorité */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Tickets par priorité
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries({
                    'CRITIQUE': { label: 'Critique', color: 'bg-red-600' },
                    'HAUTE': { label: 'Haute', color: 'bg-orange-500' },
                    'MOYENNE': { label: 'Moyenne', color: 'bg-yellow-500' },
                    'BASSE': { label: 'Basse', color: 'bg-green-500' },
                  }).map(([priority, { label, color }]) => {
                    const count = ticketsByPriority[priority] || 0;
                    const pct = stats.totalTickets > 0 ? (count / stats.totalTickets) * 100 : 0;
                    return (
                      <div key={priority} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{label}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  {stats.criticalTickets > 0 && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-700 dark:text-red-300">
                        {stats.criticalTickets} ticket{stats.criticalTickets > 1 ? 's' : ''} critique{stats.criticalTickets > 1 ? 's' : ''} en attente
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Raccourcis rapides */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/admin/tickets">
                <Card className="hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Ticket className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium">Gérer les tickets</span>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/admin/users">
                <Card className="hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Users className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium">Gérer les utilisateurs</span>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/inventory">
                <Card className="hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Package className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium">Inventaire</span>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/admin/settings">
                <Card className="hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Settings className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium">Paramètres</span>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </TabsContent>

          {/* Onglet Tickets récents */}
          <TabsContent value="tickets" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Derniers tickets</CardTitle>
                    <CardDescription>Les 5 tickets les plus récents</CardDescription>
                  </div>
                  <Link href="/admin/tickets">
                    <Button variant="outline" size="sm">
                      Voir tous les tickets
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTickets.map((ticket) => (
                    <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4 flex-1">
                          <span className="text-sm font-mono text-muted-foreground">#{ticket.id}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{ticket.titre || 'Sans titre'}</p>
                            <p className="text-sm text-muted-foreground">
                              par {ticket.user?.name || ticket.user?.email}
                              {ticket.assignedTo && ` → ${ticket.assignedTo.name || ticket.assignedTo.email}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {getPriorityBadge(ticket.priorite)}
                          {getStatusBadge(ticket.status)}
                          <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                            {formatDate(ticket.createdAt)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {recentTickets.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucun ticket pour le moment
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Utilisateurs */}
          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Répartition</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Clients</span>
                      </div>
                      <span className="font-bold text-blue-600">
                        {stats.totalUsers - stats.totalAgents - stats.admins}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">Agents</span>
                      </div>
                      <span className="font-bold text-purple-600">{stats.totalAgents}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-amber-600" />
                        <span className="text-sm">Administrateurs</span>
                      </div>
                      <span className="font-bold text-amber-600">{stats.admins}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Actions rapides</CardTitle>
                    <Link href="/admin/users">
                      <Button size="sm">Gérer les utilisateurs</Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Résumé</h4>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold">{stats.totalUsers}</p>
                          <p className="text-xs text-muted-foreground">Total</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-600">{stats.totalAgents}</p>
                          <p className="text-xs text-muted-foreground">Agents actifs</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-blue-600">
                            {stats.totalUsers - stats.totalAgents - stats.admins}
                          </p>
                          <p className="text-xs text-muted-foreground">Clients</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Activité */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activité récente
                </CardTitle>
                <CardDescription>
                  Dernières actions dans le système
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${activity.type === 'ticket' ? 'bg-blue-500' : 'bg-green-500'
                          }`} />
                        <div>
                          <p className="font-medium text-sm">{activity.user}</p>
                          <p className="text-sm text-muted-foreground">{activity.action}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {formatDate(activity.timestamp)}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {activity.type === 'ticket' ? 'Ticket' : 'Connexion'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {recentActivities.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucune activité récente
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}