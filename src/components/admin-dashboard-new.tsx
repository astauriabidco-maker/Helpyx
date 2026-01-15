'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  Ticket, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle,
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
  Zap,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Download,
  RefreshCw,
  Bell,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Building,
  Target,
  ZapOff,
  Wifi,
  WifiOff,
  Lock,
  Unlock,
  CheckSquare,
  XSquare,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Star,
  Award,
  TrendingDown,
  PieChart,
  LineChart,
  CalendarDays,
  UserPlus,
  UserMinus,
  Package,
  ShoppingCart,
  Receipt,
  Calculator,
  FileBarChart,
  Monitor,
  Smartphone,
  Laptop,
  HardDrive,
  Cloud,
  CloudRain,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Info
} from 'lucide-react';

interface AdminStats {
  totalCompanies: number;
  activeCompanies: number;
  totalUsers: number;
  activeUsers: number;
  totalAgents: number;
  totalTickets: number;
  activeTickets: number;
  resolvedTickets: number;
  monthlyRevenue: number;
  churnRate: number;
  systemUptime: number;
  serverLoad: number;
  storageUsed: number;
  bandwidthUsed: number;
  customerSatisfaction: number;
  avgResponseTime: number;
  newSignups: number;
  cancellations: number;
}

interface Company {
  id: string;
  nom: string;
  slug: string;
  emailContact: string;
  telephone?: string;
  pays?: string;
  ville?: string;
  statut: string;
  planAbonnement: string;
  limiteUtilisateurs: number;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    users: number;
    tickets: number;
  };
  subscription?: {
    statut: string;
    dateFin: Date;
  };
}

interface SystemAlert {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: Date;
  resolved: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface UserActivity {
  id: string;
  user: string;
  email: string;
  action: string;
  timestamp: Date;
  ip: string;
  company: string;
  type: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'error';
}

interface RevenueData {
  month: string;
  revenue: number;
  companies: number;
  users: number;
}

export default function AdminDashboardNew() {
  const [activeTab, setActiveTab] = useState('overview');
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalCompanies: 0,
    activeCompanies: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalAgents: 0,
    totalTickets: 0,
    activeTickets: 0,
    resolvedTickets: 0,
    monthlyRevenue: 0,
    churnRate: 0,
    systemUptime: 0,
    serverLoad: 0,
    storageUsed: 0,
    bandwidthUsed: 0,
    customerSatisfaction: 0,
    avgResponseTime: 0,
    newSignups: 0,
    cancellations: 0
  });
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Simuler des données réelles
      const mockStats: AdminStats = {
        totalCompanies: 156,
        activeCompanies: 142,
        totalUsers: 4847,
        activeUsers: 3124,
        totalAgents: 234,
        totalTickets: 15678,
        activeTickets: 423,
        resolvedTickets: 15255,
        monthlyRevenue: 124560,
        churnRate: 2.3,
        systemUptime: 99.9,
        serverLoad: 67,
        storageUsed: 73,
        bandwidthUsed: 45,
        customerSatisfaction: 4.6,
        avgResponseTime: 1.8,
        newSignups: 28,
        cancellations: 3
      };
      setAdminStats(mockStats);

      const mockCompanies: Company[] = [
        {
          id: '1',
          nom: 'TechCorp Solutions',
          slug: 'techcorp-solutions',
          emailContact: 'contact@techcorp.com',
          telephone: '+33 1 23 45 67 89',
          pays: 'France',
          ville: 'Paris',
          statut: 'active',
          planAbonnement: 'pro',
          limiteUtilisateurs: 50,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-20'),
          _count: { users: 23, tickets: 156 },
          subscription: { statut: 'active', dateFin: new Date('2024-12-31') }
        },
        {
          id: '2',
          nom: 'Digital Agency',
          slug: 'digital-agency',
          emailContact: 'hello@digitalagency.com',
          telephone: '+33 1 98 76 54 32',
          pays: 'France',
          ville: 'Lyon',
          statut: 'active',
          planAbonnement: 'enterprise',
          limiteUtilisateurs: 100,
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-18'),
          _count: { users: 45, tickets: 89 },
          subscription: { statut: 'active', dateFin: new Date('2024-12-31') }
        }
      ];
      setCompanies(mockCompanies);

      const mockAlerts: SystemAlert[] = [
        {
          id: '1',
          type: 'warning',
          title: 'Espace disque faible',
          description: 'Le serveur principal a moins de 20% d\'espace disponible',
          timestamp: new Date('2024-01-15T14:30:00Z'),
          resolved: false,
          severity: 'medium'
        },
        {
          id: '2',
          type: 'error',
          title: 'Connexion échouée',
          description: 'Plusieurs tentatives de connexion échouées depuis l\'IP 192.168.1.100',
          timestamp: new Date('2024-01-15T13:15:00Z'),
          resolved: true,
          severity: 'high'
        }
      ];
      setSystemAlerts(mockAlerts);

      const mockActivities: UserActivity[] = [
        {
          id: '1',
          user: 'Jean Dupont',
          email: 'jean@techcorp.com',
          action: 'Connexion au tableau de bord',
          timestamp: new Date('2024-01-15T15:30:00Z'),
          ip: '192.168.1.100',
          company: 'TechCorp Solutions',
          type: 'login'
        },
        {
          id: '2',
          user: 'Marie Martin',
          email: 'marie@digitalagency.com',
          action: 'Création du ticket #4567',
          timestamp: new Date('2024-01-15T15:25:00Z'),
          ip: '192.168.1.101',
          company: 'Digital Agency',
          type: 'create'
        }
      ];
      setUserActivities(mockActivities);

      const mockRevenue: RevenueData[] = [
        { month: 'Août 2023', revenue: 85000, companies: 120, users: 3200 },
        { month: 'Sept 2023', revenue: 92000, companies: 128, users: 3450 },
        { month: 'Oct 2023', revenue: 98000, companies: 135, users: 3680 },
        { month: 'Nov 2023', revenue: 105000, companies: 142, users: 3920 },
        { month: 'Déc 2023', revenue: 112000, companies: 148, users: 4200 },
        { month: 'Jan 2024', revenue: 124560, companies: 156, users: 4847 }
      ];
      setRevenueData(mockRevenue);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      trial: 'secondary',
      suspended: 'destructive',
      cancelled: 'outline'
    } as const;
    
    const labels = {
      active: 'Actif',
      trial: 'Essai',
      suspended: 'Suspendu',
      cancelled: 'Annulé'
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getPlanBadge = (plan: string) => {
    const colors = {
      starter: 'bg-gray-100 text-gray-800',
      pro: 'bg-blue-100 text-blue-800',
      enterprise: 'bg-purple-100 text-purple-800'
    };
    
    return (
      <Badge className={colors[plan as keyof typeof colors]}>
        {plan.toUpperCase()}
      </Badge>
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.emailContact.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || company.statut === statusFilter;
    const matchesPlan = planFilter === 'all' || company.planAbonnement === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const resolutionRate = adminStats.totalTickets > 0 ? 
    (adminStats.resolvedTickets / adminStats.totalTickets) * 100 : 0;
  
  const activationRate = adminStats.totalCompanies > 0 ? 
    (adminStats.activeCompanies / adminStats.totalCompanies) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de l'administration système
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exporter
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="companies">Entreprises</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="billing">Facturation</TabsTrigger>
            <TabsTrigger value="system">Système</TabsTrigger>
            <TabsTrigger value="logs">Journaux</TabsTrigger>
          </TabsList>

          {/* Onglet Aperçu */}
          <TabsContent value="overview" className="space-y-6">
            {/* Statistiques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Entreprises totales</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adminStats.totalCompanies}</div>
                  <p className="text-xs text-muted-foreground">
                    +{adminStats.newSignups} ce mois-ci
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Utilisateurs actifs</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adminStats.activeUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    {adminStats.totalUsers} au total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenu mensuel</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(adminStats.monthlyRevenue)}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% par rapport au mois dernier
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Satisfaction client</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adminStats.customerSatisfaction}/5</div>
                  <p className="text-xs text-muted-foreground">
                    Basé sur {adminStats.resolvedTickets} tickets résolus
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Alertes système */}
            <Card>
              <CardHeader>
                <CardTitle>Alertes système</CardTitle>
                <CardDescription>Dernières alertes et notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${getAlertColor(alert.type)}`}>
                          {getAlertIcon(alert.type)}
                        </div>
                        <div>
                          <p className="font-medium">{alert.title}</p>
                          <p className="text-sm text-muted-foreground">{alert.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={alert.resolved ? "default" : "destructive"}>
                          {alert.resolved ? "Résolu" : "En cours"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(alert.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Entreprises */}
          <TabsContent value="companies" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Gestion des entreprises</CardTitle>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Rechercher une entreprise..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="active">Actifs</SelectItem>
                        <SelectItem value="trial">Essai</SelectItem>
                        <SelectItem value="suspended">Suspendus</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Entreprise</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Utilisateurs</TableHead>
                      <TableHead>Tickets</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompanies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{company.nom}</p>
                            <p className="text-sm text-muted-foreground">{company.ville}, {company.pays}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{company.emailContact}</p>
                            <p className="text-sm text-muted-foreground">{company.telephone}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getPlanBadge(company.planAbonnement)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{company._count.users}</span>
                            <span className="text-xs text-muted-foreground">/ {company.limiteUtilisateurs}</span>
                          </div>
                        </TableCell>
                        <TableCell>{company._count.tickets}</TableCell>
                        <TableCell>{getStatusBadge(company.statut)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Utilisateurs */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des utilisateurs</CardTitle>
                <CardDescription>Vue d'ensemble de tous les utilisateurs du système</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{adminStats.totalUsers}</div>
                    <p className="text-sm text-muted-foreground">Utilisateurs totaux</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{adminStats.activeUsers}</div>
                    <p className="text-sm text-muted-foreground">Utilisateurs actifs</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{adminStats.totalAgents}</div>
                    <p className="text-sm text-muted-foreground">Agents support</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Tickets */}
          <TabsContent value="tickets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Statistiques des tickets</CardTitle>
                <CardDescription>Performance du support client</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{adminStats.totalTickets}</div>
                    <p className="text-sm text-muted-foreground">Tickets totaux</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">{adminStats.activeTickets}</div>
                    <p className="text-sm text-muted-foreground">Tickets actifs</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{adminStats.resolvedTickets}</div>
                    <p className="text-sm text-muted-foreground">Tickets résolus</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{resolutionRate.toFixed(1)}%</div>
                    <p className="text-sm text-muted-foreground">Taux de résolution</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Facturation */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenus mensuels</CardTitle>
                <CardDescription>Évolution des revenus sur 6 mois</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueData.map((data) => (
                    <div key={data.month} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{data.month}</p>
                        <p className="text-sm text-muted-foreground">
                          {data.companies} entreprises • {data.users} utilisateurs
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{formatCurrency(data.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Système */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance système</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Charge serveur</span>
                      <span className="text-sm">{adminStats.serverLoad}%</span>
                    </div>
                    <Progress value={adminStats.serverLoad} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Stockage utilisé</span>
                      <span className="text-sm">{adminStats.storageUsed}%</span>
                    </div>
                    <Progress value={adminStats.storageUsed} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Bande passante</span>
                      <span className="text-sm">{adminStats.bandwidthUsed}%</span>
                    </div>
                    <Progress value={adminStats.bandwidthUsed} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Statut système</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Temps de disponibilité</span>
                    <Badge variant="default">{adminStats.systemUptime}%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Temps de réponse moyen</span>
                    <Badge variant="secondary">{adminStats.avgResponseTime}s</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Taux de churn</span>
                    <Badge variant="outline">{adminStats.churnRate}%</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Journaux */}
          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Journal d'activité</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Exporter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtrer
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${
                          activity.type === 'login' ? 'bg-green-100' :
                          activity.type === 'create' ? 'bg-blue-100' :
                          activity.type === 'error' ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                          {activity.type === 'login' ? <UserPlus className="h-4 w-4 text-green-600" /> :
                           activity.type === 'create' ? <Plus className="h-4 w-4 text-blue-600" /> :
                           activity.type === 'error' ? <AlertCircle className="h-4 w-4 text-red-600" /> :
                           <Activity className="h-4 w-4 text-gray-600" />}
                        </div>
                        <div>
                          <p className="font-medium">{activity.user}</p>
                          <p className="text-sm text-muted-foreground">{activity.action}</p>
                          <p className="text-xs text-slate-500">{activity.email} • {activity.company}</p>
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
        </Tabs>
    </div>
  );
}