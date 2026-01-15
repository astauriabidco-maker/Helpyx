import { GamificationService, ActivityType } from '@/lib/gamification';

export class TicketGamificationIntegration {
  
  // Enregistrer la création d'un ticket
  static async onTicketCreated(userId: string, ticketId: string, ticketData: any) {
    try {
      await GamificationService.recordActivity(
        userId,
        ActivityType.TICKET_CREATED,
        `Ticket créé: ${ticketData.titre || ticketData.description}`,
        {
          ticketId,
          priority: ticketData.priorite,
          category: ticketData.categorie
        }
      );
    } catch (error) {
      console.error('Error recording ticket creation activity:', error);
    }
  }

  // Enregistrer l'assignation d'un ticket
  static async onTicketAssigned(userId: string, ticketId: string, assignedTo: string) {
    try {
      await GamificationService.recordActivity(
        userId,
        ActivityType.TICKET_ASSIGNED,
        `Ticket assigné: ${ticketId}`,
        {
          ticketId,
          assignedTo
        }
      );
    } catch (error) {
      console.error('Error recording ticket assignment activity:', error);
    }
  }

  // Enregistrer la résolution d'un ticket avec bonus de vitesse
  static async onTicketResolved(
    userId: string, 
    ticketId: string, 
    resolutionTime?: number,
    rating?: number
  ) {
    try {
      // Activité de base
      await GamificationService.recordActivity(
        userId,
        ActivityType.TICKET_RESOLVED,
        `Ticket résolu: ${ticketId}`,
        {
          ticketId,
          resolutionTime,
          rating
        }
      );

      // Bonus de vitesse si applicable
      if (resolutionTime && resolutionTime < 15) {
        await GamificationService.awardSpeedBonus(userId, resolutionTime);
      }

      // Bonus de qualité si applicable
      if (rating && rating >= 5) {
        await GamificationService.awardQualityBonus(userId, rating);
      }

      // Mettre à jour le streak
      await GamificationService.updateStreak(userId);

    } catch (error) {
      console.error('Error recording ticket resolution activity:', error);
    }
  }

  // Enregistrer l'ajout d'un commentaire
  static async onCommentAdded(userId: string, ticketId: string, commentId: string) {
    try {
      await GamificationService.recordActivity(
        userId,
        ActivityType.COMMENT_ADDED,
        `Commentaire ajouté au ticket: ${ticketId}`,
        {
          ticketId,
          commentId
        }
      );
    } catch (error) {
      console.error('Error recording comment activity:', error);
    }
  }

  // Calculer les points bonus pour résolution rapide
  static calculateSpeedBonus(createdAt: Date, resolvedAt: Date): number {
    const diffHours = (resolvedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 0.5) return 50; // Moins de 30 minutes
    if (diffHours < 1) return 30;   // Moins d'une heure
    if (diffHours < 2) return 20;   // Moins de 2 heures
    if (diffHours < 4) return 10;   // Moins de 4 heures
    return 0; // Pas de bonus
  }

  // Calculer les points bonus pour qualité
  static calculateQualityBonus(rating: number, hasReopen: boolean): number {
    if (hasReopen) return 0; // Pas de bonus si réouverture
    
    switch (rating) {
      case 5: return 30; // Excellent
      case 4: return 15; // Très bon
      case 3: return 5;  // Acceptable
      default: return 0; // Pas de bonus
    }
  }

  // Points pour travail d'équipe (commentaires utiles)
  static async awardTeamworkBonus(userId: string, helpfulComments: number) {
    try {
      if (helpfulComments >= 5) {
        await GamificationService.recordActivity(
          userId,
          ActivityType.TEAM_BONUS,
          `Bonus d'équipe: ${helpfulComments} commentaires utiles`,
          { helpfulComments }
        );
      }
    } catch (error) {
      console.error('Error awarding teamwork bonus:', error);
    }
  }

  // Initialiser la gamification pour un nouvel agent
  static async initializeAgentGamification(userId: string) {
    try {
      await GamificationService.initializeUserGamification(userId);
    } catch (error) {
      console.error('Error initializing agent gamification:', error);
    }
  }

  // Synchroniser les statistiques de tickets avec la gamification
  static async syncTicketStats(userId: string) {
    try {
      // Cette fonction pourrait être appelée périodiquement pour synchroniser
      // les statistiques de tickets résolus avec le système de gamification
      const stats = await GamificationService.getUserGamificationStats(userId);
      
      // Mettre à jour les achievements basés sur les statistiques
      // (la logique est déjà gérée dans AchievementService.checkAndUnlockAchievements)
      
      return stats;
    } catch (error) {
      console.error('Error syncing ticket stats:', error);
      throw error;
    }
  }
}