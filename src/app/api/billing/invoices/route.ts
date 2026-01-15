import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const clientId = searchParams.get('clientId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (clientId) where.clientId = clientId;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const [invoices, total] = await Promise.all([
      db.invoice.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          items: true,
          payments: {
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.invoice.count({ where })
    ]);

    // Calculer les totaux pour chaque facture
    const invoicesWithTotals = invoices.map(invoice => {
      const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const taxAmount = subtotal * (invoice.taxRate / 100);
      const totalAmount = subtotal + taxAmount;
      const paidAmount = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
      const remainingAmount = totalAmount - paidAmount;

      return {
        ...invoice,
        subtotal,
        taxAmount,
        totalAmount,
        paidAmount,
        remainingAmount,
        isFullyPaid: remainingAmount <= 0,
        overdueDays: invoice.dueDate ? 
          Math.max(0, Math.floor((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))) : 
          0
      };
    });

    return NextResponse.json({
      success: true,
      data: invoicesWithTotals,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des factures:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des factures' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clientId,
      invoiceNumber,
      issueDate,
      dueDate,
      items,
      taxRate = 20,
      notes,
      paymentTerms = '30'
    } = body;

    // Validation des données requises
    if (!clientId || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Client et articles sont requis' },
        { status: 400 }
      );
    }

    // Vérifier que le client existe
    const client = await db.user.findUnique({
      where: { id: clientId }
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client non trouvé' },
        { status: 404 }
      );
    }

    // Générer un numéro de facture si non fourni
    const finalInvoiceNumber = invoiceNumber || await generateInvoiceNumber();

    // Calculer les totaux
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    // Créer la facture
    const invoice = await db.invoice.create({
      data: {
        invoiceNumber: finalInvoiceNumber,
        clientId,
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 jours par défaut
        subtotal,
        taxRate,
        taxAmount,
        totalAmount,
        paidAmount: 0,
        status: 'draft',
        notes: notes || '',
        paymentTerms,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true
          }
        }
      }
    });

    // Créer les articles de la facture
    await db.invoiceItem.createMany({
      data: items.map((item: any) => ({
        invoiceId: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
        type: item.type || 'service'
      }))
    });

    // Récupérer la facture complète avec les articles
    const completeInvoice = await db.invoice.findUnique({
      where: { id: invoice.id },
      include: {
        client: true,
        items: true,
        payments: true
      }
    });

    return NextResponse.json({
      success: true,
      data: completeInvoice,
      message: 'Facture créée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la création de la facture:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de la facture' },
      { status: 500 }
    );
  }
}

async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}`;
  
  // Récupérer la dernière facture de l'année
  const lastInvoice = await db.invoice.findFirst({
    where: {
      invoiceNumber: {
        startsWith: prefix
      }
    },
    orderBy: {
      invoiceNumber: 'desc'
    }
  });

  let sequence = 1;
  if (lastInvoice) {
    const lastSequence = parseInt(lastInvoice.invoiceNumber.split('-')[2] || '0');
    sequence = lastSequence + 1;
  }

  return `${prefix}-${sequence.toString().padStart(4, '0')}`;
}