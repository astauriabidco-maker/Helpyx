'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  DollarSign, 
  TrendingUp,
  Users,
  CreditCard,
  BarChart3,
  Calendar,
  FileText,
  Download,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Crown,
  Zap,
  Rocket,
  Shield,
  Star,
  ExternalLink,
  Settings,
  PaymentMethod,
  X,
  AlertCircle
} from 'lucide-react';

interface BillingMetrics {
  totalRevenue: number;
  monthlyRecurring: number;
  annualRecurring: number;
  growth: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  churnRate: number;
  customerLifetimeValue: number;
  averageRevenuePerUser: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalInvoices: number;
}

interface Subscription {
  id: string;
  company: {
    id: string;
    name: string;
    email: string;
  };
  plan: {
    name: string;
    price: number;
    features: string[];
  };
  status: 'active' | 'trial' | 'cancelled' | 'expired' | 'past_due';
  startDate: Date;
  endDate: Date;
  nextBillingDate: Date;
  amount: number;
  autoRenew: boolean;
  paymentMethod?: string;
  users: number;
  maxUsers: number;
  stripeSubscriptionId?: string;
}

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  yearlyPrice?: number;
  features: string[];
  maxUsers: number;
  maxTickets?: number;
  maxInventory?: number;
  supportLevel: 'basic' | 'priority' | 'dedicated';
  popular?: boolean;
  status: 'active' | 'inactive';
  subscriptions: number;
  revenue: number;
}

export default function BillingPage() {
  const [metrics, setMetrics] = useState<BillingMetrics>({
    totalRevenue: 0,
    monthlyRecurring: 0,
    annualRecurring: 0,
    growth: 0,
    activeSubscriptions: 0,
    trialSubscriptions: 0,
    churnRate: 0,
    customerLifetimeValue: 0,
    averageRevenuePerUser: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    totalInvoices: 0
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  useEffect(() => {
    loadBillingData();
  }, [timeRange]);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      
      // Charger les métriques
      const metricsResponse = await fetch(`/api/billing/metrics?range=${timeRange}`);
      if (metricsResponse.ok) {
        const data = await metricsResponse.json();
        setMetrics(data.metrics);
      } else {
        // Données de démonstration
        setMetrics({
          totalRevenue: 2847500,
          monthlyRecurring: 237292,
          annualRecurring: 2847504,
          growth: 23.5,
          activeSubscriptions: 1189,
          trialSubscriptions: 23,
          churnRate: 2.3,
          customerLifetimeValue: 12500,
          averageRevenuePerUser: 285,
          pendingInvoices: 45,
          overdueInvoices: 12,
          totalInvoices: 2847
        });
      }

      // Charger les abonnements
      const subscriptionsResponse = await fetch('/api/billing/subscriptions');
      if (subscriptionsResponse.ok) {
        const data = await subscriptionsResponse.json();
        setSubscriptions(data.subscriptions || []);
      } else {
        // Données de démonstration
        setSubscriptions([
          {
            id: '1',
            company: { id: '1', name: 'TechCorp Solutions', email: 'contact@techcorp.com' },
            plan: { name: 'Professional', price: 299, features: ['API Access', 'Priority Support'] },
            status: 'active',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            nextBillingDate: new Date('2024-02-01'),
            amount: 299,
            autoRenew: true,
            paymentMethod: 'stripe',
            users: 23,
            maxUsers: 50,
            stripeSubscriptionId: 'sub_123'
          },
          {
            id: '2',
            company: { id: '2', name: 'Digital Agency', email: 'hello@digitalagency.com' },
            plan: { name: 'Starter', price: 49, features: ['Basic Support', '10 Users'] },
            status: 'trial',
            startDate: new Date('2024-01-10'),
            endDate: new Date('2024-02-15'),
            nextBillingDate: new Date('2024-02-15'),
            amount: 49,
            autoRenew: false,
            users: 5,
            maxUsers: 10,
            stripeSubscriptionId: 'sub_456'
          }
        ]);
      }

      // Charger les plans
      const plansResponse = await fetch('/api/billing/plans');
      if (plansResponse.ok) {
        const data = await plansResponse.json();
        setPlans(data.plans || []);
      } else {
        // Données de démonstration
        setPlans([
          {
            id: '1',
            name: 'Starter',
            slug: 'starter',
            description: 'Perfect for small teams',
            price: 49,
            yearlyPrice: 490,
            features: ['10 Users', 'Basic Support', '100 Tickets/month'],
            maxUsers: 10,
            maxTickets: 100,
            supportLevel: 'basic',
            subscriptions: 423,
            revenue: 20727
          },
          {
            id: '2',
            name: 'Professional',
            slug: 'professional',
            description: 'For growing businesses',
            price: 299,
            yearlyPrice: 2990,
            features: ['50 Users', 'Priority Support', 'Unlimited Tickets'],
            maxUsers: 50,
            supportLevel: 'priority',
            popular: true,
            subscriptions: 567,
            revenue: 169533
          },
          {
            id: '3',
            name: 'Enterprise',
            slug: 'enterprise',
            description: 'For large organizations',
            price: 1999,
            yearlyPrice: 19990,
            features: ['Unlimited Users', 'Dedicated Support', 'Custom Features'],
            maxUsers: -1,
            supportLevel: 'dedicated',
            subscriptions: 257,
            revenue: 513743
          }
        ]);
      }

    } catch (error) {
      console.error('Error loading billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCheckoutSession = async (planId: string, companyId: string) => {
    try {
      const response = await fetch('/api/billing/payments/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          companyId,
          subscriptionType: 'recurring',
          trialPeriodDays: 14
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Rediriger vers la session Stripe Checkout
        window.location.href = data.url;
      } else {
        console.error('Failed to create checkout session:', data.error);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  const handleOpenCustomerPortal = async (companyId: string) => {
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyId }),
      });

      const data = await response.json();

      if (data.success) {
        // Rediriger vers le portail client Stripe
        window.location.href = data.url;
      } else {
        console.error('Failed to create portal session:', data.error);
      }
    } catch (error) {
      console.error('Error creating portal session:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    if (growth < 0) return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-500';
    if (growth < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const getSubscriptionStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      trial: 'secondary',
      cancelled: 'destructive',
      expired: 'outline',
      past_due: 'destructive'
    } as const;
    
    const labels = {
      active: 'Actif',
      trial: 'Essai',
      cancelled: 'Annulé',
      expired: 'Expiré',
      past_due: 'En retard'
    };
    
    const icons = {
      active: <CheckCircle className="h-3 w-3 mr-1" />,
      trial: <Clock className="h-3 w-3 mr-1" />,
      cancelled: <X className="h-3 w-3 mr-1" />,
      expired: <AlertCircle className="h-3 w-3 mr-1" />,
      past_due: <AlertTriangle className="h-3 w-3 mr-1" />
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants]} className="flex items-center">
        {icons[status as keyof typeof icons]}
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des données de facturation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="w-8 h-8 text-green-500" />
            Facturation & Abonnements
          </h1>
          <p className="text-muted-foreground">
            Gérez vos abonnements, factures et revenus avec Stripe
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 jours</SelectItem>
              <SelectItem value="30d">30 jours</SelectItem>
              <SelectItem value="90d">90 jours</SelectItem>
              <SelectItem value="1y">1 an</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" onClick={loadBillingData}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenu total</p>
                <p className="text-2xl font-bold text-green-500">
                  {formatCurrency(metrics.totalRevenue)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {getGrowthIcon(metrics.growth)}
                  <span className={`text-sm ${getGrowthColor(metrics.growth)}`}>
                    {metrics.growth.toFixed(1)}%
                  </span>
                </div>
              </div>
              <DollarSign className="w-6 h-6 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">MRR</p>
                <p className="text-2xl font-bold text-blue-500">
                  {formatCurrency(metrics.monthlyRecurring)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">par mois</span>
                </div>
              </div>
              <TrendingUp className="w-6 h-6 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Abonnements actifs</p>
                <p className="text-2xl font-bold text-purple-500">
                  {metrics.activeSubscriptions}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Users className="w-3 h-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    +{metrics.trialSubscriptions} essais
                  </span>
                </div>
              </div>
              <Crown className="w-6 h-6 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taux de churn</p>
                <p className="text-2xl font-bold text-orange-500">
                  {metrics.churnRate.toFixed(1)}%
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">30 jours</span>
                </div>
              </div>
              <BarChart3 className="w-6 h-6 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="subscriptions">Abonnements</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Subscriptions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Abonnements récents
                </CardTitle>
                <CardDescription>
                  Les dernières activités d'abonnement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subscriptions.slice(0, 5).map((subscription) => (
                    <div key={subscription.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Crown className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{subscription.company.name}</p>
                          <p className="text-sm text-muted-foreground">{subscription.plan.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getSubscriptionStatusBadge(subscription.status)}
                        <p className="text-sm font-medium mt-1">{formatCurrency(subscription.amount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Actions rapides
                </CardTitle>
                <CardDescription>
                  Gérez rapidement votre facturation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start" variant="outline">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Créer un abonnement manuel
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Générer une facture
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurer Stripe
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Tableau de bord Stripe
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-6">
          {/* Subscriptions Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    Gestion des abonnements
                  </CardTitle>
                  <CardDescription>
                    Gérez tous les abonnements de vos clients
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="active">Actifs</SelectItem>
                      <SelectItem value="trial">Essai</SelectItem>
                      <SelectItem value="cancelled">Annulés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Prochaine facturation</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{subscription.company.name}</p>
                          <p className="text-sm text-muted-foreground">{subscription.company.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{subscription.plan.name}</p>
                          <p className="text-sm text-muted-foreground">{subscription.users}/{subscription.maxUsers} utilisateurs</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getSubscriptionStatusBadge(subscription.status)}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{formatCurrency(subscription.amount)}</p>
                        <p className="text-sm text-muted-foreground">/mois</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{formatDate(subscription.nextBillingDate)}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenCustomerPortal(subscription.company.id)}
                          >
                            <Settings className="w-4 h-4 mr-1" />
                            Gérer
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
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

        <TabsContent value="plans" className="space-y-6">
          {/* Plans Management */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className={plan.popular ? 'border-primary' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {plan.name === 'Starter' && <Rocket className="w-5 h-5" />}
                      {plan.name === 'Professional' && <Zap className="w-5 h-5" />}
                      {plan.name === 'Enterprise' && <Crown className="w-5 h-5" />}
                      {plan.name}
                    </CardTitle>
                    {plan.popular && (
                      <Badge variant="default">
                        <Star className="w-3 h-3 mr-1" />
                        Populaire
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-3xl font-bold">{formatCurrency(plan.price)}</p>
                      <p className="text-muted-foreground">par mois</p>
                    </div>
                    
                    <div className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                        <span>{plan.subscriptions} abonnements</span>
                        <span>{formatCurrency(plan.revenue)} de revenus</span>
                      </div>
                      <Button 
                        className="w-full"
                        onClick={() => {
                          // Simuler la sélection d'une entreprise pour la démo
                          const demoCompanyId = '1';
                          handleCreateCheckoutSession(plan.id, demoCompanyId);
                        }}
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        S'abonner
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* Stripe Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Paramètres Stripe
              </CardTitle>
              <CardDescription>
                Configurez votre intégration avec Stripe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Clés API</h3>
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor="publishableKey">Clé publiable</Label>
                      <Input
                        id="publishableKey"
                        type="password"
                        placeholder="pk_test_..."
                        defaultValue={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '••••••••••••••••' : ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="secretKey">Clé secrète</Label>
                      <Input
                        id="secretKey"
                        type="password"
                        placeholder="sk_test_..."
                        defaultValue={process.env.STRIPE_SECRET_KEY ? '••••••••••••••••' : ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="webhookSecret">Secret Webhook</Label>
                      <Input
                        id="webhookSecret"
                        type="password"
                        placeholder="whsec_..."
                        defaultValue={process.env.STRIPE_WEBHOOK_SECRET ? '••••••••••••••••' : ''}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Configuration</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Mode test</p>
                        <p className="text-sm text-muted-foreground">Utilisez les clés de test Stripe</p>
                      </div>
                      <Badge variant="secondary">Activé</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Webhooks</p>
                        <p className="text-sm text-muted-foreground">Écoute les événements Stripe</p>
                      </div>
                      <Badge variant="default">Configuré</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Portail client</p>
                        <p className="text-sm text-muted-foreground">Permet aux clients de gérer leurs abonnements</p>
                      </div>
                      <Badge variant="default">Activé</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Shield className="w-4 h-4 mr-2" />
                  Sauvegarder la configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}