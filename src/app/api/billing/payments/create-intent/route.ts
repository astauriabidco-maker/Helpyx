import { NextRequest, NextResponse } from 'next/server';
import { StripeService } from '@/lib/stripe-service';
import { db } from '@/lib/db';

// POST - Create payment intent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      amount, 
      subscriptionId, 
      customerId, 
      description,
      metadata 
    } = body;

    if (!amount) {
      return NextResponse.json(
        { error: 'Amount is required' },
        { status: 400 }
      );
    }

    // Si un subscriptionId est fourni, récupérer les détails
    let finalMetadata = metadata || {};
    let finalDescription = description;
    let finalCustomerId = customerId;

    if (subscriptionId) {
      const subscription = await db.subscription.findUnique({
        where: { id: subscriptionId },
        include: {
          company: true,
          plan: true
        }
      });

      if (!subscription) {
        return NextResponse.json(
          { error: 'Subscription not found' },
          { status: 404 }
        );
      }

      finalMetadata = {
        ...finalMetadata,
        subscriptionId: subscription.id,
        companyId: subscription.company.id,
        planId: subscription.plan.id,
        planName: subscription.plan.nom,
        companyName: subscription.company.nom
      };

      finalDescription = finalDescription || 
        `Paiement abonnement ${subscription.plan.nom} - ${subscription.company.nom}`;

      // Créer ou récupérer le client Stripe
      if (!finalCustomerId) {
        const stripeCustomer = await StripeService.createCustomer({
          email: subscription.company.emailContact,
          name: subscription.company.nom,
          phone: subscription.company.telephone || undefined,
          metadata: {
            companyId: subscription.company.id,
            companyName: subscription.company.nom
          }
        });

        if (stripeCustomer.success) {
          finalCustomerId = stripeCustomer.customerId;
        }
      }
    }

    // Créer l'intention de paiement
    const result = await StripeService.createPaymentIntent({
      amount,
      customerId: finalCustomerId,
      metadata: finalMetadata,
      description: finalDescription
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        clientSecret: result.clientSecret,
        paymentIntentId: result.paymentIntentId,
        customerId: finalCustomerId
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}