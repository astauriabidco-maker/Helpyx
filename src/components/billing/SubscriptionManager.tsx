'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Crown, 
  Zap, 
  Rocket, 
  CheckCircle, 
  Star, 
  CreditCard, 
  ExternalLink,
  AlertTriangle,
  Info
} from 'lucide-react';

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

interface SubscriptionManagerProps {
  plans: Plan[];
  currentPlanId?: string;
  companyId: string;
  onSubscribe: (planId: string, companyId: string) => void;
  onManageSubscription: (companyId: string) => void;
  isLoading?: boolean;
}

export function SubscriptionManager({
  plans,
  currentPlanId,
  companyId,
  onSubscribe,
  onManageSubscription,
  isLoading = false
}: SubscriptionManagerProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'starter':
        return <Rocket className="w-6 h-6" />;
      case 'professional':
        return <Zap className="w-6 h-6" />;
      case 'enterprise':
        return <Crown className="w-6 h-6" />;
      default:
        return <Star className="w-6 h-6" />;
    }
  };

  const getPlanPrice = (plan: Plan) => {
    return billingCycle === 'yearly' && plan.yearlyPrice 
      ? plan.yearlyPrice 
      : plan.price;
  };

  const getPlanBadge = (plan: Plan) => {
    if (plan.id === currentPlanId) {
      return (
        <Badge variant="default" className="w-full justify-center">
          <CheckCircle className="w-3 h-3 mr-1" />
          Plan actuel
        </Badge>
      );
    }
    
    if (plan.popular) {
      return (
        <Badge variant="secondary" className="w-full justify-center">
          <Star className="w-3 h-3 mr-1" />
          Le plus populaire
        </Badge>
      );
    }

    return null;
  };

  const handleSubscribe = (plan: Plan) => {
    if (plan.id === currentPlanId) {
      onManageSubscription(companyId);
    } else {
      onSubscribe(plan.id, companyId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center">
        <div className="flex items-center bg-muted rounded-lg p-1">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setBillingCycle('monthly')}
          >
            Facturation mensuelle
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'yearly'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setBillingCycle('yearly')}
          >
            Facturation annuelle
            <Badge variant="secondary" className="ml-2">
              -20%
            </Badge>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${
              plan.popular ? 'border-primary shadow-lg scale-105' : ''
            } ${
              plan.id === currentPlanId ? 'bg-primary/5' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge variant="default" className="px-3 py-1">
                  <Star className="w-3 h-3 mr-1" />
                  Recommandé
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  plan.popular ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  {getPlanIcon(plan.name)}
                </div>
              </div>
              
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription className="text-sm">
                {plan.description}
              </CardDescription>
              
              <div className="mt-4">
                <div className="flex items-baseline justify-center">
                  <span className="text-3xl font-bold">
                    {formatCurrency(getPlanPrice(plan))}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    /{billingCycle === 'yearly' ? 'an' : 'mois'}
                  </span>
                </div>
                
                {billingCycle === 'yearly' && plan.yearlyPrice && (
                  <p className="text-sm text-green-600 mt-1">
                    Économisez {formatCurrency(plan.price * 12 - plan.yearlyPrice)} par an
                  </p>
                )}
              </div>

              {getPlanBadge(plan)}
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Features */}
              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Trial Info */}
              {plan.trialDays && plan.id !== currentPlanId && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    {plan.trialDays} jours d'essai gratuits
                  </AlertDescription>
                </Alert>
              )}

              {/* CTA Button */}
              <Button 
                className="w-full"
                variant={plan.id === currentPlanId ? "outline" : "default"}
                onClick={() => handleSubscribe(plan)}
                disabled={isLoading}
              >
                {isLoading ? (
                  'Chargement...'
                ) : plan.id === currentPlanId ? (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Gérer l'abonnement
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    S'abonner
                  </>
                )}
              </Button>

              {/* Current Plan Info */}
              {plan.id === currentPlanId && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Vous utilisez actuellement ce plan
                  </p>
                  <Button 
                    variant="link" 
                    size="sm"
                    onClick={() => onManageSubscription(companyId)}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Gérer dans le portail client
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Tous les plans incluent un essai gratuit de 14 jours. Vous pouvez annuler ou modifier votre abonnement à tout moment depuis votre portail client.
        </AlertDescription>
      </Alert>

      {/* Plan Comparison Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            Comparer tous les plans
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comparaison des plans</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-2 border">Fonctionnalités</th>
                    {plans.map((plan) => (
                      <th key={plan.id} className="text-center p-2 border">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border font-medium">Prix mensuel</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="text-center p-2 border">
                        {formatCurrency(plan.price)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 border font-medium">Utilisateurs max</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="text-center p-2 border">
                        {plan.maxUsers === -1 ? 'Illimité' : plan.maxUsers}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 border font-medium">Tickets/mois</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="text-center p-2 border">
                        {plan.maxTickets === -1 ? 'Illimité' : plan.maxTickets || '0'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 border font-medium">Support</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="text-center p-2 border">
                        <Badge variant={
                          plan.supportLevel === 'dedicated' ? 'default' :
                          plan.supportLevel === 'priority' ? 'secondary' : 'outline'
                        }>
                          {plan.supportLevel === 'basic' && 'Basique'}
                          {plan.supportLevel === 'priority' && 'Prioritaire'}
                          {plan.supportLevel === 'dedicated' && 'Dédié'}
                        </Badge>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}