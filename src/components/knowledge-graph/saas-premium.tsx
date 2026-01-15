'use client';

import { formatDate } from '@/lib/date-utils';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, 
  Crown,
  Star,
  Zap,
  Shield,
  Users,
  Database,
  Brain,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Award,
  Rocket,
  Settings,
  Download,
  Upload,
  Eye,
  Lock,
  Unlock,
  CreditCard,
  FileText,
  Calendar,
  Activity,
  AlertTriangle,
  Info,
  Check,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Cpu
} from 'lucide-react';

interface SaaSTier {
  id: string;
  name: string;
  price: number;
  period: 'month' | 'year';
  features: string[];
  limits: {
    users: number;
    storage: string;
    apiCalls: number;
    processingPower: string;
  };
  popular?: boolean;
  enterprise?: boolean;
}

interface UsageMetrics {
  users: number;
  storage: number;
  apiCalls: number;
  processingPower: number;
  period: string;
  lastUpdate: Date;
}

interface BillingInfo {
  plan: string;
  status: 'active' | 'trial' | 'expired' | 'cancelled';
  nextBilling: Date;
  amount: number;
  currency: string;
  paymentMethod: string;
  invoices: Array<{
    id: string;
    date: Date;
    amount: number;
    status: 'paid' | 'pending' | 'overdue';
    downloadUrl: string;
  }>;
}

interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  category: 'ai' | 'analytics' | 'security' | 'integration' | 'support';
  status: 'active' | 'beta' | 'coming-soon';
  usage: number;
  limit: number;
  icon: React.ReactNode;
}

export function SaaSPremium() {
  const [selectedTier, setSelectedTier] = useState<string>('professional');
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month');
  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics>({
    users: 12,
    storage: 67,
    apiCalls: 84500,
    processingPower: 78,
    period: 'Novembre 2024',
    lastUpdate: new Date()
  });
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    plan: 'Professional',
    status: 'active',
    nextBilling: new Date('2024-12-15'),
    amount: 299,
    currency: 'EUR',
    paymentMethod: '**** **** **** 4242',
    invoices: [
      {
        id: 'INV-2024-11',
        date: new Date('2024-11-15'),
        amount: 299,
        status: 'paid',
        downloadUrl: '/invoices/INV-2024-11.pdf'
      },
      {
        id: 'INV-2024-10',
        date: new Date('2024-10-15'),
        amount: 299,
        status: 'paid',
        downloadUrl: '/invoices/INV-2024-10.pdf'
      }
    ]
  });
  const [premiumFeatures, setPremiumFeatures] = useState<PremiumFeature[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadPremiumFeatures();
    loadUsageMetrics();
  }, []);

  const loadPremiumFeatures = async () => {
    try {
      const response = await fetch('/api/knowledge-graph/monetization/saas/features');
      if (response.ok) {
        const data = await response.json();
        setPremiumFeatures(data.features);
      }
    } catch (error) {
      console.error('Error loading premium features:', error);
      // Demo features
      setPremiumFeatures([
        {
          id: 'gpt4-analysis',
          name: 'Analyse GPT-4 Avancée',
          description: 'Analyse linguistique avec GPT-4 Turbo pour insights profonds',
          category: 'ai',
          status: 'active',
          usage: 84500,
          limit: 100000,
          icon: <Brain className="w-4 h-4" />
        },
        {
          id: 'realtime-processing',
          name: 'Traitement Temps Réel',
          description: 'Analyse continue des données avec mise à jour instantanée',
          category: 'analytics',
          status: 'active',
          usage: 67,
          limit: 100,
          icon: <Activity className="w-4 h-4" />
        },
        {
          id: 'ar-vr-visualization',
          name: 'Visualisation AR/VR',
          description: 'Exploration immersive du graphe en réalité augmentée',
          category: 'integration',
          status: 'beta',
          usage: 12,
          limit: 50,
          icon: <Eye className="w-4 h-4" />
        },
        {
          id: 'advanced-security',
          name: 'Sécurité Avancée',
          description: 'Chiffrement de bout en bout et audit de sécurité',
          category: 'security',
          status: 'active',
          usage: 100,
          limit: 100,
          icon: <Shield className="w-4 h-4" />
        },
        {
          id: 'priority-support',
          name: 'Support Prioritaire',
          description: 'Support 24/7 avec réponse garantie en 1h',
          category: 'support',
          status: 'active',
          usage: 8,
          limit: 20,
          icon: <Users className="w-4 h-4" />
        }
      ]);
    }
  };

  const loadUsageMetrics = async () => {
    try {
      const response = await fetch('/api/knowledge-graph/monetization/saas/usage');
      if (response.ok) {
        const data = await response.json();
        setUsageMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Error loading usage metrics:', error);
    }
  };

  const saasTiers: SaaSTier[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: 49,
      period: billingPeriod,
      features: [
        'Jusqu\'à 5 utilisateurs',
        '1000 appels API/mois',
        '10GB stockage',
        'Support email',
        'Analytics basic',
        'NLP standard'
      ],
      limits: {
        users: 5,
        storage: '10GB',
        apiCalls: 1000,
        processingPower: 'Basic'
      }
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 299,
      period: billingPeriod,
      popular: true,
      features: [
        'Jusqu\'à 50 utilisateurs',
        '100 000 appels API/mois',
        '500GB stockage',
        'Support prioritaire',
        'Analytics avancé',
        'NLP avec GPT-4',
        'Real-time processing',
        'AR/VR basic',
        'Intégrations avancées'
      ],
      limits: {
        users: 50,
        storage: '500GB',
        apiCalls: 100000,
        processingPower: 'Professional'
      }
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 999,
      period: billingPeriod,
      enterprise: true,
      features: [
        'Utilisateurs illimités',
        'Appels API illimités',
        'Stockage illimité',
        'Support 24/7 dédié',
        'Analytics enterprise',
        'GPT-4 Turbo illimité',
        'Real-time avancé',
        'AR/VR complet',
        'Intégrations sur mesure',
        'SLA garanti',
        'Audit de sécurité',
        'Formation équipe',
        'Consulting inclus'
      ],
      limits: {
        users: -1,
        storage: 'Illimité',
        apiCalls: -1,
        processingPower: 'Enterprise'
      }
    }
  ];

  const handleUpgrade = async (tierId: string) => {
    try {
      const response = await fetch('/api/knowledge-graph/monetization/saas/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tierId,
          billingPeriod
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Upgrade successful:', data);
        // Mettre à jour les infos de facturation
        setBillingInfo(prev => ({
          ...prev,
          plan: saasTiers.find(t => t.id === tierId)?.name || prev.plan,
          amount: saasTiers.find(t => t.id === tierId)?.price || prev.amount
        }));
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'trial': return 'text-blue-500';
      case 'expired': return 'text-red-500';
      case 'cancelled': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'trial': return <Clock className="w-4 h-4" />;
      case 'expired': return <XCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getFeatureCategoryColor = (category: string) => {
    switch (category) {
      case 'ai': return 'bg-purple-500';
      case 'analytics': return 'bg-blue-500';
      case 'security': return 'bg-green-500';
      case 'integration': return 'bg-orange-500';
      case 'support': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-500';
      case 'pending': return 'text-yellow-500';
      case 'overdue': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            SaaS Premium
          </h2>
          <p className="text-muted-foreground">
            Solutions avancées pour grandes entreprises
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            {billingInfo.plan}
          </Badge>
          <Badge variant={billingInfo.status === 'active' ? "default" : "secondary"} className="flex items-center gap-1">
            {getStatusIcon(billingInfo.status)}
            {billingInfo.status}
          </Badge>
        </div>
      </div>

      {/* Current Plan Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Plan Actuel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Forfait</p>
              <p className="text-lg font-semibold">{billingInfo.plan}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Montant</p>
              <p className="text-lg font-semibold">{billingInfo.amount} {billingInfo.currency}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Prochaine facturation</p>
              <p className="text-lg font-semibold">{formatDate(billingInfo.nextBilling)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Moyen de paiement</p>
              <p className="text-lg font-semibold">{billingInfo.paymentMethod}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="plans">Forfaits</TabsTrigger>
          <TabsTrigger value="usage">Utilisation</TabsTrigger>
          <TabsTrigger value="features">Fonctionnalités</TabsTrigger>
          <TabsTrigger value="billing">Facturation</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Utilisateurs actifs</p>
                    <p className="text-2xl font-bold text-blue-500">{usageMetrics.users}</p>
                  </div>
                  <Users className="w-6 h-6 text-blue-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Stockage utilisé</p>
                    <p className="text-2xl font-bold text-green-500">{usageMetrics.storage}%</p>
                  </div>
                  <Database className="w-6 h-6 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Appels API</p>
                    <p className="text-2xl font-bold text-purple-500">
                      {usageMetrics.apiCalls.toLocaleString()}
                    </p>
                  </div>
                  <Zap className="w-6 h-6 text-purple-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Puissance de calcul</p>
                    <p className="text-2xl font-bold text-orange-500">{usageMetrics.processingPower}%</p>
                  </div>
                  <Cpu className="w-6 h-6 text-orange-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Premium Features Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Fonctionnalités Premium Actives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {premiumFeatures.slice(0, 6).map((feature) => (
                  <div key={feature.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className={`p-2 rounded ${getFeatureCategoryColor(feature.category)} bg-opacity-10`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{feature.name}</p>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                    <Badge variant={feature.status === 'active' ? 'default' : 'secondary'}>
                      {feature.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Choisissez votre forfait</h3>
              <p className="text-muted-foreground">Débloquez tout le potentiel du Knowledge Graph Intelligence</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${billingPeriod === 'month' ? 'font-medium' : 'text-muted-foreground'}`}>
                Mensuel
              </span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === 'month' ? 'year' : 'month')}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    billingPeriod === 'year' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${billingPeriod === 'year' ? 'font-medium' : 'text-muted-foreground'}`}>
                Annuel <Badge variant="outline" className="ml-1">-20%</Badge>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {saasTiers.map((tier) => (
              <Card key={tier.id} className={`relative ${tier.popular ? 'border-blue-500 shadow-lg' : ''}`}>
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500">Plus Populaire</Badge>
                  </div>
                )}
                {tier.enterprise && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-500">Enterprise</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">
                      {billingPeriod === 'year' ? Math.round(tier.price * 0.8) : tier.price}€
                    </span>
                    <span className="text-muted-foreground">/{billingPeriod === 'year' ? 'an' : 'mois'}</span>
                  </div>
                  {billingPeriod === 'year' && (
                    <p className="text-sm text-green-500">Économisez {Math.round(tier.price * 0.2 * 12)}€/an</p>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full" 
                    variant={tier.popular ? 'default' : 'outline'}
                    onClick={() => handleUpgrade(tier.id)}
                    disabled={tier.id === selectedTier}
                  >
                    {tier.id === selectedTier ? 'Plan Actuel' : `Passer à ${tier.name}`}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Utilisation du {usageMetrics.period}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Utilisateurs</span>
                      <span>{usageMetrics.users} / 50</span>
                    </div>
                    <Progress value={(usageMetrics.users / 50) * 100} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Stockage</span>
                      <span>{usageMetrics.storage}% utilisé</span>
                    </div>
                    <Progress value={usageMetrics.storage} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Appels API</span>
                      <span>{usageMetrics.apiCalls.toLocaleString()} / 100 000</span>
                    </div>
                    <Progress value={(usageMetrics.apiCalls / 100000) * 100} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Puissance de calcul</span>
                      <span>{usageMetrics.processingPower}%</span>
                    </div>
                    <Progress value={usageMetrics.processingPower} />
                  </div>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Votre utilisation actuelle est bien dans les limites de votre plan Professional. 
                  Pensez à passer au plan Enterprise si vous avez besoin de plus de ressources.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                Fonctionnalités Premium
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {premiumFeatures.map((feature) => (
                  <div key={feature.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${getFeatureCategoryColor(feature.category)} bg-opacity-10`}>
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold">{feature.name}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {feature.usage.toLocaleString()} / {feature.limit.toLocaleString()}
                        </p>
                        <Progress value={(feature.usage / feature.limit) * 100} className="w-20 h-2 mt-1" />
                      </div>
                      <Badge variant={feature.status === 'active' ? 'default' : 'secondary'}>
                        {feature.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Facturation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4">Moyen de paiement</h4>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Carte de crédit</p>
                        <p className="text-sm text-muted-foreground">{billingInfo.paymentMethod}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Modifier
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-4">Prochaine facturation</h4>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{billingInfo.amount} {billingInfo.currency}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(billingInfo.nextBilling)}</p>
                      </div>
                      <Badge variant="outline">
                        <Calendar className="w-3 h-3 mr-1" />
                        {billingInfo.period}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Historique des factures</h4>
                <div className="space-y-3">
                  {billingInfo.invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-4 h-4" />
                        <div>
                          <p className="font-medium">{invoice.id}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(invoice.date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{invoice.amount} €</span>
                        <Badge className={getInvoiceStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}