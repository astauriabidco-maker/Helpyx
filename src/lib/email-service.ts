import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer;
  }>;
}

export class EmailService {
  private static transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || '"TechSupport SAV" <noreply@techsupport-sav.fr>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  static async sendInvoiceEmail(
    to: string,
    companyName: string,
    invoiceNumber: string,
    invoicePath: string,
    amount: number,
    dueDate: Date
  ): Promise<boolean> {
    const subject = `Facture ${invoiceNumber} - TechSupport SAV`;
    
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture ${invoiceNumber}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #2563eb, #1e40af);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .content {
            background: white;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-top: none;
        }
        .invoice-info {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .invoice-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        .detail-item {
            margin-bottom: 10px;
        }
        .detail-label {
            font-weight: 600;
            color: #6b7280;
            font-size: 14px;
        }
        .detail-value {
            font-size: 16px;
            color: #1f2937;
        }
        .amount {
            font-size: 24px;
            font-weight: bold;
            color: #059669;
        }
        .cta-button {
            display: inline-block;
            background: #2563eb;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
        }
        .cta-button:hover {
            background: #1d4ed8;
        }
        .footer {
            background: #f8fafc;
            padding: 20px;
            text-align: center;
            border-radius: 0 0 10px 10px;
            border: 1px solid #e5e7eb;
            border-top: none;
            color: #6b7280;
            font-size: 14px;
        }
        .payment-info {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
        .payment-info h4 {
            color: #92400e;
            margin: 0 0 10px 0;
        }
        .payment-info p {
            color: #78350f;
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">TechSupport SAV</div>
        <h1>Votre facture est prête</h1>
    </div>

    <div class="content">
        <p>Bonjour ${companyName},</p>
        
        <p>Votre facture <strong>${invoiceNumber}</strong> est maintenant disponible. 
        Vous trouverez ci-dessous le résumé de votre facture et le document en pièce jointe.</p>

        <div class="invoice-info">
            <h3>Résumé de la facture</h3>
            <div class="invoice-details">
                <div>
                    <div class="detail-item">
                        <div class="detail-label">Numéro de facture</div>
                        <div class="detail-value">${invoiceNumber}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Montant total</div>
                        <div class="detail-value amount">${new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        }).format(amount)}</div>
                    </div>
                </div>
                <div>
                    <div class="detail-item">
                        <div class="detail-label">Date d'émission</div>
                        <div class="detail-value">${new Date().toLocaleDateString('fr-FR')}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Date d'échéance</div>
                        <div class="detail-value">${dueDate.toLocaleDateString('fr-FR')}</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="payment-info">
            <h4>📋 Informations de paiement</h4>
            <p><strong>Méthodes de paiement acceptées:</strong> Carte bancaire, Virement bancaire</p>
            <p><strong>Délai de paiement:</strong> 30 jours à compter de la date d'émission</p>
            <p><strong>Référence client:</strong> ${companyName}</p>
        </div>

        <div style="text-align: center;">
            <a href="#" class="cta-button">Payer ma facture en ligne</a>
        </div>

        <p>La facture complète est jointe à cet email au format PDF. 
        Nous vous remercions de votre confiance et restons à votre disposition pour toute question.</p>

        <p>Cordialement,<br>
        L'équipe de TechSupport SAV</p>
    </div>

    <div class="footer">
        <p><strong>TechSupport SAV</strong><br>
        123 Avenue des Technologies, 75001 Paris<br>
        contact@techsupport-sav.fr | +33 1 23 45 67 89<br>
        SIRET: 123 456 789 00012</p>
        
        <p style="margin-top: 15px; font-size: 12px;">
        Cet email a été envoyé automatiquement. Merci de ne pas répondre à cet email.<br>
        Pour toute question, contactez notre service client.
        </p>
    </div>
</body>
</html>`;

    const text = `
Bonjour ${companyName},

Votre facture ${invoiceNumber} est maintenant disponible.

Numéro de facture: ${invoiceNumber}
Montant total: ${new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR'
}).format(amount)}
Date d'échéance: ${dueDate.toLocaleDateString('fr-FR')}

La facture complète est jointe à cet email au format PDF.

Nous vous remercions de votre confiance et restons à votre disposition pour toute question.

Cordialement,
L'équipe de TechSupport SAV
`;

    return this.sendEmail({
      to,
      subject,
      html,
      text,
      attachments: [
        {
          filename: `${invoiceNumber}.pdf`,
          path: invoicePath.startsWith('/') ? process.cwd() + '/public' + invoicePath : invoicePath
        }
      ]
    });
  }

  static async sendSubscriptionReminderEmail(
    to: string,
    companyName: string,
    planName: string,
    nextBillingDate: Date,
    amount: number
  ): Promise<boolean> {
    const subject = 'Rappel: Votre abonnement TechSupport SAV';
    
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rappel d'abonnement</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: white;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-top: none;
        }
        .reminder-box {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .reminder-box h3 {
            color: #92400e;
            margin: 0 0 15px 0;
        }
        .date-highlight {
            font-size: 24px;
            font-weight: bold;
            color: #d97706;
            margin: 10px 0;
        }
        .amount {
            font-size: 20px;
            font-weight: bold;
            color: #059669;
        }
        .cta-button {
            display: inline-block;
            background: #2563eb;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
        }
        .footer {
            background: #f8fafc;
            padding: 20px;
            text-align: center;
            border-radius: 0 0 10px 10px;
            border: 1px solid #e5e7eb;
            border-top: none;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>⏰ Rappel d'abonnement</h1>
    </div>

    <div class="content">
        <p>Bonjour ${companyName},</p>
        
        <p>Ceci est un rappel concernant votre abonnement <strong>${planName}</strong> avec TechSupport SAV.</p>

        <div class="reminder-box">
            <h3>📅 Prochaine échéance</h3>
            <div class="date-highlight">${nextBillingDate.toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}</div>
            <p>Montant à débiter: <span class="amount">${new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'EUR'
            }).format(amount)}</span></p>
        </div>

        <p>Le paiement sera automatiquement débité de votre méthode de paiement enregistrée. 
        Assurez-vous que vos informations de paiement sont à jour pour éviter toute interruption de service.</p>

        <div style="text-align: center;">
            <a href="#" class="cta-button">Gérer mon abonnement</a>
        </div>

        <p>Si vous avez des questions ou souhaitez modifier votre abonnement, 
        n'hésitez pas à contacter notre support client.</p>

        <p>Merci de votre confiance!</p>

        <p>Cordialement,<br>
        L'équipe de TechSupport SAV</p>
    </div>

    <div class="footer">
        <p><strong>TechSupport SAV</strong><br>
        contact@techsupport-sav.fr | +33 1 23 45 67 89</p>
    </div>
</body>
</html>`;

    return this.sendEmail({
      to,
      subject,
      html
    });
  }

  static async sendWelcomeEmail(
    to: string,
    companyName: string,
    planName: string,
    trialEndDate: Date
  ): Promise<boolean> {
    const subject = 'Bienvenue chez TechSupport SAV!';
    
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenue chez TechSupport SAV</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: white;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-top: none;
        }
        .welcome-box {
            background: #d1fae5;
            border: 1px solid #10b981;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .trial-info {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .trial-info h4 {
            color: #92400e;
            margin: 0 0 10px 0;
        }
        .date-highlight {
            font-size: 20px;
            font-weight: bold;
            color: #d97706;
        }
        .cta-button {
            display: inline-block;
            background: #2563eb;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
        }
        .features {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .features h4 {
            color: #1f2937;
            margin: 0 0 15px 0;
        }
        .feature-list {
            list-style: none;
            padding: 0;
        }
        .feature-list li {
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .feature-list li:last-child {
            border-bottom: none;
        }
        .feature-list li::before {
            content: "✓";
            color: #10b981;
            font-weight: bold;
            margin-right: 10px;
        }
        .footer {
            background: #f8fafc;
            padding: 20px;
            text-align: center;
            border-radius: 0 0 10px 10px;
            border: 1px solid #e5e7eb;
            border-top: none;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎉 Bienvenue chez TechSupport SAV!</h1>
    </div>

    <div class="content">
        <p>Bonjour ${companyName},</p>
        
        <p>Nous sommes ravis de vous accueillir parmi nos clients! 
        Votre abonnement <strong>${planName}</strong> est maintenant actif.</p>

        <div class="welcome-box">
            <h3>🚀 Vous êtes prêt à commencer!</h3>
            <p>Accédez dès maintenant à toutes les fonctionnalités de votre plan et profitez de notre support exceptionnel.</p>
        </div>

        <div class="trial-info">
            <h4>📅 Période d'essai gratuite</h4>
            <p>Profitez de <strong>14 jours d'essai gratuit</strong> pour découvrir toutes nos fonctionnalités!</p>
            <p>Votre essai se termine le: <span class="date-highlight">${trialEndDate.toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}</span></p>
            <p>Aucun paiement ne sera effectué avant la fin de votre période d'essai.</p>
        </div>

        <div class="features">
            <h4>🌟 Ce qui vous attend avec ${planName}:</h4>
            <ul class="feature-list">
                <li>Support client prioritaire 24/7</li>
                <li>Accès à notre base de connaissances avancée</li>
                <li>Outils de diagnostic IA intégrés</li>
                <li>Rapports et analytics détaillés</li>
                <li>API et intégrations personnalisées</li>
            </ul>
        </div>

        <div style="text-align: center;">
            <a href="#" class="cta-button">Commencer maintenant</a>
        </div>

        <p>Notre équipe est là pour vous aider à tirer le meilleur de votre abonnement. 
        N'hésitez pas à nous contacter pour toute question ou pour une démonstration personnalisée.</p>

        <p>Nous sommes impatients de vous accompagner dans votre croissance!</p>

        <p>Cordialement,<br>
        Toute l'équipe de TechSupport SAV</p>
    </div>

    <div class="footer">
        <p><strong>TechSupport SAV</strong><br>
        contact@techsupport-sav.fr | +33 1 23 45 67 89</p>
    </div>
</body>
</html>`;

    return this.sendEmail({
      to,
      subject,
      html
    });
  }
}