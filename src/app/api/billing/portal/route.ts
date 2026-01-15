import { NextRequest, NextResponse } from 'next/server';
import { StripeService } from '@/lib/stripe-service';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { companyId } = await request.json();

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Récupérer l'entreprise
    const company = await db.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Vérifier que l'entreprise a un client Stripe
    if (!company.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No Stripe customer found for this company' },
        { status: 400 }
      );
    }

    // Créer la session du portail client
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const portalResult = await StripeService.createCustomerPortalSession({
      customerId: company.stripeCustomerId,
      returnUrl: `${baseUrl}/billing`
    });

    if (!portalResult.success) {
      return NextResponse.json(
        { error: 'Failed to create portal session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: portalResult.url
    });

  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}