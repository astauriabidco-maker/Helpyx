import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static transporter: nodemailer.Transporter;

  // Initialiser le transporteur email
  private static async getTransporter(): Promise<nodemailer.Transporter> {
    if (!this.transporter) {
      // Configuration pour le développement (utilise Ethereal)
      if (process.env.NODE_ENV === 'development') {
        // Créer un compte de test Ethereal
        const testAccount = await nodemailer.createTestAccount();

        this.transporter = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });

        console.log('📧 Email test account:', testAccount.user);
      } else {
        // Configuration pour la production (utilise SMTP ou SendGrid)
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
      }
    }

    return this.transporter;
  }

  // Envoyer un email
  static async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const transporter = await this.getTransporter();

      const mailOptions = {
        from: process.env.EMAIL_FROM || '"TechSupport" <noreply@techsupport.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const info = await transporter.sendMail(mailOptions);

      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email sent:', nodemailer.getTestMessageUrl(info));
      }

      console.log('✅ Email envoyé avec succès à:', options.to);
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
      throw new Error('Impossible d\'envoyer l\'email');
    }
  }

  // Email de vérification
  static async sendVerificationEmail(email: string, token: string, name?: string): Promise<void> {
    const verifyUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Vérification de votre email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 TechSupport</h1>
            <p>Vérification de votre adresse email</p>
          </div>
          <div class="content">
            <h2>Bonjour ${name || 'utilisateur'},</h2>
            <p>Merci de vous être inscrit sur TechSupport ! Pour finaliser votre inscription, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>
            <div style="text-align: center;">
              <a href="${verifyUrl}" class="button">Vérifier mon email</a>
            </div>
            <p>Ou copiez-collez ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px;">${verifyUrl}</p>
            <p><strong>Ce lien expirera dans 24 heures.</strong></p>
            <p>Si vous n'avez pas créé de compte sur TechSupport, vous pouvez ignorer cet email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 TechSupport. Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Vérification de votre email - TechSupport',
      html,
      text: `Bonjour ${name || 'utilisateur'}, merci de vous être inscrit sur TechSupport. Veuillez vérifier votre email en visitant: ${verifyUrl}`
    });
  }

  // Email de réinitialisation de mot de passe
  static async sendPasswordResetEmail(email: string, token: string, name?: string): Promise<void> {
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Réinitialisation de votre mot de passe</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .warning { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 TechSupport</h1>
            <p>Réinitialisation de votre mot de passe</p>
          </div>
          <div class="content">
            <h2>Bonjour ${name || 'utilisateur'},</h2>
            <p>Nous avons reçu une demande de réinitialisation de votre mot de passe pour votre compte TechSupport.</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
            </div>
            <p>Ou copiez-collez ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px;">${resetUrl}</p>
            
            <div class="warning">
              <p><strong>⚠️ Important :</strong></p>
              <ul>
                <li>Ce lien expirera dans 1 heure</li>
                <li>Si vous n'avez pas demandé de réinitialisation, ignorez cet email</li>
                <li>Ne partagez jamais ce lien avec personne</li>
              </ul>
            </div>
            
            <p>Si vous avez des questions, contactez notre support technique.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 TechSupport. Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Réinitialisation de votre mot de passe - TechSupport',
      html,
      text: `Bonjour ${name || 'utilisateur'}, une demande de réinitialisation de mot de passe a été reçue. Visitez: ${resetUrl} pour réinitialiser. Ce lien expirera dans 1 heure.`
    });
  }

  // Email de notification de ticket
  static async sendTicketNotification(email: string, ticketData: any, type: 'created' | 'updated' = 'created'): Promise<void> {
    const subject = type === 'created'
      ? `Nouveau ticket créé - ${ticketData.id}`
      : `Ticket mis à jour - ${ticketData.id}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .ticket-info { background: #e5e7eb; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎫 TechSupport</h1>
            <p>${type === 'created' ? 'Nouveau ticket créé' : 'Ticket mis à jour'}</p>
          </div>
          <div class="content">
            <h2>Bonjour,</h2>
            <p>${type === 'created'
        ? 'Un nouveau ticket a été créé sur notre plateforme.'
        : 'Un ticket existant a été mis à jour.'}</p>
            
            <div class="ticket-info">
              <h3>Informations du ticket</h3>
              <p><strong>ID:</strong> ${ticketData.id}</p>
              <p><strong>Description:</strong> ${ticketData.description}</p>
              <p><strong>Statut:</strong> <span class="status">${ticketData.status}</span></p>
              <p><strong>Date:</strong> ${new Date(ticketData.createdAt).toLocaleDateString('fr-FR')}</p>
              ${ticketData.user ? `<p><strong>Utilisateur:</strong> ${ticketData.user.name} (${ticketData.user.email})</p>` : ''}
            </div>
            
            <p>Vous pouvez consulter ce ticket dans votre tableau de bord.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 TechSupport. Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject,
      html,
      text: `${type === 'created' ? 'Nouveau ticket' : 'Ticket mis à jour'}: ${ticketData.id} - ${ticketData.description}`
    });
  }
}