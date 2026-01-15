'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Ticket, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Calendar,
  MessageSquare,
  FileText,
  Settings,
  Plus,
  Search,
  Filter,
  BarChart3,
  Activity,
  UserCheck,
  Timer,
  Trophy,
  Star,
  Crown,
  Flame,
  Target,
  Brain
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { GamificationProfile } from '@/components/gamification/gamification-profile';
import { Leaderboard } from '@/components/gamification/leaderboard';
import { AIDiagnostic } from '@/components/ai/ai-diagnostic';
import { AgentTraining } from '@/components/ai/agent-training';
import { AutoResponse } from '@/components/ai/auto-response';

interface AgentStats {
  totalTickets: number;
  myTickets: number;
  openTickets: number;
  resolvedToday: number;
  avgResponseTime: number;
  satisfactionRate: number;
}

interface TicketItem {
  id: string;
  subject: string;
  customer: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string;
  createdAt: string;
  lastUpdate: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  activeTickets: number;
  resolvedToday: number;
  status: 'online' | 'busy' | 'offline';
}

export default function AgentDashboard() {
  const { data: session } = useSession();
  const [agentStats, setAgentStats] = useState<AgentStats>({
    totalTickets: 0,
    myTickets: 0,
    openTickets: 0,
    resolvedToday: 0,
    avgResponseTime: 0,
    satisfactionRate: 0
  });
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simuler le chargement des données agent
    const mockStats: AgentStats = {
      totalTickets: 156,
      myTickets: 12,
      openTickets: 8,
      resolvedToday: 5,
      avgResponseTime: 2.5,
      satisfactionRate: 4.7
    };
    setAgentStats(mockStats);

    const mockTickets: TicketItem[] = [
      {
        id: 'TK-001',
        subject: 'Problème de connexion API',
        customer: 'Jean Dupont',
        status: 'open',
        priority: 'high',
        assignedTo: 'moi',
        createdAt: '2024-01-15T10:30:00Z',
        lastUpdate: '2024-01-15T10:30:00Z'
      },
      {
        id: 'TK-002',
        subject: 'Erreur de facturation',
        customer: 'Marie Martin',
        status: 'in_progress',
        priority: 'urgent',
        assignedTo: 'moi',
        createdAt: '2024-01-15T09:15:00Z',
        lastUpdate: '2024-01-15T11:20:00Z'
      },
      {
        id: 'TK-003',
        subject: 'Demande de fonctionnalité',
        customer: 'Pierre Durand',
        status: 'open',
        priority: 'medium',
        assignedTo: 'agent_2',
        createdAt: '2024-01-14T14:45:00Z',
        lastUpdate: '2024-01-14T14:45:00Z'
      }
    ];
    setTickets(mockTickets);

    const mockTeam: TeamMember[] = [
      {
        id: '1',
        name: 'Thomas Bernard',
        email: 'thomas@company.com',
        activeTickets: 8,
        resolvedToday: 3,
        status: 'online'
      },
      {
        id: '2',
        name: 'Sophie Petit',
        email: 'sophie@company.com',
        activeTickets: 6,
        resolvedToday: 7,
        status: 'busy'
      },
      {
        id: '3',
        name: 'Lucas Dubois',
        email: 'lucas@company.com',
        activeTickets: 0,
        resolvedToday: 2,
        status: 'offline'
      }
    ];
    setTeamMembers(mockTeam);
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

  const getMemberStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
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

  const filteredTickets = tickets.filter(ticket =>
    ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Espace Agent
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Gérez vos tickets et collaborez avec l'équipe
          </p>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mes tickets</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agentStats.myTickets}</div>
              <p className="text-xs text-muted-foreground">
                Assignés à moi
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Résolus aujourd'hui</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{agentStats.resolvedToday}</div>
              <p className="text-xs text-muted-foreground">
                Performance du jour
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temps de réponse</CardTitle>
              <Timer className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{agentStats.avgResponseTime}h</div>
              <p className="text-xs text-muted-foreground">
                Moyenne
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{agentStats.satisfactionRate}/5</div>
              <p className="text-xs text-muted-foreground">
                Note moyenne
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tickets" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="team">Équipe</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="gamification" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Gamification
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              IA Assistant
            </TabsTrigger>
          </TabsList>

          {/* Onglet Tickets */}
          <TabsContent value="tickets" className="space-y-6">
            {/* Barre de recherche et filtres */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Liste des tickets</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher un ticket..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => window.location.href = '/tickets/create'}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ticket détaillé
                    </Button>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Nouveau ticket simple
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTickets.map((ticket) => (
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
                          {ticket.assignedTo === 'moi' && (
                            <Badge variant="outline">Assigné à moi</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Client: {ticket.customer}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(ticket.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          Voir détails
                        </Button>
                        {ticket.status === 'open' && (
                          <Button size="sm">
                            Prendre en charge
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Équipe */}
          <TabsContent value="team" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Membres de l'équipe</CardTitle>
                  <CardDescription>
                    Statut et charge de travail de l'équipe
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                              <UserCheck className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                            </div>
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getMemberStatusColor(member.status)}`} />
                          </div>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Actifs:</span>
                              <span className="ml-1 font-medium">{member.activeTickets}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Résolus:</span>
                              <span className="ml-1 font-medium">{member.resolvedToday}</span>
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`mt-1 ${
                              member.status === 'online' ? 'text-green-600 border-green-600' :
                              member.status === 'busy' ? 'text-yellow-600 border-yellow-600' :
                              'text-gray-600 border-gray-600'
                            }`}
                          >
                            {member.status === 'online' ? 'En ligne' : 
                             member.status === 'busy' ? 'Occupé' : 'Hors ligne'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance de l'équipe</CardTitle>
                  <CardDescription>
                    Statistiques collectives
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tickets résolus aujourd'hui</span>
                    <span className="text-2xl font-bold">12</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  <p className="text-xs text-muted-foreground">75% de l'objectif quotidien</p>
                  
                  <div className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Temps de réponse moyen</span>
                      <span className="font-medium">2.3h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Taux de satisfaction</span>
                      <span className="font-medium">4.6/5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tickets en attente</span>
                      <span className="font-medium">8</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Performance */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vos performances</CardTitle>
                  <CardDescription>
                    Suivi de vos indicateurs clés
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Tickets résolus cette semaine</span>
                      <span className="text-2xl font-bold">23</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Temps de réponse moyen</span>
                      <span className="font-medium">2.5h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Taux de satisfaction client</span>
                      <span className="font-medium">4.7/5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tickets traités aujourd'hui</span>
                      <span className="font-medium">5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Objectifs</CardTitle>
                  <CardDescription>
                    Vos objectifs et progression
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Tickets quotidiens</span>
                        <span className="text-sm">5/8</span>
                      </div>
                      <Progress value={62.5} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Satisfaction client</span>
                        <span className="text-sm">4.7/4.5</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Temps de réponse</span>
                        <span className="text-sm">2.5h/3h</span>
                      </div>
                      <Progress value={83} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Gamification */}
          <TabsContent value="gamification" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profil de gamification */}
              <div className="lg:col-span-2">
                <GamificationProfile userId={session?.user?.id || 'demo-user'} />
              </div>
              
              {/* Leaderboard */}
              <div>
                <Leaderboard userId={session?.user?.id || 'demo-user'} showPeriodSelector={false} />
              </div>
            </div>
          </TabsContent>

          {/* Onglet IA Assistant */}
          <TabsContent value="ai" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Diagnostic IA */}
              <div>
                <AIDiagnostic 
                  ticketData={{
                    id: 'TK-001',
                    description: 'Problème de connexion réseau intermittent',
                    type_panne: 'RÉSEAU',
                    priorite: 'HAUTE',
                    categorie: 'Connectivité'
                  }}
                  onSolutionSelect={(solution) => {
                    console.log('Solution sélectionnée:', solution);
                  }}
                />
              </div>
              
              {/* Formation IA */}
              <div>
                <AgentTraining 
                  agentId={session?.user?.id || 'agent_001'}
                  currentTicket={{
                    id: 'TK-001',
                    description: 'Problème de connexion réseau intermittent'
                  }}
                  currentAction="diagnostic"
                />
              </div>
            </div>

            {/* Réponse automatique */}
            <div>
              <AutoResponse 
                ticketData={{
                  id: 'TK-001',
                  description: 'Problème de connexion réseau intermittent',
                  type_panne: 'RÉSEAU',
                  priorite: 'HAUTE'
                }}
                customerData={{
                  id: 'customer_001',
                  name: 'Jean Dupont',
                  preferences: {
                    language: 'fr',
                    communicationStyle: 'friendly'
                  }
                }}
                onResponseGenerated={(response) => {
                  console.log('Réponse générée:', response);
                }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}