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
  DollarSign,
  Server,
  Shield,
  Database,
  Cpu,
  Globe,
  Zap
} from 'lucide-react';
import { useSession } from 'next-auth/react';

interface AdminStats {
  totalUsers: number;
  totalAgents: number;
  totalTickets: number;
  activeTickets: number;
  resolvedTickets: number;
  systemUptime: number;
  serverLoad: number;
  monthlyRevenue: number;
  customerSatisfaction: number;
  avgResponseTime: number;
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  resolved: boolean;
}

interface UserActivity {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  ip: string;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalUsers: 0,
    totalAgents: 0,
    totalTickets: 0,
    activeTickets: 0,
    resolvedTickets: 0,
    systemUptime: 0,
    serverLoad: 0,
    monthlyRevenue: 0,
    customerSatisfaction: 0,
    avgResponseTime: 0
  });
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);

  useEffect(() => {
    // Simuler le chargement des données administrateur
    const mockStats: AdminStats = {
      totalUsers: 1247,
      totalAgents: 15,
      totalTickets: 5632,
      activeTickets: 127,
      resolvedTickets: 5505,
      systemUptime: 99.9,
      serverLoad: 45,
      monthlyRevenue: 45678,
      customerSatisfaction: 4.6,
      avgResponseTime: 2.3
    };
    setAdminStats(mockStats);

    const mockAlerts: SystemAlert[] = [
      {
        id: '1',
        type: 'warning',
        title: 'Charge serveur élevée',
        description: 'Le serveur principal dépasse 80% d\'utilisation CPU',
        timestamp: '2024-01-15T14:30:00Z',
        resolved: false
      },
      {
        id: '2',
        type: 'error',
        title: 'Échec de sauvegarde',
        description: 'La sauvegarde automatique de 02:00 a échoué',
        timestamp: '2024-01-15T02:00:00Z',
        resolved: true
      },
      {
        id: '3',
        type: 'info',
        title: 'Mise à jour système',
        description: 'Une nouvelle mise à jour est disponible',
        timestamp: '2024-01-14T18:00:00Z',
        resolved: false
      }
    ];
    setSystemAlerts(mockAlerts);

    const mockActivities: UserActivity[] = [
      {
        id: '1',
        user: 'admin@company.com',
        action: 'Connexion au panneau d\'administration',
        timestamp: '2024-01-15T15:30:00Z',
        ip: '192.168.1.100'
      },
      {
        id: '2',
        user: 'agent@company.com',
        action: 'Création du ticket TK-4567',
        timestamp: '2024-01-15T15:25:00Z',
        ip: '192.168.1.101'
      },
      {
        id: '3',
        user: 'user@example.com',
        action: 'Mise à jour du profil',
        timestamp: '2024-01-15T15:20:00Z',
        ip: '192.168.1.102'
      }
    ];
    setUserActivities(mockActivities);
  }, []);

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Activity className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
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

  const resolutionRate = adminStats.totalTickets > 0 ? (adminStats.resolvedTickets / adminStats.totalTickets) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Panneau d'Administration
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Vue d'ensemble complète du système et gestion des opérations
          </p>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs totaux</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12% ce mois-ci
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tickets actifs</CardTitle>
              <Ticket className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{adminStats.activeTickets}</div>
              <p className="text-xs text-muted-foreground">
                {adminStats.totalTickets} au total
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenus mensuels</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${adminStats.monthlyRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +8% vs mois dernier
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{adminStats.customerSatisfaction}/5</div>
              <p className="text-xs text-muted-foreground">
                Note moyenne clients
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="system">Système</TabsTrigger>
            <TabsTrigger value="alerts">Alertes</TabsTrigger>
            <TabsTrigger value="logs">Journaux</TabsTrigger>
          </TabsList>

          {/* Onglet Aperçu */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance des tickets */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance des tickets
                  </CardTitle>
                  <CardDescription>
                    Statistiques de résolution et temps de réponse
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Taux de résolution</span>
                      <span className="text-sm">{resolutionRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={resolutionRate} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Résolus:</span>
                      <span className="ml-2 font-medium">{adminStats.resolvedTickets}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Actifs:</span>
                      <span className="ml-2 font-medium">{adminStats.activeTickets}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Temps de réponse:</span>
                      <span className="ml-2 font-medium">{adminStats.avgResponseTime}h</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Satisfaction:</span>
                      <span className="ml-2 font-medium">{adminStats.customerSatisfaction}/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* État du système */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    État du système
                  </CardTitle>
                  <CardDescription>
                    Performance et disponibilité
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Disponibilité</span>
                      <span className="text-sm">{adminStats.systemUptime}%</span>
                    </div>
                    <Progress value={adminStats.systemUptime} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Charge serveur</span>
                      <span className="text-sm">{adminStats.serverLoad}%</span>
                    </div>
                    <Progress value={adminStats.serverLoad} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Agents:</span>
                      <span className="ml-2 font-medium">{adminStats.totalAgents}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Utilisateurs:</span>
                      <span className="ml-2 font-medium">{adminStats.totalUsers}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Activité récente */}
            <Card>
              <CardHeader>
                <CardTitle>Activité système récente</CardTitle>
                <CardDescription>
                  Dernières activités détectées
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userActivities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="font-medium">{activity.user}</p>
                          <p className="text-sm text-muted-foreground">{activity.action}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{formatDate(activity.timestamp)}</p>
                        <p className="text-xs text-muted-foreground">{activity.ip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Utilisateurs */}
          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des utilisateurs</CardTitle>
                  <CardDescription>
                    Ajoutez et gérez les comptes utilisateurs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un utilisateur
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Voir tous les utilisateurs
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Shield className="h-4 w-4 mr-2" />
                    Gérer les permissions
                  </Button>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Statistiques des utilisateurs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Répartition par type</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Clients</span>
                          <span className="font-medium">{adminStats.totalUsers - adminStats.totalAgents}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Agents</span>
                          <span className="font-medium">{adminStats.totalAgents}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Administrateurs</span>
                          <span className="font-medium">3</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-medium">Activité ce mois</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Nouveaux utilisateurs</span>
                          <span className="font-medium">+147</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Utilisateurs actifs</span>
                          <span className="font-medium">892</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Taux de rétention</span>
                          <span className="font-medium">94%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Système */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-5 w-5" />
                    Ressources système
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">CPU</span>
                      <span className="text-sm">{adminStats.serverLoad}%</span>
                    </div>
                    <Progress value={adminStats.serverLoad} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Mémoire</span>
                      <span className="text-sm">67%</span>
                    </div>
                    <Progress value={67} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Stockage</span>
                      <span className="text-sm">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Bande passante</span>
                      <span className="text-sm">23%</span>
                    </div>
                    <Progress value={23} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Base de données
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Taille totale</span>
                      <p className="font-medium">2.4 GB</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Entrées totales</span>
                      <p className="font-medium">15,234</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Sauvegardes</span>
                      <p className="font-medium">Automatiques</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Dernière sauvegarde</span>
                      <p className="font-medium">Il y a 2h</p>
                    </div>
                  </div>
                  <div className="pt-4 space-y-2">
                    <Button variant="outline" className="w-full">
                      <Database className="h-4 w-4 mr-2" />
                      Sauvegarder maintenant
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Configurer la sauvegarde
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Alertes */}
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Alertes système</CardTitle>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrer
                  </Button>
                </div>
                <CardDescription>
                  Notifications et alertes importantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemAlerts.map((alert) => (
                    <div key={alert.id} className={`p-4 border rounded-lg ${alert.resolved ? 'opacity-50' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getAlertIcon(alert.type)}
                          <div>
                            <h4 className="font-medium">{alert.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <Badge className={getAlertColor(alert.type)}>
                                {alert.type === 'error' ? 'Erreur' : 
                                 alert.type === 'warning' ? 'Avertissement' : 'Information'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(alert.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {alert.resolved ? (
                            <Badge variant="outline">Résolue</Badge>
                          ) : (
                            <Button size="sm">Résoudre</Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Journaux */}
          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Journaux d'activité</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtrer
                    </Button>
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Exporter
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Journal complet des activités système
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">{activity.user}</p>
                          <p className="text-sm text-muted-foreground">{activity.action}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{formatDate(activity.timestamp)}</p>
                        <p className="text-xs text-muted-foreground">IP: {activity.ip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}