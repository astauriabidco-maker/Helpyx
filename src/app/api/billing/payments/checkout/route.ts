import { NextRequest, NextResponse } from 'next/server';
import { StripeService } from '@/lib/stripe-service';
import { db } from '@/lib/db';

// POST - Create checkout session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      planId,
      companyId,
      subscriptionType = 'recurring', // 'recurring' or 'onetime'
      trialPeriodDays,
      successUrl,
      cancelUrl
    } = body;

    if (!planId || !companyId) {
      return NextResponse.json(
        { error: 'Plan ID and Company ID are required' },
        { status: 400 }
      );
    }

    // Récupérer les détails du plan et de l'entreprise
    const [plan, company] = await Promise.all([
      db.plan.findUnique({ where: { id: planId } }),
      db.company.findUnique({ where: { id: companyId } })
    ]);

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Créer ou récupérer le client Stripe
    let stripeCustomerId = company.stripeCustomerId;

    if (!stripeCustomerId) {
      const stripeCustomer = await StripeService.createCustomer({
        email: company.emailContact,
        name: company.nom,
        phone: company.telephone || undefined,
        metadata: {
          companyId: company.id,
          companyName: company.nom
        }
      });

      if (!stripeCustomer.success) {
        return NextResponse.json(
          { error: 'Failed to create Stripe customer' },
          { status: 500 }
        );
      }

      stripeCustomerId = stripeCustomer.customerId;

      // Mettre à jour l'entreprise avec l'ID client Stripe
      await db.company.update({
        where: { id: companyId },
        data: { stripeCustomerId }
      });
    }

    // Créer ou récupérer le produit et prix Stripe
    let stripePriceId = plan.stripePriceId;

    if (!stripePriceId) {
      // Créer le produit Stripe
      const productResult = await StripeService.createProduct({
        name: plan.nom,
        description: plan.description,
        metadata: {
          planId: plan.id,
          planName: plan.nom
        }
      });

      if (!productResult.success) {
        return NextResponse.json(
          { error: 'Failed to create Stripe product' },
          { status: 500 }
        );
      }

      // Créer le prix Stripe
      const priceResult = await StripeService.createPrice({
        amount: plan.prixMensuel,
        currency: 'eur',
        interval: 'month',
        productId: productResult.productId,
        metadata: {
          planId: plan.id,
          planName: plan.nom
        }
      });

      if (!priceResult.success) {
        return NextResponse.json(
          { error: 'Failed to create Stripe price' },
          { status: 500 }
        );
      }

      stripePriceId = priceResult.priceId;

      // Mettre à jour le plan avec l'ID prix Stripe
      await db.plan.update({
        where: { id: planId },
        data: { stripePriceId }
      });
    }

    // URLs par défaut
    const defaultSuccessUrl = `${process.env.NEXTAUTH_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`;
    const defaultCancelUrl = `${process.env.NEXTAUTH_URL}/billing/cancel`;

    const finalSuccessUrl = successUrl || defaultSuccessUrl;
    const finalCancelUrl = cancelUrl || defaultCancelUrl;

    let result;

    if (subscriptionType === 'recurring') {
      // Créer une session d'abonnement
      result = await StripeService.createCheckoutSession({
        customerId: stripeCustomerId,
        priceId: stripePriceId,
        successUrl: finalSuccessUrl,
        cancelUrl: finalCancelUrl,
        trialPeriodDays,
        metadata: {
          planId: plan.id,
          companyId: company.id,
          planName: plan.nom,
          companyName: company.nom
        }
      });
    } else {
      // Créer une session de paiement unique
      result = await StripeService.createOneTimeCheckoutSession({
        customerId: stripeCustomerId,
        priceId: stripePriceId,
        successUrl: finalSuccessUrl,
        cancelUrl: finalCancelUrl,
        metadata: {
          planId: plan.id,
          companyId: company.id,
          planName: plan.nom,
          companyName: company.nom
        }
      });
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        sessionId: result.sessionId,
        url: result.url
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}