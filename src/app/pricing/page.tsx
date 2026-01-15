'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Crown, 
  Zap, 
  Rocket, 
  CheckCircle, 
  Star, 
  CreditCard,
  Info,
  Shield,
  Headphones,
  Users,
  Ticket,
  Settings
} from 'lucide-react';
import { SubscriptionManager } from '@/components/billing/SubscriptionManager';

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
  supportLevel: 'basic' | 'priority' | 'dedicated';
  popular?: boolean;
  status: 'active' | 'inactive';
  trialDays?: number;
}

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await fetch('/api/billing/plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      } else {
        // Données de démonstration
        setPlans([
          {
            id: '1',
            name: 'Starter',
            slug: 'starter',
            description: 'Parfait pour les petites équipes',
            price: 49,
            yearlyPrice: 490,
            features: [
              '10 utilisateurs',
              'Support par email',
              '100 tickets par mois',
              'Base de connaissances',
              'Rapports de base',
              'API limitée'
            ],
            maxUsers: 10,
            maxTickets: 100,
            supportLevel: 'basic' as const,
            trialDays: 14,
            status: 'active' as const
          },
          {
            id: '2',
            name: 'Professional',
            slug: 'professional',
            description: 'Pour les entreprises en croissance',
            price: 299,
            yearlyPrice: 2990,
            features: [
              '50 utilisateurs',
              'Support prioritaire',
              'Tickets illimités',
              'Base de connaissances avancée',
              'Rapports détaillés',
              'API complète',
              'Intégrations avancées',
              'SLA 99.9%',
              'Sauvegarde automatique'
            ],
            maxUsers: 50,
            maxTickets: -1,
            supportLevel: 'priority' as const,
            popular: true,
            trialDays: 14,
            status: 'active' as const
          },
          {
            id: '3',
            name: 'Enterprise',
            slug: 'enterprise',
            description: 'Pour les grandes organisations',
            price: 1999,
            yearlyPrice: 19990,
            features: [
              'Utilisateurs illimités',
              'Support dédié 24/7',
              'Tickets illimités',
              'Base de connaissances personnalisée',
              'Rapports sur mesure',
              'API entreprise',
              'Intégrations personnalisées',
              'SLA 99.99%',
              'Sauvegarde multi-régions',
              'Audit et conformité',
              'Formation personnalisée',
              'Gestionnaire de compte dédié'
            ],
            maxUsers: -1,
            maxTickets: -1,
            supportLevel: 'dedicated' as const,
            trialDays: 21,
            status: 'active' as const
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string, companyId: string) => {
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

  const handleManageSubscription = async (companyId: string) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des plans tarifaires...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Plans Tarifaires
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Choisissez le plan parfait pour votre entreprise. 
          Tous les plans incluent un essai gratuit de 14 jours.
        </p>
      </div>

      {/* Subscription Manager */}
      <SubscriptionManager
        plans={plans}
        companyId="demo-company" // À remplacer par l'ID de l'entreprise connectée
        onSubscribe={handleSubscribe}
        onManageSubscription={handleManageSubscription}
      />

      {/* Features Comparison */}
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Comparez les fonctionnalités</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Trouvez le plan qui correspond le mieux à vos besoins
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-4 border bg-muted">Fonctionnalités</th>
                {plans.map((plan) => (
                  <th key={plan.id} className="text-center p-4 border bg-muted">
                    <div className="flex flex-col items-center gap-2">
                      <span className="font-semibold">{plan.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {plan.price === 0 ? 'Gratuit' : `${plan.price}€/mois`}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-muted/50">
                <td className="p-4 border font-medium">Utilisateurs</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="text-center p-4 border">
                    {plan.maxUsers === -1 ? 'Illimité' : plan.maxUsers}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-muted/50">
                <td className="p-4 border font-medium">Tickets par mois</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="text-center p-4 border">
                    {plan.maxTickets === -1 ? 'Illimité' : plan.maxTickets || '0'}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-muted/50">
                <td className="p-4 border font-medium">Support</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="text-center p-4 border">
                    <div className="flex flex-col items-center gap-1">
                      <Badge variant={
                        plan.supportLevel === 'dedicated' ? 'default' :
                        plan.supportLevel === 'priority' ? 'secondary' : 'outline'
                      }>
                        {plan.supportLevel === 'basic' && (
                          <>
                            <Headphones className="w-3 h-3 mr-1" />
                            Basique
                          </>
                        )}
                        {plan.supportLevel === 'priority' && (
                          <>
                            <Star className="w-3 h-3 mr-1" />
                            Prioritaire
                          </>
                        )}
                        {plan.supportLevel === 'dedicated' && (
                          <>
                            <Crown className="w-3 h-3 mr-1" />
                            Dédié
                          </>
                        )}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {plan.supportLevel === 'basic' && 'Email (48h)'}
                        {plan.supportLevel === 'priority' && 'Email & Téléphone (24h)'}
                        {plan.supportLevel === 'dedicated' && '24/7 dédié'}
                      </span>
                    </div>
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-muted/50">
                <td className="p-4 border font-medium">API</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="text-center p-4 border">
                    <div className="flex flex-col items-center gap-1">
                      <Badge variant={plan.name === 'Enterprise' ? 'default' : plan.name === 'Professional' ? 'secondary' : 'outline'}>
                        {plan.name === 'Starter' && 'Limitée'}
                        {plan.name === 'Professional' && 'Complète'}
                        {plan.name === 'Enterprise' && 'Entreprise'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {plan.name === 'Starter' && '1000 req/mois'}
                        {plan.name === 'Professional' && '10 000 req/mois'}
                        {plan.name === 'Enterprise' && 'Illimité'}
                      </span>
                    </div>
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-muted/50">
                <td className="p-4 border font-medium">SLA</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="text-center p-4 border">
                    {plan.name === 'Starter' && (
                      <Badge variant="outline">99.5%</Badge>
                    )}
                    {plan.name === 'Professional' && (
                      <Badge variant="secondary">99.9%</Badge>
                    )}
                    {plan.name === 'Enterprise' && (
                      <Badge variant="default">99.99%</Badge>
                    )}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-muted/50">
                <td className="p-4 border font-medium">Essai gratuit</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="text-center p-4 border">
                    <div className="flex items-center justify-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{plan.trialDays || 14} jours</span>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Questions fréquentes</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tout ce que vous devez savoir sur nos plans tarifaires
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Puis-je changer de plan ?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Oui, vous pouvez mettre à niveau ou rétrograder votre plan à tout moment. 
                Les changements prendront effet au début de la prochaine période de facturation.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comment fonctionne l'essai gratuit ?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Tous les plans incluent un essai gratuit de 14 jours. 
                Aucune carte de crédit n'est requise pour commencer l'essai.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quelles méthodes de paiement acceptez-vous ?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Nous acceptons toutes les cartes de crédit majeures (Visa, MasterCard, American Express), 
                ainsi que les virements bancaires pour les entreprises.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Puis-je annuler mon abonnement ?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Oui, vous pouvez annuler votre abonnement à tout moment. 
                Vous continuerez à avoir accès aux fonctionnalités jusqu'à la fin de la période facturée.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-6 bg-muted rounded-lg p-8">
        <h2 className="text-3xl font-bold">Prêt à commencer ?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Rejoignez des centaines d'entreprises qui utilisent notre plateforme 
          pour gérer leur support technique efficacement.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button size="lg" onClick={() => window.location.href = '/billing'}>
            <CreditCard className="w-4 h-4 mr-2" />
            Commencer l'essai gratuit
          </Button>
          <Button size="lg" variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Contacter les ventes
          </Button>
        </div>
      </div>
    </div>
  );
}