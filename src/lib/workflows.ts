import { db } from '@/lib/db';
import { getServer } from '@/lib/socket';
import { 
  notifyTicketEscalated, 
  sendNotificationToUser 
} from '@/lib/socket';

interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  trigger: 'status_change' | 'priority_change' | 'ticket_created' | 'comment_added' | 'time_elapsed';
  conditions: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
  }[];
  actions: {
    type: 'send_notification' | 'send_email' | 'send_sms' | 'escalate' | 'assign_agent' | 'create_survey' | 'update_field';
    parameters: any;
  }[];
  isActive: boolean;
}

class WorkflowEngine {
  private rules: WorkflowRule[] = [];

  constructor() {
    this.initializeDefaultRules();
  }

  private initializeDefaultRules() {
    // Règle 1: Enquête de satisfaction après résolution
    this.rules.push({
      id: 'satisfaction_survey',
      name: 'Enquête de satisfaction post-résolution',
      description: 'Envoyer une enquête de satisfaction quand un ticket est marqué comme résolu',
      trigger: 'status_change',
      conditions: [
        { field: 'new_status', operator: 'equals', value: 'REPARÉ' },
        { field: 'old_status', operator: 'not_equals', value: 'REPARÉ' }
      ],
      actions: [
        {
          type: 'create_survey',
          parameters: {
            surveyType: 'satisfaction',
            delay: 300000 // 5 minutes
          }
        },
        {
          type: 'send_email',
          parameters: {
            template: 'ticket_resolved',
            recipient: 'client'
          }
        }
      ],
      isActive: true
    });

    // Règle 2: Escalade automatique pour tickets critiques
    this.rules.push({
      id: 'critical_escalation',
      name: 'Escalade tickets critiques',
      description: 'Escalader automatiquement les tickets avec priorité critique',
      trigger: 'priority_change',
      conditions: [
        { field: 'new_priority', operator: 'equals', value: 'CRITIQUE' }
      ],
      actions: [
        {
          type: 'escalate',
          parameters: {
            notifyAllAgents: true,
            priority: 'CRITIQUE'
          }
        },
        {
          type: 'send_notification',
          parameters: {
            message: 'Ticket critique nécessitant une attention immédiate',
            type: 'urgent'
          }
        }
      ],
      isActive: true
    });

    // Règle 3: Assignation automatique selon la catégorie
    this.rules.push({
      id: 'auto_assign_category',
      name: 'Assignation automatique par catégorie',
      description: 'Assigner automatiquement les tickets selon leur catégorie',
      trigger: 'ticket_created',
      conditions: [
        { field: 'categorie', operator: 'contains', value: 'RÉSEAU' }
      ],
      actions: [
        {
          type: 'assign_agent',
          parameters: {
            agentSpecialty: 'network',
            roundRobin: true
          }
        }
      ],
      isActive: true
    });

    // Règle 4: Rappel pour tickets en attente
    this.rules.push({
      id: 'stale_ticket_reminder',
      name: 'Rappel tickets en attente',
      description: 'Envoyer un rappel pour les tickets sans mise à jour depuis 48h',
      trigger: 'time_elapsed',
      conditions: [
        { field: 'hours_since_update', operator: 'greater_than', value: 48 },
        { field: 'status', operator: 'equals', value: 'OUVERT' }
      ],
      actions: [
        {
          type: 'send_notification',
          parameters: {
            message: 'Ticket nécessite une attention - aucune mise à jour depuis 48h',
            recipient: 'assigned_agent'
          }
        },
        {
          type: 'send_email',
          parameters: {
            template: 'stale_ticket_reminder',
            recipient: 'assigned_agent'
          }
        }
      ],
      isActive: true
    });

    // Règle 5: Notification client pour progression
    this.rules.push({
      id: 'progress_notification',
      name: 'Notification de progression',
      description: 'Notifier le client des changements de statut significatifs',
      trigger: 'status_change',
      conditions: [
        { field: 'new_status', operator: 'equals', value: 'EN_REPARATION' }
      ],
      actions: [
        {
          type: 'send_notification',
          parameters: {
            message: 'Votre ticket est maintenant en cours de réparation',
            recipient: 'client'
          }
        },
        {
          type: 'send_email',
          parameters: {
            template: 'ticket_in_progress',
            recipient: 'client'
          }
        }
      ],
      isActive: true
    });
  }

  async processEvent(eventType: string, data: any) {
    console.log(`Processing workflow event: ${eventType}`, data);

    // Filtrer les règles qui correspondent à l'événement
    const applicableRules = this.rules.filter(rule => 
      rule.isActive && rule.trigger === eventType
    );

    for (const rule of applicableRules) {
      if (this.evaluateConditions(rule.conditions, data)) {
        await this.executeActions(rule.actions, data, rule);
      }
    }
  }

  private evaluateConditions(conditions: any[], data: any): boolean {
    return conditions.every(condition => {
      const { field, operator, value } = condition;
      const fieldValue = this.getFieldValue(data, field);
      
      switch (operator) {
        case 'equals':
          return fieldValue === value;
        case 'not_equals':
          return fieldValue !== value;
        case 'contains':
          return String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
        case 'greater_than':
          return Number(fieldValue) > Number(value);
        case 'less_than':
          return Number(fieldValue) < Number(value);
        default:
          return false;
      }
    });
  }

  private getFieldValue(data: any, field: string): any {
    // Support pour les champs imbriqués comme "new_status"
    return field.split('.').reduce((obj, key) => obj?.[key], data);
  }

  private async executeActions(actions: any[], data: any, rule: WorkflowRule) {
    console.log(`Executing actions for rule: ${rule.name}`);

    for (const action of actions) {
      try {
        await this.executeAction(action, data);
      } catch (error) {
        console.error(`Error executing action ${action.type}:`, error);
      }
    }
  }

  private async executeAction(action: any, data: any) {
    const { type, parameters } = action;

    switch (type) {
      case 'send_notification':
        await this.sendNotification(parameters, data);
        break;

      case 'send_email':
        await this.sendEmail(parameters, data);
        break;

      case 'send_sms':
        await this.sendSMS(parameters, data);
        break;

      case 'escalate':
        await this.escalateTicket(parameters, data);
        break;

      case 'assign_agent':
        await this.assignAgent(parameters, data);
        break;

      case 'create_survey':
        await this.createSurvey(parameters, data);
        break;

      case 'update_field':
        await this.updateField(parameters, data);
        break;

      default:
        console.warn(`Unknown action type: ${type}`);
    }
  }

  private async sendNotification(parameters: any, data: any) {
    const io = getServer();
    if (!io) return;

    const { message, recipient, type } = parameters;
    const ticketId = data.ticketId || data.id;
    const ticketNumber = `TICKET-${ticketId?.toString().padStart(6, '0')}`;

    if (recipient === 'client' && data.userId) {
      sendNotificationToUser(io, data.userId, {
        type: type || 'ticket_updated',
        ticketId: ticketId.toString(),
        ticketNumber,
        userId: data.userId,
        message,
        data
      });
    } else if (recipient === 'assigned_agent' && data.assignedToId) {
      sendNotificationToUser(io, data.assignedToId, {
        type: type || 'ticket_updated',
        ticketId: ticketId.toString(),
        ticketNumber,
        userId: data.assignedToId,
        message,
        data
      });
    }
  }

  private async sendEmail(parameters: any, data: any) {
    // TODO: Implémenter l'envoi d'emails
    console.log('Sending email:', parameters, data);
  }

  private async sendSMS(parameters: any, data: any) {
    // TODO: Implémenter l'envoi de SMS via Twilio
    console.log('Sending SMS:', parameters, data);
  }

  private async escalateTicket(parameters: any, data: any) {
    const io = getServer();
    if (!io) return;

    const ticketId = data.ticketId || data.id;
    const ticketNumber = `TICKET-${ticketId?.toString().padStart(6, '0')}`;

    if (parameters.notifyAllAgents) {
      notifyTicketEscalated(io, ticketId.toString(), ticketNumber, parameters.priority || 'HIGH');
    }

    // Mettre à jour la priorité dans la base de données
    if (parameters.priority) {
      await db.ticket.update({
        where: { id: ticketId },
        data: { priorite: parameters.priority }
      });
    }
  }

  private async assignAgent(parameters: any, data: any) {
    // TODO: Implémenter l'assignation automatique d'agents
    console.log('Assigning agent:', parameters, data);
  }

  private async createSurvey(parameters: any, data: any) {
    // TODO: Implémenter la création d'enquêtes de satisfaction
    console.log('Creating survey:', parameters, data);
  }

  private async updateField(parameters: any, data: any) {
    const { field, value } = parameters;
    const ticketId = data.ticketId || data.id;

    await db.ticket.update({
      where: { id: ticketId },
      data: { [field]: value }
    });
  }

  // Méthodes publiques pour la gestion des règles
  addRule(rule: WorkflowRule) {
    this.rules.push(rule);
  }

  removeRule(ruleId: string) {
    this.rules = this.rules.filter(rule => rule.id !== ruleId);
  }

  updateRule(ruleId: string, updates: Partial<WorkflowRule>) {
    const ruleIndex = this.rules.findIndex(rule => rule.id === ruleId);
    if (ruleIndex !== -1) {
      this.rules[ruleIndex] = { ...this.rules[ruleIndex], ...updates };
    }
  }

  getRules(): WorkflowRule[] {
    return this.rules;
  }

  getActiveRules(): WorkflowRule[] {
    return this.rules.filter(rule => rule.isActive);
  }
}

// Instance globale du moteur de workflows
export const workflowEngine = new WorkflowEngine();

// Fonctions utilitaires pour déclencher les workflows
export const triggerWorkflow = async (eventType: string, data: any) => {
  await workflowEngine.processEvent(eventType, data);
};

// Fonctions spécifiques pour les événements courants
export const onTicketCreated = async (ticket: any) => {
  await triggerWorkflow('ticket_created', ticket);
};

export const onTicketStatusChanged = async (ticket: any, oldStatus: string, newStatus: string) => {
  await triggerWorkflow('status_change', {
    ...ticket,
    old_status: oldStatus,
    new_status: newStatus
  });
};

export const onTicketPriorityChanged = async (ticket: any, oldPriority: string, newPriority: string) => {
  await triggerWorkflow('priority_change', {
    ...ticket,
    old_priority: oldPriority,
    new_priority: newPriority
  });
};

export const onCommentAdded = async (comment: any, ticket: any) => {
  await triggerWorkflow('comment_added', { comment, ticket });
};

export const checkStaleTickets = async () => {
  // Vérifier les tickets sans mise à jour depuis 48h
  const staleThreshold = new Date();
  staleThreshold.setHours(staleThreshold.getHours() - 48);

  const staleTickets = await db.ticket.findMany({
    where: {
      updatedAt: { lt: staleThreshold },
      status: 'OUVERT'
    }
  });

  for (const ticket of staleTickets) {
    const hoursSinceUpdate = Math.floor(
      (new Date().getTime() - ticket.updatedAt.getTime()) / (1000 * 60 * 60)
    );
    
    await triggerWorkflow('time_elapsed', {
      ...ticket,
      hours_since_update: hoursSinceUpdate
    });
  }
};