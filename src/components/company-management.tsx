'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building, 
  Users, 
  Ticket, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  CreditCard, 
  Calendar,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  Shield,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Settings,
  Activity,
  Database,
  Server,
  Wifi,
  Lock,
  Unlock,
  UserPlus,
  UserMinus,
  MailIcon,
  PhoneIcon,
  FileText,
  DollarSign,
  Target,
  Award,
  Star,
  Crown,
  Rocket,
  Briefcase,
  Building2,
  Globe2,
  Contact,
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
  Sun,
  Moon,
  Sunrise,
  Sunset,
  XSquare
} from 'lucide-react';

interface Company {
  id: string;
  nom: string;
  slug: string;
  domaine?: string;
  logo?: string;
  description?: string;
  secteur?: string;
  taille?: string;
  pays?: string;
  ville?: string;
  telephone?: string;
  emailContact: string;
  statut: 'active' | 'trial' | 'suspended' | 'cancelled';
  planAbonnement: 'starter' | 'pro' | 'enterprise';
  dateFinEssai?: Date;
  limiteUtilisateurs: number;
  settings?: string;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    users: number;
    tickets: number;
  };
  subscription?: {
    id: string;
    statut: string;
    dateDebut: Date;
    dateFin: Date;
    prixMensuel: number;
    autoRenew: boolean;
  };
  metrics?: {
    lastLogin: Date;
    activeUsers: number;
    ticketsThisMonth: number;
    storageUsed: number;
    apiCalls: number;
  };
}

interface CompanyFormData {
  nom: string;
  emailContact: string;
  telephone?: string;
  pays?: string;
  ville?: string;
  secteur?: string;
  taille?: string;
  description?: string;
  planAbonnement: 'starter' | 'pro' | 'enterprise';
  limiteUtilisateurs: number;
  domaine?: string;
}

export function CompanyManagement() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState<CompanyFormData>({
    nom: '',
    emailContact: '',
    telephone: '',
    pays: '',
    ville: '',
    secteur: '',
    taille: '',
    description: '',
    planAbonnement: 'starter',
    limiteUtilisateurs: 5,
    domaine: ''
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      
      // Simuler des données réelles
      const mockCompanies: Company[] = [
        {
          id: '1',
          nom: 'TechCorp Solutions',
          slug: 'techcorp-solutions',
          domaine: 'techcorp.com',
          logo: '/logos/techcorp.png',
          description: 'Entreprise spécialisée dans les solutions technologiques pour les PME',
          secteur: 'Technologie',
          taille: 'PME',
          pays: 'France',
          ville: 'Paris',
          telephone: '+33 1 23 45 67 89',
          emailContact: 'contact@techcorp.com',
          statut: 'active',
          planAbonnement: 'pro',
          limiteUtilisateurs: 50,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-20'),
          _count: { users: 23, tickets: 156 },
          subscription: {
            id: 'sub1',
            statut: 'active',
            dateDebut: new Date('2024-01-01'),
            dateFin: new Date('2024-12-31'),
            prixMensuel: 299,
            autoRenew: true
          },
          metrics: {
            lastLogin: new Date('2024-01-15T14:30:00Z'),
            activeUsers: 18,
            ticketsThisMonth: 23,
            storageUsed: 67,
            apiCalls: 12500
          }
        },
        {
          id: '2',
          nom: 'Digital Agency',
          slug: 'digital-agency',
          domaine: 'digital-agency.fr',
          description: 'Agence de communication digitale',
          secteur: 'Marketing',
          taille: 'Startup',
          pays: 'France',
          ville: 'Lyon',
          emailContact: 'hello@digitalagency.com',
          statut: 'trial',
          planAbonnement: 'starter',
          dateFinEssai: new Date('2024-02-15'),
          limiteUtilisateurs: 10,
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-18'),
          _count: { users: 5, tickets: 23 },
          subscription: {
            id: 'sub2',
            statut: 'trial',
            dateDebut: new Date('2024-01-10'),
            dateFin: new Date('2024-02-15'),
            prixMensuel: 49,
            autoRenew: false
          },
          metrics: {
            lastLogin: new Date('2024-01-15T16:45:00Z'),
            activeUsers: 4,
            ticketsThisMonth: 8,
            storageUsed: 23,
            apiCalls: 3200
          }
        },
        {
          id: '3',
          nom: 'StartupXYZ',
          slug: 'startupxyz',
          description: 'Startup innovante dans la fintech',
          secteur: 'Finance',
          taille: 'Startup',
          pays: 'France',
          ville: 'Marseille',
          emailContact: 'info@startupxyz.com',
          statut: 'suspended',
          planAbonnement: 'starter',
          limiteUtilisateurs: 5,
          createdAt: new Date('2023-12-01'),
          updatedAt: new Date('2024-01-05'),
          _count: { users: 3, tickets: 45 },
          metrics: {
            lastLogin: new Date('2024-01-10T09:15:00Z'),
            activeUsers: 0,
            ticketsThisMonth: 0,
            storageUsed: 12,
            apiCalls: 450
          }
        },
        {
          id: '4',
          nom: 'Global Enterprise',
          slug: 'global-enterprise',
          domaine: 'global.com',
          description: 'Multinationale avec des bureaux dans le monde entier',
          secteur: 'Services',
          taille: 'Grand compte',
          pays: 'France',
          ville: 'Paris',
          telephone: '+33 1 98 76 54 32',
          emailContact: 'admin@global.com',
          statut: 'active',
          planAbonnement: 'enterprise',
          limiteUtilisateurs: 500,
          createdAt: new Date('2023-06-01'),
          updatedAt: new Date('2024-01-15'),
          _count: { users: 234, tickets: 567 },
          subscription: {
            id: 'sub4',
            statut: 'active',
            dateDebut: new Date('2023-06-01'),
            dateFin: new Date('2024-12-31'),
            prixMensuel: 1999,
            autoRenew: true
          },
          metrics: {
            lastLogin: new Date('2024-01-15T18:20:00Z'),
            activeUsers: 189,
            ticketsThisMonth: 67,
            storageUsed: 89,
            apiCalls: 89000
          }
        }
      ];
      
      setCompanies(mockCompanies);
    } catch (error) {
      console.error('Erreur lors de la récupération des sociétés:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async () => {
    try {
      // Simuler la création
      const newCompany: Company = {
        id: Date.now().toString(),
        nom: formData.nom,
        slug: formData.nom.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        emailContact: formData.emailContact,
        telephone: formData.telephone,
        pays: formData.pays,
        ville: formData.ville,
        secteur: formData.secteur,
        taille: formData.taille,
        description: formData.description,
        planAbonnement: formData.planAbonnement,
        limiteUtilisateurs: formData.limiteUtilisateurs,
        domaine: formData.domaine,
        statut: 'trial',
        dateFinEssai: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 jours
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { users: 0, tickets: 0 }
      };
      
      setCompanies([...companies, newCompany]);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la création de la société:', error);
    }
  };

  const handleUpdateCompany = async () => {
    if (!selectedCompany) return;
    
    try {
      // Simuler la mise à jour
      const updatedCompanies = companies.map(company => 
        company.id === selectedCompany.id 
          ? { ...company, ...formData, updatedAt: new Date() }
          : company
      );
      
      setCompanies(updatedCompanies);
      setIsEditDialogOpen(false);
      setSelectedCompany(null);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la société:', error);
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette société ? Cette action est irréversible.')) {
      return;
    }
    
    try {
      setCompanies(companies.filter(company => company.id !== companyId));
    } catch (error) {
      console.error('Erreur lors de la suppression de la société:', error);
    }
  };

  const handleSuspendCompany = async (companyId: string) => {
    try {
      const updatedCompanies = companies.map(company => 
        company.id === companyId 
          ? { ...company, statut: 'suspended' as const, updatedAt: new Date() }
          : company
      );
      setCompanies(updatedCompanies);
    } catch (error) {
      console.error('Erreur lors de la suspension de la société:', error);
    }
  };

  const handleActivateCompany = async (companyId: string) => {
    try {
      const updatedCompanies = companies.map(company => 
        company.id === companyId 
          ? { ...company, statut: 'active' as const, updatedAt: new Date() }
          : company
      );
      setCompanies(updatedCompanies);
    } catch (error) {
      console.error('Erreur lors de l\'activation de la société:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      emailContact: '',
      telephone: '',
      pays: '',
      ville: '',
      secteur: '',
      taille: '',
      description: '',
      planAbonnement: 'starter',
      limiteUtilisateurs: 5,
      domaine: ''
    });
  };

  const openEditDialog = (company: Company) => {
    setSelectedCompany(company);
    setFormData({
      nom: company.nom,
      emailContact: company.emailContact,
      telephone: company.telephone || '',
      pays: company.pays || '',
      ville: company.ville || '',
      secteur: company.secteur || '',
      taille: company.taille || '',
      description: company.description || '',
      planAbonnement: company.planAbonnement,
      limiteUtilisateurs: company.limiteUtilisateurs,
      domaine: company.domaine || ''
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (company: Company) => {
    setSelectedCompany(company);
    setIsViewDialogOpen(true);
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
    
    const icons = {
      active: <CheckCircle className="h-3 w-3 mr-1" />,
      trial: <Clock className="h-3 w-3 mr-1" />,
      suspended: <AlertCircle className="h-3 w-3 mr-1" />,
      cancelled: <XSquare className="h-3 w-3 mr-1" />
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants]} className="flex items-center">
        {icons[status as keyof typeof icons]}
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
    
    const icons = {
      starter: <Rocket className="h-3 w-3 mr-1" />,
      pro: <Zap className="h-3 w-3 mr-1" />,
      enterprise: <Crown className="h-3 w-3 mr-1" />
    };
    
    return (
      <Badge className={colors[plan as keyof typeof colors]}>
        {icons[plan as keyof typeof icons]}
        {plan.toUpperCase()}
      </Badge>
    );
  };

  const getSizeIcon = (size: string) => {
    switch (size) {
      case 'Startup': return <Rocket className="h-4 w-4" />;
      case 'PME': return <Building2 className="h-4 w-4" />;
      case 'Grand compte': return <Building className="h-4 w-4" />;
      default: return <Briefcase className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
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
                         company.emailContact.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || company.statut === statusFilter;
    const matchesPlan = planFilter === 'all' || company.planAbonnement === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const stats = {
    total: companies.length,
    active: companies.filter(c => c.statut === 'active').length,
    trial: companies.filter(c => c.statut === 'trial').length,
    suspended: companies.filter(c => c.statut === 'suspended').length,
    totalUsers: companies.reduce((sum, c) => sum + c._count.users, 0),
    totalTickets: companies.reduce((sum, c) => sum + c._count.tickets, 0),
    monthlyRevenue: companies.reduce((sum, c) => sum + (c.subscription?.prixMensuel || 0), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des sociétés...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sociétés</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} actives
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Essais Actifs</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.trial}</div>
            <p className="text-xs text-muted-foreground">
              En période d'essai
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Sur toutes les sociétés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalTickets}</div>
            <p className="text-xs text-muted-foreground">
              Total créés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenu Mensuel</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.monthlyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              MRR estimé
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestion des Sociétés</CardTitle>
              <CardDescription>
                Administrez toutes les sociétés de la plateforme
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle Société
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Créer une nouvelle société</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nom">Nom de la société *</Label>
                      <Input
                        id="nom"
                        value={formData.nom}
                        onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                        placeholder="ex: TechCorp Solutions"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emailContact">Email de contact *</Label>
                      <Input
                        id="emailContact"
                        type="email"
                        value={formData.emailContact}
                        onChange={(e) => setFormData(prev => ({ ...prev, emailContact: e.target.value }))}
                        placeholder="contact@company.com"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="telephone">Téléphone</Label>
                      <Input
                        id="telephone"
                        value={formData.telephone}
                        onChange={(e) => setFormData(prev => ({ ...prev, telephone: e.target.value }))}
                        placeholder="+33 1 23 45 67 89"
                      />
                    </div>
                    <div>
                      <Label htmlFor="domaine">Domaine</Label>
                      <Input
                        id="domaine"
                        value={formData.domaine}
                        onChange={(e) => setFormData(prev => ({ ...prev, domaine: e.target.value }))}
                        placeholder="company.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pays">Pays</Label>
                      <Input
                        id="pays"
                        value={formData.pays}
                        onChange={(e) => setFormData(prev => ({ ...prev, pays: e.target.value }))}
                        placeholder="France"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ville">Ville</Label>
                      <Input
                        id="ville"
                        value={formData.ville}
                        onChange={(e) => setFormData(prev => ({ ...prev, ville: e.target.value }))}
                        placeholder="Paris"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="secteur">Secteur</Label>
                      <Select value={formData.secteur} onValueChange={(value) => setFormData(prev => ({ ...prev, secteur: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un secteur" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Technologie">Technologie</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="Santé">Santé</SelectItem>
                          <SelectItem value="Éducation">Éducation</SelectItem>
                          <SelectItem value="Commerce">Commerce</SelectItem>
                          <SelectItem value="Services">Services</SelectItem>
                          <SelectItem value="Autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="taille">Taille</Label>
                      <Select value={formData.taille} onValueChange={(value) => setFormData(prev => ({ ...prev, taille: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une taille" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Startup">Startup</SelectItem>
                          <SelectItem value="PME">PME</SelectItem>
                          <SelectItem value="Grand compte">Grand compte</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description de la société..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="planAbonnement">Plan d'abonnement *</Label>
                      <Select value={formData.planAbonnement} onValueChange={(value: any) => setFormData(prev => ({ ...prev, planAbonnement: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="starter">Starter - €49/mois</SelectItem>
                          <SelectItem value="pro">Pro - €299/mois</SelectItem>
                          <SelectItem value="enterprise">Enterprise - €1999/mois</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="limiteUtilisateurs">Limite d'utilisateurs *</Label>
                      <Input
                        id="limiteUtilisateurs"
                        type="number"
                        value={formData.limiteUtilisateurs}
                        onChange={(e) => setFormData(prev => ({ ...prev, limiteUtilisateurs: parseInt(e.target.value) || 5 }))}
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleCreateCompany} className="flex-1">
                      Créer la société
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Annuler
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher une société..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
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
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Button variant="outline" size="sm" onClick={fetchCompanies}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>

          {/* Tableau des sociétés */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Société</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Utilisateurs</TableHead>
                <TableHead>Tickets</TableHead>
                <TableHead>Revenu</TableHead>
                <TableHead>Créée le</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {company.logo ? (
                        <img src={company.logo} alt={company.nom} className="h-8 w-8 rounded" />
                      ) : (
                        <div className="h-8 w-8 rounded bg-slate-200 flex items-center justify-center">
                          <Building className="h-4 w-4 text-slate-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{company.nom}</p>
                        <p className="text-sm text-muted-foreground">{company.slug}</p>
                        {company.secteur && (
                          <div className="flex items-center gap-1 mt-1">
                            {getSizeIcon(company.taille || '')}
                            <span className="text-xs text-muted-foreground">{company.secteur}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <MailIcon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{company.emailContact}</span>
                      </div>
                      {company.telephone && (
                        <div className="flex items-center gap-1 mb-1">
                          <PhoneIcon className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{company.telephone}</span>
                        </div>
                      )}
                      {company.ville && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{company.ville}, {company.pays}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(company.statut)}</TableCell>
                  <TableCell>{getPlanBadge(company.planAbonnement)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{company._count.users}</span>
                      <span className="text-xs text-muted-foreground">/ {company.limiteUtilisateurs}</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            (company._count.users / company.limiteUtilisateurs) > 0.8 ? 'bg-red-500' :
                            (company._count.users / company.limiteUtilisateurs) > 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min((company._count.users / company.limiteUtilisateurs) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{company._count.tickets}</span>
                      {company.metrics?.ticketsThisMonth && (
                        <Badge variant="outline" className="text-xs">
                          +{company.metrics.ticketsThisMonth} ce mois
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {company.subscription ? (
                      <div>
                        <p className="font-medium">{formatCurrency(company.subscription.prixMensuel)}</p>
                        <p className="text-xs text-muted-foreground">/ mois</p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{formatDate(company.createdAt)}</p>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openViewDialog(company)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir les détails
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(company)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        {company.statut === 'active' ? (
                          <DropdownMenuItem onClick={() => handleSuspendCompany(company.id)}>
                            <Lock className="h-4 w-4 mr-2" />
                            Suspendre
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleActivateCompany(company.id)}>
                            <Unlock className="h-4 w-4 mr-2" />
                            Activer
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleDeleteCompany(company.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de visualisation */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la société</DialogTitle>
          </DialogHeader>
          {selectedCompany && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Aperçu</TabsTrigger>
                <TabsTrigger value="users">Utilisateurs</TabsTrigger>
                <TabsTrigger value="metrics">Métriques</TabsTrigger>
                <TabsTrigger value="billing">Facturation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nom</Label>
                    <p className="font-medium">{selectedCompany.nom}</p>
                  </div>
                  <div>
                    <Label>Email de contact</Label>
                    <p className="font-medium">{selectedCompany.emailContact}</p>
                  </div>
                  <div>
                    <Label>Téléphone</Label>
                    <p className="font-medium">{selectedCompany.telephone || '-'}</p>
                  </div>
                  <div>
                    <Label>Domaine</Label>
                    <p className="font-medium">{selectedCompany.domaine || '-'}</p>
                  </div>
                  <div>
                    <Label>Secteur</Label>
                    <p className="font-medium">{selectedCompany.secteur || '-'}</p>
                  </div>
                  <div>
                    <Label>Taille</Label>
                    <p className="font-medium">{selectedCompany.taille || '-'}</p>
                  </div>
                  <div>
                    <Label>Localisation</Label>
                    <p className="font-medium">
                      {selectedCompany.ville && selectedCompany.pays 
                        ? `${selectedCompany.ville}, ${selectedCompany.pays}`
                        : '-'
                      }
                    </p>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <p className="font-medium">{selectedCompany.description || '-'}</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="users" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Utilisateurs totaux</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedCompany._count.users}</div>
                      <p className="text-sm text-muted-foreground">
                        sur {selectedCompany.limiteUtilisateurs} autorisés
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Utilisateurs actifs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {selectedCompany.metrics?.activeUsers || 0}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        ce mois-ci
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="metrics" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Stockage utilisé</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {selectedCompany.metrics?.storageUsed || 0}%
                      </div>
                      <p className="text-sm text-muted-foreground">
                        de l'espace alloué
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Appels API</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {(selectedCompany.metrics?.apiCalls || 0).toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        ce mois-ci
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="billing" className="space-y-4">
                {selectedCompany.subscription && (
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Abonnement actuel</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-lg font-bold">
                          {selectedCompany.planAbonnement.toUpperCase()}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(selectedCompany.subscription.prixMensuel)}/mois
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Prochain paiement</CardTitle>
                      </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold">
                          {formatDate(selectedCompany.subscription.dateFin)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {selectedCompany.subscription.autoRenew ? 'Renouvellement auto' : 'Manuel'}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de modification */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier la société</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-nom">Nom de la société *</Label>
                <Input
                  id="edit-nom"
                  value={formData.nom}
                  onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                  placeholder="ex: TechCorp Solutions"
                />
              </div>
              <div>
                <Label htmlFor="edit-emailContact">Email de contact *</Label>
                <Input
                  id="edit-emailContact"
                  type="email"
                  value={formData.emailContact}
                  onChange={(e) => setFormData(prev => ({ ...prev, emailContact: e.target.value }))}
                  placeholder="contact@company.com"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-telephone">Téléphone</Label>
                <Input
                  id="edit-telephone"
                  value={formData.telephone}
                  onChange={(e) => setFormData(prev => ({ ...prev, telephone: e.target.value }))}
                  placeholder="+33 1 23 45 67 89"
                />
              </div>
              <div>
                <Label htmlFor="edit-domaine">Domaine</Label>
                <Input
                  id="edit-domaine"
                  value={formData.domaine}
                  onChange={(e) => setFormData(prev => ({ ...prev, domaine: e.target.value }))}
                  placeholder="company.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-planAbonnement">Plan d'abonnement *</Label>
                <Select value={formData.planAbonnement} onValueChange={(value: any) => setFormData(prev => ({ ...prev, planAbonnement: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter - €49/mois</SelectItem>
                    <SelectItem value="pro">Pro - €299/mois</SelectItem>
                    <SelectItem value="enterprise">Enterprise - €1999/mois</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-limiteUtilisateurs">Limite d'utilisateurs *</Label>
                <Input
                  id="edit-limiteUtilisateurs"
                  type="number"
                  value={formData.limiteUtilisateurs}
                  onChange={(e) => setFormData(prev => ({ ...prev, limiteUtilisateurs: parseInt(e.target.value) || 5 }))}
                  min="1"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleUpdateCompany} className="flex-1">
                Mettre à jour
              </Button>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}