import { NextRequest, NextResponse } from 'next/server';
import { InvoiceGenerator } from '@/lib/invoice-generator';
import { EmailService } from '@/lib/email-service';
import { db } from '@/lib/db';

// POST - Generate and send invoice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscriptionId, sendEmail = true } = body;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    // Récupérer l'abonnement
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

    // Générer la facture PDF
    const invoicePath = await InvoiceGenerator.generateAndSaveInvoice(subscriptionId);

    // Envoyer l'email si demandé
    let emailSent = false;
    if (sendEmail) {
      const invoiceNumber = `INV-2024-${String(subscription.id).slice(-6).toUpperCase()}`;
      const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      emailSent = await EmailService.sendInvoiceEmail(
        subscription.company.emailContact,
        subscription.company.nom,
        invoiceNumber,
        invoicePath,
        subscription.prixMensuel,
        dueDate
      );
    }

    return NextResponse.json({
      success: true,
      invoicePath,
      emailSent,
      subscription: {
        id: subscription.id,
        company: subscription.company.nom,
        plan: subscription.plan.nom,
        amount: subscription.prixMensuel
      }
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    );
  }
}