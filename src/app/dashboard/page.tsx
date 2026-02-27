'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  Users,
  Ticket,
  Wrench,
  Bell,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Package,
  BookOpen,
  RefreshCw,
  Loader2,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface DashboardStats {
  tickets: {
    total: number;
    open: number;
    inProgress: number;
    closed: number;
    distribution: Array<{ status: string; count: number; label: string }>;
  };
  users: {
    total: number;
    clients: number;
    agents: number;
    admins: number;
  };
  recentTickets: Array<{
    id: string;
    titre: string | null;
    status: string;
    priorite: string;
    createdAt: string;
    user: { name: string | null; email: string };
  }>;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard/stats');
      if (!res.ok) throw new Error('Erreur serveur');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError('Impossible de charger les données');
      console.error('Dashboard stats error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      'OUVERT': { label: 'Ouvert', className: 'bg-blue-100 text-blue-800' },
      'EN_DIAGNOSTIC': { label: 'Diagnostic', className: 'bg-yellow-100 text-yellow-800' },
      'EN_REPARATION': { label: 'Réparation', className: 'bg-orange-100 text-orange-800' },
      'REPARÉ': { label: 'Réparé', className: 'bg-green-100 text-green-800' },
      'FERMÉ': { label: 'Fermé', className: 'bg-gray-100 text-gray-800' },
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  const quickActions = [
    { title: 'Gestion des Tickets', description: 'Créer et suivre les tickets', icon: Ticket, href: '/tickets', color: 'bg-blue-500' },
    { title: 'Inventaire', description: 'Gérer le parc informatique', icon: Package, href: '/inventory', color: 'bg-purple-500' },
    { title: 'Knowledge Base', description: 'Articles et guides', icon: BookOpen, href: '/admin/articles', color: 'bg-green-500' },
    { title: 'Notifications', description: 'Voir les notifications', icon: Bell, href: '/notifications', color: 'bg-orange-500' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-slate-600 dark:text-slate-400">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
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

  const resolutionRate = stats.tickets.total > 0
    ? Math.round((stats.tickets.closed / stats.tickets.total) * 100)
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tableau de Bord</h1>
          <p className="text-muted-foreground">
            Bienvenue, {session?.user?.name || 'Utilisateur'} — Données en temps réel
          </p>
        </div>
        <Button variant="outline" onClick={fetchStats}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tickets.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.users.total} utilisateur{stats.users.total > 1 ? 's' : ''} enregistré{stats.users.total > 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Ouverts</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.tickets.open}</div>
            <p className="text-xs text-muted-foreground">
              {stats.tickets.inProgress} en cours de traitement
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux Résolution</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{resolutionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.tickets.closed} ticket{stats.tickets.closed > 1 ? 's' : ''} fermé{stats.tickets.closed > 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Équipe</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.agents + stats.users.admins}</div>
            <p className="text-xs text-muted-foreground">
              {stats.users.agents} agents · {stats.users.admins} admins
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Actions Rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{action.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {action.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tickets */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tickets Récents</CardTitle>
                <CardDescription>
                  Les derniers tickets créés
                </CardDescription>
              </div>
              <Link href="/tickets">
                <Button variant="outline" size="sm">
                  Voir tout
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentTickets.length > 0 ? (
                stats.recentTickets.map((ticket) => (
                  <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-xs font-mono text-muted-foreground">#{ticket.id}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{ticket.titre || 'Sans titre'}</p>
                          <p className="text-xs text-muted-foreground">
                            par {ticket.user?.name || ticket.user?.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getPriorityBadge(ticket.priorite)}
                        {getStatusBadge(ticket.status)}
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Ticket className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucun ticket récent</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Distribution par statut */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Distribution des Tickets
            </CardTitle>
            <CardDescription>
              Répartition par statut
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.tickets.distribution.map((item) => {
                const pct = stats.tickets.total > 0 ? (item.count / stats.tickets.total) * 100 : 0;
                const colorMap: Record<string, string> = {
                  'ouvert': 'bg-blue-500',
                  'en_cours': 'bg-orange-500',
                  'fermé': 'bg-gray-400',
                };
                return (
                  <div key={item.status} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{item.label}</span>
                      <span className="font-medium">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`${colorMap[item.status] || 'bg-blue-500'} h-2 rounded-full transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Résumé équipe */}
            <div className="mt-6 pt-4 border-t">
              <h4 className="text-sm font-medium mb-3">Équipe</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-lg font-bold text-blue-600">{stats.users.clients}</p>
                  <p className="text-xs text-muted-foreground">Clients</p>
                </div>
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-lg font-bold text-purple-600">{stats.users.agents}</p>
                  <p className="text-xs text-muted-foreground">Agents</p>
                </div>
                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <p className="text-lg font-bold text-amber-600">{stats.users.admins}</p>
                  <p className="text-xs text-muted-foreground">Admins</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}