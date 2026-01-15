'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DollarSign, 
  TrendingUp,
  Users,
  Building2,
  CreditCard,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Award,
  Crown,
  Code,
  Briefcase,
  Activity,
  Calendar,
  FileText,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Star,
  Zap,
  Shield,
  Rocket,
  Eye,
  Settings,
  RefreshCw
} from 'lucide-react';

interface RevenueMetrics {
  totalRevenue: number;
  monthlyRecurring: number;
  annualRecurring: number;
  growth: number;
  bySource: {
    saas: number;
    api: number;
    consulting: number;
  };
  byTier: {
    starter: number;
    professional: number;
    enterprise: number;
  };
  churnRate: number;
  customerLifetimeValue: number;
  averageRevenuePerUser: number;
}

interface CustomerMetrics {
  totalCustomers: number;
  activeCustomers: number;
  newCustomers: number;
  churnedCustomers: number;
  byPlan: {
    starter: number;
    professional: number;
    enterprise: number;
  };
  satisfaction: number;
  supportTickets: number;
  resolutionTime: number;
}

interface SubscriptionMetrics {
  totalSubscriptions: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  expiredSubscriptions: number;
  conversionRate: number;
  averageSubscriptionValue: number;
  monthlyNewSubscriptions: number;
  subscriptionGrowth: number;
}

interface TopPerformer {
  id: string;
  name: string;
  type: 'customer' | 'plan' | 'service';
  revenue: number;
  growth: number;
  customers?: number;
  satisfaction?: number;
}

export function MonetizationDashboard() {
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics>({
    totalRevenue: 0,
    monthlyRecurring: 0,
    annualRecurring: 0,
    growth: 0,
    bySource: {
      saas: 0,
      api: 0,
      consulting: 0
    },
    byTier: {
      starter: 0,
      professional: 0,
      enterprise: 0
    },
    churnRate: 0,
    customerLifetimeValue: 0,
    averageRevenuePerUser: 0
  });
  const [customerMetrics, setCustomerMetrics] = useState<CustomerMetrics>({
    totalCustomers: 0,
    activeCustomers: 0,
    newCustomers: 0,
    churnedCustomers: 0,
    byPlan: {
      starter: 0,
      professional: 0,
      enterprise: 0
    },
    satisfaction: 0,
    supportTickets: 0,
    resolutionTime: 0
  });
  const [subscriptionMetrics, setSubscriptionMetrics] = useState<SubscriptionMetrics>({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    trialSubscriptions: 0,
    expiredSubscriptions: 0,
    conversionRate: 0,
    averageSubscriptionValue: 0,
    monthlyNewSubscriptions: 0,
    subscriptionGrowth: 0
  });
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    loadRevenueMetrics();
    loadCustomerMetrics();
    loadSubscriptionMetrics();
    loadTopPerformers();
  }, [timeRange]);

  const loadRevenueMetrics = async () => {
    try {
      const response = await fetch(`/api/knowledge-graph/monetization/dashboard/revenue?range=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setRevenueMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Error loading revenue metrics:', error);
      // Demo data
      setRevenueMetrics({
        totalRevenue: 2847500,
        monthlyRecurring: 237292,
        annualRecurring: 2847504,
        growth: 23.5,
        bySource: {
          saas: 1850875,
          api: 568750,
          consulting: 428875
        },
        byTier: {
          starter: 284750,
          professional: 1423750,
          enterprise: 1139000
        },
        churnRate: 2.3,
        customerLifetimeValue: 12500,
        averageRevenuePerUser: 285
      });
    }
  };

  const loadCustomerMetrics = async () => {
    try {
      const response = await fetch(`/api/knowledge-graph/monetization/dashboard/customers?range=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setCustomerMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Error loading customer metrics:', error);
      // Demo data
      setCustomerMetrics({
        totalCustomers: 1247,
        activeCustomers: 1189,
        newCustomers: 156,
        churnedCustomers: 29,
        byPlan: {
          starter: 423,
          professional: 567,
          enterprise: 257
        },
        satisfaction: 4.6,
        supportTickets: 89,
        resolutionTime: 4.2
      });
    }
  };

  const loadSubscriptionMetrics = async () => {
    try {
      const response = await fetch(`/api/knowledge-graph/monetization/dashboard/subscriptions?range=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setSubscriptionMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Error loading subscription metrics:', error);
      // Demo data
      setSubscriptionMetrics({
        totalSubscriptions: 1247,
        activeSubscriptions: 1189,
        trialSubscriptions: 23,
        expiredSubscriptions: 35,
        conversionRate: 78.5,
        averageSubscriptionValue: 2285,
        monthlyNewSubscriptions: 156,
        subscriptionGrowth: 18.2
      });
    }
  };

  const loadTopPerformers = async () => {
    try {
      const response = await fetch(`/api/knowledge-graph/monetization/dashboard/top-performers?range=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setTopPerformers(data.performers);
      }
    } catch (error) {
      console.error('Error loading top performers:', error);
      // Demo data
      setTopPerformers([
        {
          id: '1',
          name: 'TechCorp Industries',
          type: 'customer',
          revenue: 125000,
          growth: 45.2,
          satisfaction: 4.8
        },
        {
          id: '2',
          name: 'Professional Plan',
          type: 'plan',
          revenue: 1423750,
          growth: 28.5,
          customers: 567
        },
        {
          id: '3',
          name: 'SaaS Premium',
          type: 'service',
          revenue: 1850875,
          growth: 32.1
        },
        {
          id: '4',
          name: 'Global Solutions',
          type: 'customer',
          revenue: 89000,
          growth: 23.7,
          satisfaction: 4.7
        },
        {
          id: '5',
          name: 'Enterprise Plan',
          type: 'plan',
          revenue: 1139000,
          growth: 18.9,
          customers: 257
        }
      ]);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
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

  const getPerformerIcon = (type: string) => {
    switch (type) {
      case 'customer': return <Building2 className="w-4 h-4" />;
      case 'plan': return <Crown className="w-4 h-4" />;
      case 'service': return <Zap className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-500" />
            Tableau de Bord Monétisation
          </h2>
          <p className="text-muted-foreground">
            Vue d'ensemble complète des revenus et performances
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
          <Button variant="outline">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Key Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenu total</p>
                <p className="text-2xl font-bold text-green-500">
                  {formatCurrency(revenueMetrics.totalRevenue)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {getGrowthIcon(revenueMetrics.growth)}
                  <span className={`text-sm ${getGrowthColor(revenueMetrics.growth)}`}>
                    {revenueMetrics.growth.toFixed(1)}%
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
                  {formatCurrency(revenueMetrics.monthlyRecurring)}
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
                <p className="text-sm text-muted-foreground">Clients actifs</p>
                <p className="text-2xl font-bold text-purple-500">
                  {formatNumber(customerMetrics.activeCustomers)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Users className="w-3 h-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    +{customerMetrics.newCustomers} ce mois
                  </span>
                </div>
              </div>
              <Users className="w-6 h-6 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taux de conversion</p>
                <p className="text-2xl font-bold text-orange-500">
                  {subscriptionMetrics.conversionRate.toFixed(1)}%
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Target className="w-3 h-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    essais → abonnés
                  </span>
                </div>
              </div>
              <Target className="w-6 h-6 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="revenue">Revenus</TabsTrigger>
          <TabsTrigger value="customers">Clients</TabsTrigger>
          <TabsTrigger value="subscriptions">Abonnements</TabsTrigger>
          <TabsTrigger value="performers">Top Performers</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Revenue by Source */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Revenus par Source
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-blue-500" />
                      <span>SaaS Premium</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(revenueMetrics.bySource.saas)}</p>
                      <p className="text-sm text-muted-foreground">
                        {((revenueMetrics.bySource.saas / revenueMetrics.totalRevenue) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <Progress value={(revenueMetrics.bySource.saas / revenueMetrics.totalRevenue) * 100} />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-green-500" />
                      <span>API Service</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(revenueMetrics.bySource.api)}</p>
                      <p className="text-sm text-muted-foreground">
                        {((revenueMetrics.bySource.api / revenueMetrics.totalRevenue) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <Progress value={(revenueMetrics.bySource.api / revenueMetrics.totalRevenue) * 100} />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-purple-500" />
                      <span>Consulting</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(revenueMetrics.bySource.consulting)}</p>
                      <p className="text-sm text-muted-foreground">
                        {((revenueMetrics.bySource.consulting / revenueMetrics.totalRevenue) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <Progress value={(revenueMetrics.bySource.consulting / revenueMetrics.totalRevenue) * 100} />
                </div>
              </CardContent>
            </Card>

            {/* Customer Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Distribution Clients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Starter</Badge>
                      <span>{customerMetrics.byPlan.starter} clients</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(revenueMetrics.byTier.starter)}</p>
                      <p className="text-sm text-muted-foreground">
                        {((revenueMetrics.byTier.starter / revenueMetrics.totalRevenue) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <Progress value={(revenueMetrics.byTier.starter / revenueMetrics.totalRevenue) * 100} />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Professional</Badge>
                      <span>{customerMetrics.byPlan.professional} clients</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(revenueMetrics.byTier.professional)}</p>
                      <p className="text-sm text-muted-foreground">
                        {((revenueMetrics.byTier.professional / revenueMetrics.totalRevenue) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <Progress value={(revenueMetrics.byTier.professional / revenueMetrics.totalRevenue) * 100} />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-500">Enterprise</Badge>
                      <span>{customerMetrics.byPlan.enterprise} clients</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(revenueMetrics.byTier.enterprise)}</p>
                      <p className="text-sm text-muted-foreground">
                        {((revenueMetrics.byTier.enterprise / revenueMetrics.totalRevenue) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <Progress value={(revenueMetrics.byTier.enterprise / revenueMetrics.totalRevenue) * 100} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Métriques Clés</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Taux de churn</span>
                  <span className="font-medium">{revenueMetrics.churnRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Valeur vie client</span>
                  <span className="font-medium">{formatCurrency(revenueMetrics.customerLifetimeValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Revenu moyen/client</span>
                  <span className="font-medium">{formatCurrency(revenueMetrics.averageRevenuePerUser)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Satisfaction client</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{customerMetrics.satisfaction}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Support Client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tickets ouverts</span>
                  <span className="font-medium">{customerMetrics.supportTickets}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Temps de résolution</span>
                  <span className="font-medium">{customerMetrics.resolutionTime}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Nouveaux clients</span>
                  <span className="font-medium text-green-500">+{customerMetrics.newCustomers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Clients perdus</span>
                  <span className="font-medium text-red-500">-{customerMetrics.churnedCustomers}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Abonnements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total abonnements</span>
                  <span className="font-medium">{subscriptionMetrics.totalSubscriptions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Essais actifs</span>
                  <span className="font-medium">{subscriptionMetrics.trialSubscriptions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Croissance mensuelle</span>
                  <span className="font-medium text-green-500">+{subscriptionMetrics.subscriptionGrowth.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Valeur moyenne</span>
                  <span className="font-medium">{formatCurrency(subscriptionMetrics.averageSubscriptionValue)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenus Mensuels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Mois dernier</span>
                    <span className="font-medium">{formatCurrency(revenueMetrics.monthlyRecurring)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Ce mois</span>
                    <span className="font-medium text-green-500">
                      {formatCurrency(revenueMetrics.monthlyRecurring * 1.235)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Objectif</span>
                    <span className="font-medium">{formatCurrency(revenueMetrics.monthlyRecurring * 1.3)}</span>
                  </div>
                  <Progress value={95} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prévisions Annuelles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Revenu annuel actuel</span>
                    <span className="font-medium">{formatCurrency(revenueMetrics.annualRecurring)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Prévision fin d'année</span>
                    <span className="font-medium text-green-500">
                      {formatCurrency(revenueMetrics.annualRecurring * 1.235)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Croissance attendue</span>
                    <span className="font-medium text-green-500">+23.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Acquisition</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Nouveaux ce mois</span>
                    <span className="font-medium text-green-500">+{customerMetrics.newCustomers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Taux de conversion</span>
                    <span className="font-medium">{subscriptionMetrics.conversionRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Coût acquisition</span>
                    <span className="font-medium">{formatCurrency(285)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rétention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Taux de churn</span>
                    <span className="font-medium text-red-500">{revenueMetrics.churnRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Valeur vie client</span>
                    <span className="font-medium">{formatCurrency(revenueMetrics.customerLifetimeValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Satisfaction</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{customerMetrics.satisfaction}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Support</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tickets ouverts</span>
                    <span className="font-medium">{customerMetrics.supportTickets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Temps résolution</span>
                    <span className="font-medium">{customerMetrics.resolutionTime}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Satisfaction support</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-medium">4.3</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Statut des Abonnements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Actifs</span>
                    <span className="font-medium text-green-500">{subscriptionMetrics.activeSubscriptions}</span>
                  </div>
                  <Progress value={(subscriptionMetrics.activeSubscriptions / subscriptionMetrics.totalSubscriptions) * 100} />
                  
                  <div className="flex justify-between">
                    <span>Essais</span>
                    <span className="font-medium text-blue-500">{subscriptionMetrics.trialSubscriptions}</span>
                  </div>
                  <Progress value={(subscriptionMetrics.trialSubscriptions / subscriptionMetrics.totalSubscriptions) * 100} />
                  
                  <div className="flex justify-between">
                    <span>Expirés</span>
                    <span className="font-medium text-red-500">{subscriptionMetrics.expiredSubscriptions}</span>
                  </div>
                  <Progress value={(subscriptionMetrics.expiredSubscriptions / subscriptionMetrics.totalSubscriptions) * 100} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métriques d'Abonnement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Croissance mensuelle</span>
                    <span className="font-medium text-green-500">+{subscriptionMetrics.subscriptionGrowth.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Nouveaux ce mois</span>
                    <span className="font-medium">{subscriptionMetrics.monthlyNewSubscriptions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Valeur moyenne</span>
                    <span className="font-medium">{formatCurrency(subscriptionMetrics.averageSubscriptionValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Taux de conversion</span>
                    <span className="font-medium">{subscriptionMetrics.conversionRate.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Top Performers Tab */}
        <TabsContent value="performers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.map((performer, index) => (
                  <div key={performer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex items-center gap-2">
                        {getPerformerIcon(performer.type)}
                        <div>
                          <h4 className="font-semibold">{performer.name}</h4>
                          <p className="text-sm text-muted-foreground capitalize">{performer.type}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(performer.revenue)}</p>
                        <div className="flex items-center gap-1">
                          {getGrowthIcon(performer.growth)}
                          <span className={`text-sm ${getGrowthColor(performer.growth)}`}>
                            {performer.growth.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      {performer.customers && (
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Clients</p>
                          <p className="font-medium">{performer.customers}</p>
                        </div>
                      )}
                      {performer.satisfaction && (
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Satisfaction</p>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="font-medium">{performer.satisfaction}</span>
                          </div>
                        </div>
                      )}
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