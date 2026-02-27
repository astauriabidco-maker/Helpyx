import puppeteer from 'puppeteer';
import { db } from '@/lib/db';
import fs from 'fs';
import path from 'path';

interface InvoiceData {
    id: string;
    number: string;
    company: {
        name: string;
        email: string;
        address?: string;
        phone?: string;
    };
    items: {
        description: string;
        quantity: number;
        unitPrice: number;
        total: number;
    }[];
    amount: number;
    tax?: number;
    totalWithTax?: number;
    dueDate: Date;
    createdAt: Date;
    status: string;
    notes?: string;
}

export class InvoiceGenerator {
    private static getInvoiceHTML(invoice: InvoiceData): string {
        const subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
        const tax = invoice.tax || (subtotal * 0.2); // TVA 20%
        const total = invoice.totalWithTax || (subtotal + tax);

        return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture ${invoice.number}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            color: #333;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 20px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
        }
        .invoice-info {
            text-align: right;
        }
        .invoice-number {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 5px;
        }
        .invoice-status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            ${invoice.status === 'paid' ? 'background-color: #10b981; color: white;' :
                invoice.status === 'overdue' ? 'background-color: #ef4444; color: white;' :
                    invoice.status === 'sent' ? 'background-color: #3b82f6; color: white;' :
                        'background-color: #6b7280; color: white;'}
        }
        .company-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
        }
        .from, .to {
            flex: 1;
        }
        .from {
            margin-right: 40px;
        }
        .section-title {
            font-size: 14px;
            font-weight: 600;
            color: #6b7280;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .company-name {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 4px;
        }
        .company-details {
            color: #6b7280;
            line-height: 1.6;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .items-table th {
            background-color: #f9fafb;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
        }
        .items-table td {
            padding: 16px 12px;
            border-bottom: 1px solid #e5e7eb;
        }
        .items-table .description {
            font-weight: 500;
        }
        .items-table .quantity {
            text-align: center;
            color: #6b7280;
        }
        .items-table .unit-price {
            text-align: right;
            color: #6b7280;
        }
        .items-table .total {
            text-align: right;
            font-weight: 600;
        }
        .totals {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 30px;
        }
        .totals-table {
            width: 300px;
        }
        .totals-table td {
            padding: 8px 0;
        }
        .totals-table .label {
            text-align: left;
            color: #6b7280;
        }
        .totals-table .value {
            text-align: right;
            font-weight: 500;
        }
        .totals-table .total-row {
            border-top: 2px solid #e5e7eb;
            font-weight: 700;
            font-size: 18px;
            color: #1f2937;
            padding-top: 12px;
        }
        .dates {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            padding: 20px;
            background-color: #f9fafb;
            border-radius: 6px;
        }
        .date-item {
            text-align: center;
        }
        .date-label {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 4px;
            text-transform: uppercase;
        }
        .date-value {
            font-weight: 600;
            color: #1f2937;
        }
        .notes {
            margin-top: 40px;
            padding: 20px;
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            border-radius: 4px;
        }
        .notes-title {
            font-weight: 600;
            margin-bottom: 8px;
            color: #92400e;
        }
        .notes-content {
            color: #78350f;
            line-height: 1.6;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        .amount {
            font-family: 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                TechSupport SAV
            </div>
            <div class="invoice-info">
                <div class="invoice-number">${invoice.number}</div>
                <div class="invoice-status">${invoice.status}</div>
            </div>
        </div>

        <div class="company-info">
            <div class="from">
                <div class="section-title">De</div>
                <div class="company-name">TechSupport SAV</div>
                <div class="company-details">
                    123 Avenue des Technologies<br>
                    75001 Paris, France<br>
                    contact@techsupport-sav.fr<br>
                    +33 1 23 45 67 89<br>
                    SIRET: 123 456 789 00012
                </div>
            </div>
            <div class="to">
                <div class="section-title">Facturé à</div>
                <div class="company-name">${invoice.company.name}</div>
                <div class="company-details">
                    ${invoice.company.email}<br>
                    ${invoice.company.phone || ''}<br>
                    ${invoice.company.address || ''}
                </div>
            </div>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th class="quantity">Quantité</th>
                    <th class="unit-price">Prix unitaire</th>
                    <th class="total">Total</th>
                </tr>
            </thead>
            <tbody>
                ${invoice.items.map(item => `
                    <tr>
                        <td class="description">${item.description}</td>
                        <td class="quantity">${item.quantity}</td>
                        <td class="unit-price amount">${this.formatCurrency(item.unitPrice)}</td>
                        <td class="total amount">${this.formatCurrency(item.total)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="totals">
            <table class="totals-table">
                <tr>
                    <td class="label">Sous-total:</td>
                    <td class="value amount">${this.formatCurrency(subtotal)}</td>
                </tr>
                <tr>
                    <td class="label">TVA (20%):</td>
                    <td class="value amount">${this.formatCurrency(tax)}</td>
                </tr>
                <tr class="total-row">
                    <td>Total:</td>
                    <td class="value amount">${this.formatCurrency(total)}</td>
                </tr>
            </table>
        </div>

        <div class="dates">
            <div class="date-item">
                <div class="date-label">Date d'émission</div>
                <div class="date-value">${this.formatDate(invoice.createdAt)}</div>
            </div>
            <div class="date-item">
                <div class="date-label">Date d'échéance</div>
                <div class="date-value">${this.formatDate(invoice.dueDate)}</div>
            </div>
            <div class="date-item">
                <div class="date-label">Statut</div>
                <div class="date-value">${this.getStatusLabel(invoice.status)}</div>
            </div>
        </div>

        ${invoice.notes ? `
            <div class="notes">
                <div class="notes-title">Notes</div>
                <div class="notes-content">${invoice.notes}</div>
            </div>
        ` : ''}

        <div class="footer">
            <p>Merci de votre confiance! Pour toute question concernant cette facture, veuillez nous contacter.</p>
            <p>TechSupport SAV - Service de facturation</p>
        </div>
    </div>
</body>
</html>`;
    }

    private static formatCurrency(amount: number): string {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    }

    private static formatDate(date: Date): string {
        return new Date(date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    private static getStatusLabel(status: string): string {
        const labels = {
            draft: 'Brouillon',
            sent: 'Envoyée',
            paid: 'Payée',
            overdue: 'En retard',
            cancelled: 'Annulée'
        };
        return labels[status as keyof typeof labels] || status;
    }

    static async generatePDF(invoice: InvoiceData): Promise<Buffer> {
        try {
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            const page = await browser.newPage();
            const html = this.getInvoiceHTML(invoice);

            await page.setContent(html, { waitUntil: 'networkidle0' });

            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '20px',
                    right: '20px',
                    bottom: '20px',
                    left: '20px'
                }
            });

            await browser.close();

            return Buffer.from(pdfBuffer);
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw new Error('Failed to generate PDF');
        }
    }

    static async generateAndSaveInvoice(subscriptionId: string): Promise<string> {
        try {
            // Récupérer les données de l'abonnement
            const subscription = await db.subscription.findUnique({
                where: { id: subscriptionId },
                include: {
                    company: true,
                    plan: true
                }
            });

            if (!subscription) {
                throw new Error('Subscription not found');
            }

            // Générer le numéro de facture
            const invoiceCount = await db.subscription.count();
            const invoiceNumber = `INV-2024-${String(invoiceCount + 1).padStart(3, '0')}`;

            // Préparer les données de la facture
            const invoiceData: InvoiceData = {
                id: `invoice_${subscription.id}_${Date.now()}`,
                number: invoiceNumber,
                company: {
                    name: subscription.company.nom,
                    email: subscription.company.emailContact,
                    address: `${subscription.company.ville || ''}, ${subscription.company.pays || ''}`,
                    phone: subscription.company.telephone || undefined
                },
                items: [
                    {
                        description: `${subscription.plan.nom} - Abonnement mensuel`,
                        quantity: 1,
                        unitPrice: subscription.prixMensuel,
                        total: subscription.prixMensuel
                    }
                ],
                amount: subscription.prixMensuel,
                tax: subscription.prixMensuel * 0.2, // TVA 20%
                totalWithTax: subscription.prixMensuel * 1.2,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                createdAt: new Date(),
                status: subscription.statut.toLowerCase(),
                notes: 'Paiement dû dans les 30 jours. Merci de régler cette facture avant la date d\'échéance.'
            };

            // Générer le PDF
            const pdfBuffer = await this.generatePDF(invoiceData);

            // Sauvegarder le PDF (dans un système réel, on utiliserait S3 ou un autre stockage)
            const uploadsDir = path.join(process.cwd(), 'public', 'invoices');

            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }

            const filename = `${invoiceNumber}.pdf`;
            const filepath = path.join(uploadsDir, filename);

            fs.writeFileSync(filepath, pdfBuffer);

            return `/invoices/${filename}`;
        } catch (error) {
            console.error('Error generating invoice:', error);
            throw error;
        }
    }
}