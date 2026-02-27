import { db } from '@/lib/db';
import { getServer } from '@/lib/socket';
import { sendNotificationToUser } from '@/lib/socket';

interface SMSConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

interface SMSMessage {
  to: string;
  body: string;
  ticketId?: string;
  userId?: string;
  type?: 'ticket_assigned' | 'ticket_updated' | 'ticket_closed' | 'urgent';
}

class SMSService {
  private config: SMSConfig | null = null;
  private isEnabled = false;

  constructor() {
    this.initializeConfig();
  }

  private initializeConfig() {
    this.config = {
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
      fromNumber: process.env.TWILIO_FROM_NUMBER || '',
    };

    this.isEnabled = !!(
      this.config.accountSid &&
      this.config.authToken &&
      this.config.fromNumber
    );

    if (this.isEnabled) {
      console.log('SMS Service: Configuration Twilio chargée');
    } else {
      console.log('SMS Service: Configuration Twilio manquante - Service désactivé');
    }
  }

  async sendSMS(message: SMSMessage): Promise<{ success: boolean; error?: string }> {
    if (!this.isEnabled || !this.config) {
      console.log('SMS Service: Service non configuré - Simulation envoi SMS');
      return this.simulateSMS(message);
    }

    try {
      // Importer Twilio uniquement si le service est configuré
      // @ts-ignore - twilio is an optional dependency
      const { default: twilio } = await import('twilio');
      const client = twilio(this.config.accountSid, this.config.authToken);

      const result = await client.messages.create({
        body: message.body,
        from: this.config.fromNumber,
        to: message.to,
      });

      console.log(`SMS Service: Message envoyé à ${message.to}, SID: ${result.sid}`);

      // Logger dans la base de données
      await this.logSMS(message, true, result.sid);

      return { success: true };

    } catch (error) {
      console.error('SMS Service: Erreur envoi SMS:', error);

      // Logger l'erreur
      await this.logSMS(message, false, undefined, error as Error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  private async simulateSMS(message: SMSMessage): Promise<{ success: boolean; error?: string }> {
    // Simulation pour le développement
    console.log('=== SMS SIMULÉ ===');
    console.log('À:', message.to);
    console.log('Message:', message.body);
    console.log('Type:', message.type);
    console.log('Ticket ID:', message.ticketId);
    console.log('================');

    // Logger la simulation
    await this.logSMS(message, true, 'SIMULATED');

    return { success: true };
  }

  private async logSMS(
    message: SMSMessage,
    success: boolean,
    sid?: string,
    error?: Error
  ): Promise<void> {
    try {
      await db.sMSLog.create({
        data: {
          to: message.to,
          body: message.body,
          from: this.config?.fromNumber || 'SIMULATED',
          status: success ? 'sent' : 'failed',
          sid: sid,
          error: error?.message,
          ticketId: message.ticketId ? parseInt(message.ticketId as string, 10) || null : null,
          userId: message.userId,
          type: message.type || 'general',
          sentAt: new Date(),
        }
      });
    } catch (logError) {
      console.error('SMS Service: Erreur logging SMS:', logError);
    }
  }

  // Méthodes spécifiques pour les notifications de tickets
  async notifyTicketAssigned(userPhone: string, ticketId: string, ticketNumber: string): Promise<void> {
    const message = `IT Support: Nouveau ticket ${ticketNumber} vous a été assigné. Veuillez consulter votre tableau de bord.`;

    await this.sendSMS({
      to: userPhone,
      body: message,
      ticketId,
      type: 'ticket_assigned'
    });
  }

  async notifyTicketUpdated(userPhone: string, ticketId: string, ticketNumber: string, status: string): Promise<void> {
    const statusText = this.getStatusText(status);
    const message = `IT Support: Votre ticket ${ticketNumber} a été mis à jour - Statut: ${statusText}`;

    await this.sendSMS({
      to: userPhone,
      body: message,
      ticketId,
      type: 'ticket_updated'
    });
  }

  async notifyTicketClosed(userPhone: string, ticketId: string, ticketNumber: string): Promise<void> {
    const message = `IT Support: Votre ticket ${ticketNumber} a été résolu. Merci de votre patience.`;

    await this.sendSMS({
      to: userPhone,
      body: message,
      ticketId,
      type: 'ticket_closed'
    });
  }

  async notifyUrgentTicket(userPhone: string, ticketId: string, ticketNumber: string, description: string): Promise<void> {
    const shortDesc = description.length > 100 ? description.substring(0, 100) + '...' : description;
    const message = `URGENT IT Support: Ticket critique ${ticketNumber}: ${shortDesc}. Intervention requise immédiatement.`;

    await this.sendSMS({
      to: userPhone,
      body: message,
      ticketId,
      type: 'urgent'
    });
  }

  async notifyAgentOnCall(agentPhone: string, message: string): Promise<void> {
    const smsMessage = `IT Support: ${message}`;

    await this.sendSMS({
      to: agentPhone,
      body: smsMessage,
      type: 'urgent'
    });
  }

  // Vérifier si un utilisateur accepte les SMS
  async canSendSMS(userId: string): Promise<boolean> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { phone: true, notification_sms: true }
      });

      return !!(user?.phone && user.notification_sms);
    } catch {
      return false;
    }
  }

  // Envoyer SMS à un utilisateur si configuré
  async sendToUser(userId: string, message: SMSMessage): Promise<boolean> {
    const canSend = await this.canSendSMS(userId);
    if (!canSend) {
      console.log(`SMS Service: Utilisateur ${userId} n'accepte pas les SMS ou pas de numéro`);
      return false;
    }

    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { phone: true }
      });

      if (user?.phone) {
        const result = await this.sendSMS({
          ...message,
          to: user.phone,
          userId
        });

        return result.success;
      }
    } catch (error) {
      console.error(`SMS Service: Erreur envoi à l'utilisateur ${userId}:`, error);
    }

    return false;
  }

  // Obtenir les statistiques SMS
  async getStats(days: number = 30): Promise<{
    total: number;
    sent: number;
    failed: number;
    byType: Record<string, number>;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const logs = await db.sMSLog.findMany({
        where: {
          sentAt: { gte: startDate }
        }
      });

      const stats = {
        total: logs.length,
        sent: logs.filter(log => log.status === 'sent').length,
        failed: logs.filter(log => log.status === 'failed').length,
        byType: {} as Record<string, number>
      };

      logs.forEach(log => {
        const type = log.type || 'general';
        stats.byType[type] = (stats.byType[type] || 0) + 1;
      });

      return stats;

    } catch (error) {
      console.error('SMS Service: Erreur récupération statistiques:', error);
      return {
        total: 0,
        sent: 0,
        failed: 0,
        byType: {}
      };
    }
  }

  // Tester la configuration Twilio
  async testConfiguration(): Promise<{ valid: boolean; error?: string }> {
    if (!this.isEnabled) {
      return { valid: false, error: 'Service non configuré' };
    }

    try {
      const { default: twilio } = await import('twilio');
      const client = twilio(this.config!.accountSid, this.config!.authToken);

      // Vérifier le compte
      const account = await client.api.accounts(this.config!.accountSid).fetch();

      return {
        valid: true,
        error: undefined
      };

    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Erreur configuration Twilio'
      };
    }
  }

  // Formater le texte de statut pour SMS
  private getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'OUVERT': 'Ouvert',
      'EN_DIAGNOSTIC': 'En diagnostic',
      'EN_REPARATION': 'En réparation',
      'REPARÉ': 'Résolu',
      'FERMÉ': 'Fermé'
    };
    return statusMap[status] || status;
  }

  // Nettoyer le numéro de téléphone
  private formatPhoneNumber(phone: string): string {
    // Supprimer tous les caractères non numériques
    let cleaned = phone.replace(/\D/g, '');

    // Ajouter le préfixe international si nécessaire
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      cleaned = '33' + cleaned.substring(1); // France
    }

    return '+' + cleaned;
  }
}

// Instance globale du service SMS
export const smsService = new SMSService();

// Fonctions pour les workflows
export const sendSMSNotification = async (userId: string, type: string, data: any) => {
  const { smsService } = await import('./sms-service');

  switch (type) {
    case 'ticket_assigned':
      await smsService.notifyTicketAssigned(
        data.userPhone,
        data.ticketId,
        data.ticketNumber
      );
      break;

    case 'ticket_updated':
      await smsService.notifyTicketUpdated(
        data.userPhone,
        data.ticketId,
        data.ticketNumber,
        data.status
      );
      break;

    case 'ticket_closed':
      await smsService.notifyTicketClosed(
        data.userPhone,
        data.ticketId,
        data.ticketNumber
      );
      break;

    case 'urgent':
      await smsService.notifyUrgentTicket(
        data.userPhone,
        data.ticketId,
        data.ticketNumber,
        data.description
      );
      break;
  }
};