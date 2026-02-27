import Stripe from 'stripe';

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    _stripe = new Stripe(key, {
      apiVersion: '2024-06-20',
    });
  }
  return _stripe;
}

interface CreatePaymentIntentParams {
  amount: number;
  currency?: string;
  customerId?: string;
  metadata?: Record<string, string>;
  description?: string;
}

interface CreateSubscriptionParams {
  customerId: string;
  priceId: string;
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
}

interface CreateCustomerParams {
  email: string;
  name?: string;
  phone?: string;
  address?: {
    line1: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
  };
  metadata?: Record<string, string>;
}

export class StripeService {
  /**
   * Créer une intention de paiement pour un paiement unique
   */
  static async createPaymentIntent({
    amount,
    currency = 'eur',
    customerId,
    metadata,
    description
  }: CreatePaymentIntentParams) {
    try {
      const paymentIntent = await getStripe().paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe utilise les centimes
        currency,
        customer: customerId,
        metadata,
        description,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Créer un client Stripe
   */
  static async createCustomer({
    email,
    name,
    phone,
    address,
    metadata
  }: CreateCustomerParams) {
    try {
      const customer = await getStripe().customers.create({
        email,
        name,
        phone,
        address,
        metadata,
      });

      return {
        success: true,
        customerId: customer.id,
        customer,
      };
    } catch (error) {
      console.error('Error creating customer:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Créer un prix pour un abonnement
   */
  static async createPrice({
    amount,
    currency = 'eur',
    interval = 'month',
    productId,
    metadata,
  }: {
    amount: number;
    currency?: string;
    interval?: 'day' | 'week' | 'month' | 'year';
    productId: string;
    metadata?: Record<string, string>;
  }) {
    try {
      const price = await getStripe().prices.create({
        unit_amount: Math.round(amount * 100),
        currency,
        recurring: { interval },
        product: productId,
        metadata,
      });

      return {
        success: true,
        priceId: price.id,
        price,
      };
    } catch (error) {
      console.error('Error creating price:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Créer un produit pour les abonnements
   */
  static async createProduct({
    name,
    description,
    metadata,
  }: {
    name: string;
    description?: string;
    metadata?: Record<string, string>;
  }) {
    try {
      const product = await getStripe().products.create({
        name,
        description,
        type: 'service',
        metadata,
      });

      return {
        success: true,
        productId: product.id,
        product,
      };
    } catch (error) {
      console.error('Error creating product:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Créer une session de checkout pour un abonnement
   */
  static async createCheckoutSession({
    customerId,
    priceId,
    successUrl,
    cancelUrl,
    trialPeriodDays,
    metadata,
  }: {
    customerId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    trialPeriodDays?: number;
    metadata?: Record<string, string>;
  }) {
    try {
      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        customer: customerId,
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata,
      };

      if (trialPeriodDays) {
        sessionParams.subscription_data = {
          trial_period_days: trialPeriodDays,
        };
      }

      const session = await getStripe().checkout.sessions.create(sessionParams);

      return {
        success: true,
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Créer une session de checkout pour un paiement unique
   */
  static async createOneTimeCheckoutSession({
    customerId,
    priceId,
    successUrl,
    cancelUrl,
    metadata,
  }: {
    customerId?: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }) {
    try {
      const session = await getStripe().checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata,
      });

      return {
        success: true,
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Récupérer les informations d'un client
   */
  static async getCustomer(customerId: string) {
    try {
      const customer = await getStripe().customers.retrieve(customerId);
      return {
        success: true,
        customer,
      };
    } catch (error) {
      console.error('Error retrieving customer:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Récupérer les abonnements d'un client
   */
  static async getCustomerSubscriptions(customerId: string) {
    try {
      const subscriptions = await getStripe().subscriptions.list({
        customer: customerId,
        status: 'all',
        limit: 100,
      });

      return {
        success: true,
        subscriptions: subscriptions.data,
      };
    } catch (error) {
      console.error('Error retrieving subscriptions:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Annuler un abonnement
   */
  static async cancelSubscription(subscriptionId: string, immediate = false) {
    try {
      const subscription = await getStripe().subscriptions.update(subscriptionId, {
        cancel_at_period_end: !immediate,
        ...(immediate && { cancellation_details: { comment: 'Cancelled by user' } }),
      });

      return {
        success: true,
        subscription,
      };
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Mettre à jour un abonnement
   */
  static async updateSubscription(
    subscriptionId: string,
    priceId: string,
    prorationBehavior: 'create_prorations' | 'none' = 'create_prorations'
  ) {
    try {
      const subscription = await getStripe().subscriptions.retrieve(subscriptionId);

      const updatedSubscription = await getStripe().subscriptions.update(subscriptionId, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: priceId,
          },
        ],
        proration_behavior,
      });

      return {
        success: true,
        subscription: updatedSubscription,
      };
    } catch (error) {
      console.error('Error updating subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Créer un portail client pour la gestion des abonnements
   */
  static async createCustomerPortalSession({
    customerId,
    returnUrl,
  }: {
    customerId: string;
    returnUrl: string;
  }) {
    try {
      const session = await getStripe().billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return {
        success: true,
        url: session.url,
      };
    } catch (error) {
      console.error('Error creating portal session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Traiter un webhook Stripe
   */
  static async constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
    secret: string
  ): Promise<Stripe.Event> {
    return getStripe().webhooks.constructEvent(payload, signature, secret);
  }

  /**
   * Récupérer une intention de paiement
   */
  static async getPaymentIntent(paymentIntentId: string) {
    try {
      const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);
      return {
        success: true,
        paymentIntent,
      };
    } catch (error) {
      console.error('Error retrieving payment intent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Confirmer une intention de paiement
   */
  static async confirmPaymentIntent(paymentIntentId: string) {
    try {
      const paymentIntent = await getStripe().paymentIntents.confirm(paymentIntentId);
      return {
        success: true,
        paymentIntent,
      };
    } catch (error) {
      console.error('Error confirming payment intent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}