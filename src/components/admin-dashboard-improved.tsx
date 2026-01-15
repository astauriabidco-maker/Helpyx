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
import { 
  // Navigation
  LayoutDashboard,
  Building2,
  Users,
  TicketCheck,
  CreditCard,
  Settings,
  FileText,
  Search,
  
  // Actions
  Plus,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  
  // Status & Icons
  TrendingUp,
  DollarSign,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Star,
  Activity,
  Server,
  Database,
  Globe,
  Zap,
  BarChart3,
  ArrowUpRight,
  Cpu,
  Brain,
  
  // User & Company
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

import { NotificationDropdown } from '@/components/ui/notification-dropdown';
import { useNotifications } from '@/contexts/notification-context';

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

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
  bgColor: string;
  hoverColor: string;
  priority: 'high' | 'medium' | 'low';
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  separator?: boolean;
}

export default function AdminDashboardImproved() {
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
          title: 'Tentatives de connexion suspectes',
          description: 'Plusieurs tentatives de connexion échouées depuis l\'IP 192.168.1.100',
          timestamp: new Date('2024-01-15T13:15:00Z'),
          resolved: true,
          severity: 'high'
        }
      ];
      setSystemAlerts(mockAlerts);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = {
    primary: [
      {
        id: '1',
        title: 'Ajouter une entreprise',
        description: 'Créer un nouveau compte entreprise',
        icon: <Building2 className="h-6 w-6" />,
        action: () => {
          addNotification({
            type: 'success',
            title: 'Entreprise créée',
            message: 'La nouvelle entreprise a été ajoutée avec succès',
            priority: 'high',
            action: {
              label: 'Voir les entreprises',
              onClick: () => setActiveTab('companies')
            }
          });
          console.log('Ajouter entreprise');
        },
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
        hoverColor: 'hover:border-blue-300',
        priority: 'high'
      },
      {
        id: '2',
        title: 'Gestion des tickets',
        description: 'Voir et traiter les tickets en attente',
        icon: <TicketCheck className="h-6 w-6" />,
        action: () => {
          addNotification({
            type: 'ticket',
            title: 'Nouveau ticket reçu',
            message: 'Un ticket de support prioritaire nécessite votre attention',
            priority: 'critical',
            action: {
              label: 'Voir le ticket',
              onClick: () => setActiveTab('tickets')
            }
          });
          setActiveTab('tickets');
        },
        color: 'text-green-600',
        bgColor: 'bg-green-50 border-green-200 hover:bg-green-100',
        hoverColor: 'hover:border-green-300',
        priority: 'high'
      }
    ],
    management: [
      {
        id: '3',
        title: 'Utilisateurs',
        description: 'Gérer les comptes et permissions',
        icon: <Users className="h-5 w-5" />,
        action: () => setActiveTab('users'),
        color: 'text-purple-600',
        bgColor: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
        hoverColor: 'hover:border-purple-300',
        priority: 'medium'
      },
      {
        id: '4',
        title: 'Facturation',
        description: 'Voir les factures et paiements',
        icon: <CreditCard className="h-5 w-5" />,
        action: () => setActiveTab('billing'),
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
        hoverColor: 'hover:border-indigo-300',
        priority: 'medium'
      }
    ],
    system: [
      {
        id: '5',
        title: 'Sauvegarde système',
        description: 'Lancer une sauvegarde complète',
        icon: <Database className="h-5 w-5" />,
        action: () => {
          addNotification({
            type: 'system',
            title: 'Sauvegarde démarrée',
            message: 'La sauvegarde complète du système a été initiée',
            priority: 'medium'
          });
          console.log('Sauvegarder');
        },
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
        hoverColor: 'hover:border-orange-300',
        priority: 'low'
      },
      {
        id: '6',
        title: 'Rapports',
        description: 'Générer des rapports détaillés',
        icon: <BarChart3 className="h-5 w-5" />,
        action: () => {
          addNotification({
            type: 'info',
            title: 'Rapport en cours de génération',
            message: 'Le rapport mensuel sera disponible dans quelques instants',
            priority: 'low'
          });
          console.log('Générer rapport');
        },
        color: 'text-rose-600',
        bgColor: 'bg-rose-50 border-rose-200 hover:bg-rose-100',
        hoverColor: 'hover:border-rose-300',
        priority: 'low'
      }
    ]
  };

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Tableau de bord', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'companies', label: 'Entreprises', icon: <Building2 className="h-4 w-4" /> },
    { id: 'users', label: 'Utilisateurs', icon: <Users className="h-4 w-4" /> },
    { id: 'tickets', label: 'Tickets', icon: <TicketCheck className="h-4 w-4" /> },
    { id: 'billing', label: 'Facturation', icon: <CreditCard className="h-4 w-4" /> },
    { id: 'system', label: 'Système', icon: <Server className="h-4 w-4" /> },
    { id: 'logs', label: 'Journaux', icon: <FileText className="h-4 w-4" /> },
    { id: 'settings', label: 'Paramètres', icon: <Settings className="h-4 w-4" /> },
    
    // Séparateur
    { id: 'separator1', label: '---', icon: null, separator: true },
    
    // Technologies avancées
    { id: 'digital-twin', label: 'Jumeau Numérique', icon: <Cpu className="h-4 w-4" /> },
    { id: 'knowledge-graph', label: 'Graphe Connaissances', icon: <Database className="h-4 w-4" /> },
    { id: 'bi-predictive', label: 'Analytics Prédictifs', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'ar-support', label: 'Support AR', icon: <Globe className="h-4 w-4" /> },
    { id: 'vr-simulations', label: 'Simulations VR', icon: <Zap className="h-4 w-4" /> },
    
    // Séparateur
    { id: 'separator2', label: '---', icon: null, separator: true },
    
    // Marketplace & Services
    { id: 'marketplace', label: 'Marketplace', icon: <Users className="h-4 w-4" /> },
    { id: 'expert-teleportation', label: 'Téléportation Experts', icon: <Activity className="h-4 w-4" /> },
    { id: 'ar-recognition', label: 'Reconnaissance AR', icon: <Eye className="h-4 w-4" /> },
    
    // Séparateur
    { id: 'separator3', label: '---', icon: null, separator: true },
    
    // Tickets & Support
    { id: 'tickets-ia', label: 'Tickets IA', icon: <Brain className="h-4 w-4" /> },
    { id: 'tickets-demo', label: 'Tickets Demo', icon: <TicketCheck className="h-4 w-4" /> },
    { id: 'tickets-create', label: 'Créer Ticket', icon: <Plus className="h-4 w-4" /> },
    
    // Séparateur
    { id: 'separator4', label: '---', icon: null, separator: true },
    
    // IA & Analytics Avancés
    { id: 'behavioral', label: 'Personnalisation Comportementale', icon: <Brain className="h-4 w-4" /> },
    { id: 'bi-predictive', label: 'Business Intelligence Prédictive', icon: <BarChart3 className="h-4 w-4" /> },
    
    // Séparateur
    { id: 'separator5', label: '---', icon: null, separator: true },
    
    // Gamification & Tests
    { id: 'gamification', label: 'Gamification', icon: <Star className="h-4 w-4" /> },
    { id: 'tests', label: 'Tests & Monitoring', icon: <CheckCircle className="h-4 w-4" /> },
    { id: 'inventory', label: 'Inventory', icon: <Database className="h-4 w-4" /> },
  ];

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

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <LayoutDashboard className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
              <p className="text-sm text-gray-500">Panneau de contrôle système</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <NotificationDropdown />
            
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          w-64 
          bg-white border-r border-gray-200 
          overflow-visible
          min-h-screen
          flex-shrink-0
        `}>
          <div className="p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Menu Administration</h3>
            <nav className="space-y-2">
              {menuItems.map((item) => {
                if (item.separator) {
                  return (
                    <div key={item.id} className="border-t border-gray-200 my-2"></div>
                  );
                }
                
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      setActiveTab(item.id);
                      // Rediriger vers la page correspondante
                      if (item.id === 'digital-twin') {
                        window.location.href = '/digital-twin';
                      } else if (item.id === 'knowledge-graph') {
                        window.location.href = '/knowledge-graph';
                      } else if (item.id === 'bi-predictive') {
                        window.location.href = '/bi/predictive';
                      } else if (item.id === 'ar-support') {
                        window.location.href = '/ar-support';
                      } else if (item.id === 'vr-simulations') {
                        window.location.href = '/vr-simulations';
                      } else if (item.id === 'marketplace') {
                        window.location.href = '/marketplace';
                      } else if (item.id === 'expert-teleportation') {
                        window.location.href = '/expert-teleportation';
                      } else if (item.id === 'ar-recognition') {
                        window.location.href = '/ar-recognition';
                      } else if (item.id === 'tickets-ia') {
                        window.location.href = '/tickets/ai-enhanced';
                      } else if (item.id === 'tickets-demo') {
                        window.location.href = '/tickets/demo';
                      } else if (item.id === 'tickets-create') {
                        window.location.href = '/tickets/create';
                      } else if (item.id === 'behavioral') {
                        window.location.href = '/behavioral';
                      } else if (item.id === 'bi-predictive') {
                        window.location.href = '/bi/predictive';
                      } else if (item.id === 'gamification') {
                        window.location.href = '/gamification';
                      } else if (item.id === 'tests') {
                        window.location.href = '/tests';
                      } else if (item.id === 'inventory') {
                        window.location.href = '/inventory';
                      } else if (item.id === 'billing') {
                        window.location.href = '/billing';
                      }
                    }}
                  >
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </Button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Tableau de bord */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Actions rapides - Nouvelle organisation par catégories */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Actions rapides</h2>
                  <p className="text-gray-600">Accédez rapidement aux fonctionnalités essentielles organisées par catégorie</p>
                </div>
                
                {/* Actions principales - Priorité haute */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    <h3 className="text-lg font-medium text-gray-900">Actions principales</h3>
                    <Badge variant="secondary" className="text-xs">Priorité haute</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quickActions.primary.map((action) => (
                      <div
                        key={action.id}
                        className={`
                          border-2 rounded-xl p-5 cursor-pointer
                          transition-all duration-200 transform
                          ${action.bgColor} ${action.hoverColor}
                          flex items-center gap-4
                          hover:shadow-lg hover:scale-[1.02]
                          relative overflow-hidden
                        `}
                        onClick={action.action}
                      >
                        {/* Badge priorité */}
                        <div className="absolute top-3 right-3">
                          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                        </div>
                        
                        {/* Icône principale */}
                        <div className={`p-3 rounded-xl ${action.color} bg-opacity-10`}>
                          <div className={action.color}>
                            {action.icon}
                          </div>
                        </div>
                        
                        {/* Contenu */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1 text-base">{action.title}</h3>
                          <p className="text-sm text-gray-600 leading-relaxed">{action.description}</p>
                        </div>
                        
                        {/* Flèche */}
                        <div className="text-gray-400">
                          <ArrowUpRight className="h-5 w-5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions de gestion - Priorité moyenne */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                    <h3 className="text-lg font-medium text-gray-900">Gestion</h3>
                    <Badge variant="secondary" className="text-xs">Priorité moyenne</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quickActions.management.map((action) => (
                      <div
                        key={action.id}
                        className={`
                          border rounded-lg p-4 cursor-pointer
                          transition-all duration-200
                          ${action.bgColor} ${action.hoverColor}
                          flex items-center gap-3
                          hover:shadow-md hover:scale-[1.01]
                        `}
                        onClick={action.action}
                      >
                        <div className={`p-2 rounded-lg ${action.color} bg-opacity-10`}>
                          <div className={action.color}>
                            {action.icon}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">{action.title}</h3>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                        
                        <div className="text-gray-400">
                          <ArrowUpRight className="h-4 w-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions système - Priorité basse */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <h3 className="text-lg font-medium text-gray-900">Système</h3>
                    <Badge variant="secondary" className="text-xs">Priorité basse</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quickActions.system.map((action) => (
                      <div
                        key={action.id}
                        className={`
                          border rounded-lg p-4 cursor-pointer
                          transition-all duration-200
                          ${action.bgColor} ${action.hoverColor}
                          flex items-center gap-3
                          hover:shadow-sm
                        `}
                        onClick={action.action}
                      >
                        <div className={`p-2 rounded-lg ${action.color} bg-opacity-10`}>
                          <div className={action.color}>
                            {action.icon}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">{action.title}</h3>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                        
                        <div className="text-gray-400">
                          <ArrowUpRight className="h-4 w-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Légende et aide */}
                <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                        <span className="text-sm text-gray-600">Actions critiques</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                        <span className="text-sm text-gray-600">Gestion quotidienne</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="text-sm text-gray-600">Maintenance système</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-gray-500">
                      <Settings className="h-4 w-4 mr-2" />
                      Personnaliser
                    </Button>
                  </div>
                </div>
              </div>

              {/* Statistiques principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-600">Entreprises</CardTitle>
                      <Building2 className="h-4 w-4 text-blue-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{adminStats.totalCompanies}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <ArrowUpRight className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-gray-600">+{adminStats.newSignups} ce mois</span>
                    </div>
                    <div className="mt-3">
                      <Progress value={(adminStats.activeCompanies / adminStats.totalCompanies) * 100} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        {adminStats.activeCompanies} actifs
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-600">Utilisateurs</CardTitle>
                      <Users className="h-4 w-4 text-green-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{adminStats.activeUsers}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <UserCheck className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-gray-600">{adminStats.totalUsers} au total</span>
                    </div>
                    <div className="mt-3">
                      <Progress value={(adminStats.activeUsers / adminStats.totalUsers) * 100} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.round((adminStats.activeUsers / adminStats.totalUsers) * 100)}% actifs
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-600">Revenus</CardTitle>
                      <DollarSign className="h-4 w-4 text-purple-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(adminStats.monthlyRevenue)}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-gray-600">+12% vs mois dernier</span>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs text-gray-500">
                        {adminStats.cancellations} désinscriptions ce mois
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-600">Satisfaction</CardTitle>
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{adminStats.customerSatisfaction}/5</div>
                    <div className="flex items-center gap-2 mt-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-gray-600">{adminStats.resolvedTickets} tickets résolus</span>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs text-gray-500">
                        Temps moyen: {adminStats.avgResponseTime}h
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Alertes et système */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white border-gray-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Alertes système</CardTitle>
                      <Badge variant="outline">
                        {systemAlerts.filter(a => !a.resolved).length} actives
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {systemAlerts.slice(0, 4).map((alert) => (
                        <div key={alert.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                          <div className={`p-1.5 rounded-full ${getAlertColor(alert.type)}`}>
                            <AlertTriangle className="h-3 w-3" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{alert.title}</p>
                            <p className="text-xs text-gray-600">{alert.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={alert.resolved ? "default" : "destructive"} className="text-xs">
                                {alert.resolved ? "Résolu" : "En cours"}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {formatDate(alert.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-gray-200">
                  <CardHeader>
                    <CardTitle>État du système</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Server className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-gray-700">Temps de disponibilité</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{adminStats.systemUptime}%</span>
                          <Progress value={adminStats.systemUptime} className="w-20 h-2" />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-700">Charge serveur</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{adminStats.serverLoad}%</span>
                          <Progress value={adminStats.serverLoad} className="w-20 h-2" />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-purple-500" />
                          <span className="text-sm text-gray-700">Stockage utilisé</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{adminStats.storageUsed}%</span>
                          <Progress value={adminStats.storageUsed} className="w-20 h-2" />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-orange-500" />
                          <span className="text-sm text-gray-700">Bande passante</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{adminStats.bandwidthUsed}%</span>
                          <Progress value={adminStats.bandwidthUsed} className="w-20 h-2" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Entreprises */}
          {activeTab === 'companies' && (
            <div className="space-y-6">
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Gestion des entreprises</CardTitle>
                      <CardDescription>{companies.length} entreprises au total</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Rechercher..."
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
                      {companies.map((company) => (
                        <TableRow key={company.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-gray-900">{company.nom}</p>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {company.ville}, {company.pays}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm text-gray-900 flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {company.emailContact}
                              </p>
                              {company.telephone && (
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {company.telephone}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getPlanBadge(company.planAbonnement)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-900">{company._count.users}</span>
                              <span className="text-xs text-gray-500">/ {company.limiteUtilisateurs}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-900">{company._count.tickets}</TableCell>
                          <TableCell>{getStatusBadge(company.statut)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
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
            </div>
          )}

          {/* Autres onglets (placeholder) */}
          {activeTab !== 'dashboard' && activeTab !== 'companies' && (
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle>
                  {menuItems.find(item => item.id === activeTab)?.label}
                </CardTitle>
                <CardDescription>
                  Contenu en développement pour {menuItems.find(item => item.id === activeTab)?.label.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-gray-500">
                    <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Cette section est en cours de développement</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}