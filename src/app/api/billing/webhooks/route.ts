import { NextRequest, NextResponse } from 'next/server';
import { StripeService } from '@/lib/stripe-service';
import { db } from '@/lib/db';

// Webhook endpoint for Stripe events
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Construire l'événement Stripe
    const event = await StripeService.constructWebhookEvent(
      body,
      signature,
      webhookSecret
    );

    // Traiter les différents types d'événements
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as any);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as any);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as any);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as any);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as any);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as any);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  try {
    const { planId, companyId } = session.metadata;

    if (!planId || !companyId) {
      console.error('Missing metadata in checkout session');
      return;
    }

    // Créer ou mettre à jour l'abonnement
    const subscription = await db.subscription.findFirst({
      where: {
        companyId,
        planId
      }
    });

    if (subscription) {
      // Mettre à jour l'abonnement existant
      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          statut: 'ACTIVE',
          stripeSubscriptionId: session.subscription,
          updatedAt: new Date()
        }
      });
    } else {
      // Créer un nouvel abonnement
      const plan = await db.plan.findUnique({
        where: { id: planId }
      });

      if (plan) {
        await db.subscription.create({
          data: {
            companyId,
            planId,
            statut: 'ACTIVE',
            dateDebut: new Date(),
            dateFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
            prixMensuel: plan.prixMensuel,
            limiteUtilisateurs: plan.limiteUtilisateurs,
            autoRenew: true,
            stripeSubscriptionId: session.subscription
          }
        });
      }
    }

    console.log(`Checkout session completed for company ${companyId}, plan ${planId}`);
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  try {
    const subscriptionId = invoice.subscription;
    
    if (subscriptionId) {
      // Mettre à jour l'abonnement comme actif
      await db.subscription.updateMany({
        where: {
          stripeSubscriptionId: subscriptionId
        },
        data: {
          statut: 'ACTIVE',
          updatedAt: new Date()
        }
      });

      console.log(`Invoice payment succeeded for subscription ${subscriptionId}`);
    }
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
  }
}

async function handleInvoicePaymentFailed(invoice: any) {
  try {
    const subscriptionId = invoice.subscription;
    
    if (subscriptionId) {
      // Marquer l'abonnement comme en retard
      await db.subscription.updateMany({
        where: {
          stripeSubscriptionId: subscriptionId
        },
        data: {
          statut: 'PAST_DUE',
          updatedAt: new Date()
        }
      });

      console.log(`Invoice payment failed for subscription ${subscriptionId}`);
    }
  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
  }
}

async function handleSubscriptionCreated(subscription: any) {
  try {
    const customerId = subscription.customer;
    
    // Trouver l'entreprise par le client Stripe
    const company = await db.company.findFirst({
      where: {
        stripeCustomerId: customerId
      }
    });

    if (company) {
      // Mettre à jour l'abonnement
      await db.subscription.updateMany({
        where: {
          companyId: company.id,
          stripeSubscriptionId: subscription.id
        },
        data: {
          statut: 'ACTIVE',
          dateDebut: new Date(subscription.current_period_start * 1000),
          dateFin: new Date(subscription.current_period_end * 1000),
          updatedAt: new Date()
        }
      });

      console.log(`Subscription created for company ${company.id}`);
    }
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  try {
    const customerId = subscription.customer;
    
    // Trouver l'entreprise par le client Stripe
    const company = await db.company.findFirst({
      where: {
        stripeCustomerId: customerId
      }
    });

    if (company) {
      // Mettre à jour le statut de l'abonnement
      let status = 'ACTIVE';
      if (subscription.cancel_at_period_end) {
        status = 'CANCELLED';
      } else if (subscription.status === 'past_due') {
        status = 'PAST_DUE';
      } else if (subscription.status === 'canceled') {
        status = 'CANCELLED';
      }

      await db.subscription.updateMany({
        where: {
          companyId: company.id,
          stripeSubscriptionId: subscription.id
        },
        data: {
          statut: status,
          dateDebut: new Date(subscription.current_period_start * 1000),
          dateFin: new Date(subscription.current_period_end * 1000),
          autoRenew: !subscription.cancel_at_period_end,
          updatedAt: new Date()
        }
      });

      console.log(`Subscription updated for company ${company.id}, status: ${status}`);
    }
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  try {
    const customerId = subscription.customer;
    
    // Trouver l'entreprise par le client Stripe
    const company = await db.company.findFirst({
      where: {
        stripeCustomerId: customerId
      }
    });

    if (company) {
      // Marquer l'abonnement comme annulé
      await db.subscription.updateMany({
        where: {
          companyId: company.id,
          stripeSubscriptionId: subscription.id
        },
        data: {
          statut: 'CANCELLED',
          autoRenew: false,
          updatedAt: new Date()
        }
      });

      console.log(`Subscription deleted for company ${company.id}`);
    }
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}