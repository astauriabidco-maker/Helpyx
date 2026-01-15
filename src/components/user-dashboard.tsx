'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Ticket, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Calendar,
  MessageSquare,
  FileText,
  Settings,
  Plus
} from 'lucide-react';
import { useSession } from 'next-auth/react';

interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

interface RecentTicket {
  id: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  lastUpdate: string;
}

export default function UserDashboard() {
  const { data: session } = useSession();
  const [ticketStats, setTicketStats] = useState<TicketStats>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0
  });
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([]);

  useEffect(() => {
    // Simuler le chargement des données
    const mockStats: TicketStats = {
      total: 24,
      open: 3,
      inProgress: 2,
      resolved: 15,
      closed: 4
    };
    setTicketStats(mockStats);

    const mockTickets: RecentTicket[] = [
      {
        id: 'TK-001',
        subject: 'Problème de connexion à l\'application',
        status: 'in_progress',
        priority: 'high',
        createdAt: '2024-01-15T10:30:00Z',
        lastUpdate: '2024-01-15T14:20:00Z'
      },
      {
        id: 'TK-002',
        subject: 'Demande de nouvelle fonctionnalité',
        status: 'open',
        priority: 'medium',
        createdAt: '2024-01-14T09:15:00Z',
        lastUpdate: '2024-01-14T09:15:00Z'
      },
      {
        id: 'TK-003',
        subject: 'Erreur lors de l\'exportation des données',
        status: 'resolved',
        priority: 'urgent',
        createdAt: '2024-01-13T16:45:00Z',
        lastUpdate: '2024-01-14T11:30:00Z'
      }
    ];
    setRecentTickets(mockTickets);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'medium': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const resolutionRate = ticketStats.total > 0 ? (ticketStats.resolved / ticketStats.total) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Bienvenue, {session?.user?.name || 'Utilisateur'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Voici un aperçu de vos tickets et activités récentes
          </p>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ticketStats.total}</div>
              <p className="text-xs text-muted-foreground">
                Tous vos tickets
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ouverts</CardTitle>
              <AlertCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{ticketStats.open}</div>
              <p className="text-xs text-muted-foreground">
                En attente de traitement
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En cours</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{ticketStats.inProgress}</div>
              <p className="text-xs text-muted-foreground">
                En cours de traitement
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Résolus</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{ticketStats.resolved}</div>
              <p className="text-xs text-muted-foreground">
                Tickets résolus
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Taux de résolution et actions rapides */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Taux de résolution
              </CardTitle>
              <CardDescription>
                Pourcentage de tickets résolus sur le total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Progression</span>
                  <span className="text-sm text-muted-foreground">
                    {resolutionRate.toFixed(1)}%
                  </span>
                </div>
                <Progress value={resolutionRate} className="h-2" />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Résolus:</span>
                    <span className="ml-2 font-medium">{ticketStats.resolved}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total:</span>
                    <span className="ml-2 font-medium">{ticketStats.total}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="default">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau ticket
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => window.location.href = '/tickets/create'}>
                <Plus className="h-4 w-4 mr-2" />
                Ticket détaillé
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Mes tickets
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tickets récents */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets récents</CardTitle>
            <CardDescription>
              Vos dernières activités de tickets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium">{ticket.id}</span>
                      <h4 className="font-medium">{ticket.subject}</h4>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status === 'open' ? 'Ouvert' : 
                         ticket.status === 'in_progress' ? 'En cours' : 
                         ticket.status === 'resolved' ? 'Résolu' : 'Fermé'}
                      </Badge>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority === 'low' ? 'Faible' : 
                         ticket.priority === 'medium' ? 'Moyen' : 
                         ticket.priority === 'high' ? 'Élevé' : 'Urgent'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Créé: {formatDate(ticket.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Mis à jour: {formatDate(ticket.lastUpdate)}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Voir détails
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}