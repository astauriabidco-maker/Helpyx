'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Ticket, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  MessageSquare,
  Calendar,
  Filter,
  Plus,
  LogOut,
  UserCheck
} from 'lucide-react';
import { JWTClient } from '@/lib/jwt-client';

interface AgentStats {
  assignedTickets: number;
  resolvedToday: number;
  avgResponseTime: string;
  satisfactionRate: number;
  pendingTickets: number;
  urgentTickets: number;
}

interface Ticket {
  id: number;
  title: string;
  description: string;
  status: 'ouvert' | 'en_cours' | 'fermé';
  priority: 'basse' | 'moyenne' | 'haute' | 'critique';
  client: string;
  createdAt: string;
  lastUpdate: string;
}

export default function AgentDashboard() {
  const [stats, setStats] = useState<AgentStats>({
    assignedTickets: 12,
    resolvedToday: 5,
    avgResponseTime: '2h 15m',
    satisfactionRate: 94,
    pendingTickets: 7,
    urgentTickets: 2,
  });
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = JWTClient.getUser();
    if (!currentUser || currentUser.role !== 'AGENT') {
      router.push('/auth/signin');
      return;
    }
    setUser(currentUser);
    fetchAgentData();
  }, [router]);

  const fetchAgentData = async () => {
    try {
      // Simuler des données pour le moment
      setTimeout(() => {
        setTickets([
          {
            id: 1001,
            title: 'Ordinateur portable ne démarre plus',
            description: 'PC Dell XPS 15, plus de réponse après mise à jour Windows',
            status: 'en_cours',
            priority: 'critique',
            client: 'Jean Dupont',
            createdAt: '2024-01-15 09:30',
            lastUpdate: '2024-01-15 14:20',
          },
          {
            id: 1002,
            title: 'Problème d\'impression réseau',
            description: 'Imprimante HP non détectée sur le réseau',
            status: 'ouvert',
            priority: 'haute',
            client: 'Marie Martin',
            createdAt: '2024-01-15 11:15',
            lastUpdate: '2024-01-15 11:15',
          },
          {
            id: 1003,
            title: 'Connexion VPN instable',
            description: 'Déconnexions fréquentes du VPN Cisco',
            status: 'en_cours',
            priority: 'moyenne',
            client: 'Pierre Durand',
            createdAt: '2024-01-15 08:45',
            lastUpdate: '2024-01-15 13:30',
          },
        ]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await JWTClient.logout();
    router.push('/auth/signin');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critique':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'haute':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'moyenne':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'basse':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ouvert':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'en_cours':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'fermé':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Agent Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Bienvenue, {user?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Agent Support
              </Badge>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="tickets">Mes Tickets</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Aperçu */}
          <TabsContent value="overview" className="space-y-6">
            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tickets Assignés</CardTitle>
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.assignedTickets}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.pendingTickets} en attente
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Résolus Aujourd'hui</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.resolvedToday}</div>
                  <p className="text-xs text-muted-foreground">
                    +20% vs hier
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Temps de Réponse</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.avgResponseTime}</div>
                  <p className="text-xs text-muted-foreground">
                    Moyenne
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.satisfactionRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    Excellent
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tickets urgents */}
            {stats.urgentTickets > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Tickets Urgents
                  </CardTitle>
                  <CardDescription>
                    Tickets nécessitant une attention immédiate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {tickets
                      .filter(ticket => ticket.priority === 'critique')
                      .map(ticket => (
                        <div key={ticket.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(ticket.status)}
                            <div>
                              <p className="font-medium">#{ticket.id} - {ticket.title}</p>
                              <p className="text-sm text-muted-foreground">{ticket.client}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="destructive">
                            Traiter
                          </Button>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tickets */}
          <TabsContent value="tickets" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Mes Tickets Assignés</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrer
                </Button>
                <Link href="/tickets/create">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau Ticket
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              {tickets.map((ticket) => (
                <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(ticket.status)}
                          <h3 className="font-semibold">#{ticket.id} - {ticket.title}</h3>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{ticket.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {ticket.client}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {ticket.createdAt}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {ticket.lastUpdate}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Répondre
                        </Button>
                        <Button size="sm">
                          Voir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Clients */}
          <TabsContent value="clients" className="space-y-6">
            <h2 className="text-2xl font-bold">Mes Clients</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Clients Actifs</CardTitle>
                  <CardDescription>
                    Clients avec des tickets en cours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tickets.map((ticket) => (
                      <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                            <Users className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{ticket.client}</p>
                            <p className="text-sm text-muted-foreground">Ticket #{ticket.id}</p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {ticket.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Historique Récent</CardTitle>
                  <CardDescription>
                    Dernières interactions avec les clients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Réponse envoyée à Jean Dupont</p>
                        <p className="text-xs text-muted-foreground">Il y a 2 heures</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Ticket résolu pour Marie Martin</p>
                        <p className="text-xs text-muted-foreground">Il y a 4 heures</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance */}
          <TabsContent value="performance" className="space-y-6">
            <h2 className="text-2xl font-bold">Ma Performance</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Statistiques du Mois</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Tickets résolus</span>
                      <span className="font-bold">47</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Temps moyen de résolution</span>
                      <span className="font-bold">4h 30m</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Taux de satisfaction</span>
                      <span className="font-bold">94%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Réponses envoyées</span>
                      <span className="font-bold">156</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Objectifs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Tickets résolus</span>
                        <span className="text-sm">47/50</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Satisfaction client</span>
                        <span className="text-sm">94%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}