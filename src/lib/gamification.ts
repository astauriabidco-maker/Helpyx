import { db } from '@/lib/db';
import { AchievementService } from './achievements';

export interface Activity {
  id: string;
  userId: string;
  type: ActivityType;
  description: string;
  points: number;
  metadata?: any;
  createdAt: Date;
}

export enum ActivityType {
  TICKET_CREATED = 'TICKET_CREATED',
  TICKET_RESOLVED = 'TICKET_RESOLVED',
  TICKET_ASSIGNED = 'TICKET_ASSIGNED',
  COMMENT_ADDED = 'COMMENT_ADDED',
  ACHIEVEMENT_UNLOCKED = 'ACHIEVEMENT_UNLOCKED',
  LEVEL_UP = 'LEVEL_UP',
  STREAK_BONUS = 'STREAK_BONUS',
  DAILY_BONUS = 'DAILY_BONUS',
  QUALITY_BONUS = 'QUALITY_BONUS',
  SPEED_BONUS = 'SPEED_BONUS',
  TEAM_BONUS = 'TEAM_BONUS'
}

export interface GamificationStats {
  points: number;
  level: number;
  streak: number;
  totalTicketsResolved: number;
  avgResolutionTime: number;
  achievementsUnlocked: number;
  rank?: number;
  nextLevelPoints: number;
  pointsToNextLevel: number;
}

export class GamificationService {
  // Points par action
  private static readonly POINTS_REWARDS = {
    [ActivityType.TICKET_CREATED]: 5,
    [ActivityType.TICKET_RESOLVED]: 20,
    [ActivityType.TICKET_ASSIGNED]: 10,
    [ActivityType.COMMENT_ADDED]: 5,
    [ActivityType.ACHIEVEMENT_UNLOCKED]: 50,
    [ActivityType.DAILY_BONUS]: 25,
    [ActivityType.STREAK_BONUS]: 15,
    [ActivityType.QUALITY_BONUS]: 30,
    [ActivityType.SPEED_BONUS]: 25,
    [ActivityType.TEAM_BONUS]: 20
  };

  // Calculer les points nécessaires pour chaque niveau
  private static getPointsForLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  }

  // Enregistrer une activité et attribuer des points
  static async recordActivity(
    userId: string,
    type: ActivityType,
    description: string,
    metadata?: any
  ): Promise<Activity> {
    try {
      const points = this.POINTS_REWARDS[type] || 0;

      // Créer l'activité
      const activity = await db.activity.create({
        data: {
          userId,
          type,
          description,
          points,
          metadata: metadata ? JSON.stringify(metadata) : null
        }
      });

      // Mettre à jour les points de l'utilisateur
      await this.updateUserPoints(userId, points);

      // Mettre à jour les statistiques si nécessaire
      if (type === ActivityType.TICKET_RESOLVED) {
        await this.updateTicketStats(userId, metadata);
      }

      // Vérifier les achievements
      const unlockedAchievements = await AchievementService.checkAndUnlockAchievements(userId);
      
      // Enregistrer les achievements débloqués
      for (const achievement of unlockedAchievements) {
        await this.recordActivity(
          userId,
          ActivityType.ACHIEVEMENT_UNLOCKED,
          `Achievement débloqué: ${achievement.name}`,
          { achievementId: achievement.id, achievementName: achievement.name }
        );
      }

      // Vérifier le niveau
      await this.checkLevelUp(userId);

      return activity;
    } catch (error) {
      console.error('Error recording activity:', error);
      throw error;
    }
  }

  // Mettre à jour les points de l'utilisateur
  private static async updateUserPoints(userId: string, pointsToAdd: number): Promise<void> {
    await db.user.update({
      where: { id: userId },
      data: {
        points: {
          increment: pointsToAdd
        },
        lastActiveAt: new Date()
      }
    });
  }

  // Mettre à jour les statistiques de tickets
  private static async updateTicketStats(userId: string, metadata?: any): Promise<void> {
    if (metadata?.resolutionTime) {
      await db.user.update({
        where: { id: userId },
        data: {
          totalTicketsResolved: {
            increment: 1
          },
          avgResolutionTime: metadata.resolutionTime
        }
      });
    } else {
      await db.user.update({
        where: { id: userId },
        data: {
          totalTicketsResolved: {
            increment: 1
          }
        }
      });
    }
  }

  // Vérifier et gérer le passage au niveau supérieur
  private static async checkLevelUp(userId: string): Promise<void> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { points: true, level: true }
    });

    if (!user) return;

    const currentLevelPoints = this.getPointsForLevel(user.level);
    const nextLevelPoints = this.getPointsForLevel(user.level + 1);

    if (user.points >= nextLevelPoints) {
      // Passage au niveau supérieur
      await db.user.update({
        where: { id: userId },
        data: {
          level: {
            increment: 1
          }
        }
      });

      // Enregistrer l'activité de niveau supérieur
      await this.recordActivity(
        userId,
        ActivityType.LEVEL_UP,
        `Niveau ${user.level + 1} atteint!`,
        { newLevel: user.level + 1 }
      );

      // Bonus de niveau
      const levelBonus = user.level * 10;
      await this.updateUserPoints(userId, levelBonus);
    }
  }

  // Calculer le streak de jours consécutifs
  static async updateStreak(userId: string): Promise<number> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { lastActiveAt: true, streak: true }
    });

    if (!user) return 0;

    const now = new Date();
    const lastActive = new Date(user.lastActiveAt);
    
    // Vérifier si c'est le même jour
    const isSameDay = 
      now.getDate() === lastActive.getDate() &&
      now.getMonth() === lastActive.getMonth() &&
      now.getFullYear() === lastActive.getFullYear();

    if (isSameDay) {
      return user.streak;
    }

    // Vérifier si c'est le jour suivant
    const tomorrow = new Date(lastActive);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const isNextDay = 
      now.getDate() === tomorrow.getDate() &&
      now.getMonth() === tomorrow.getMonth() &&
      now.getFullYear() === tomorrow.getFullYear();

    let newStreak = isNextDay ? user.streak + 1 : 1;

    // Mettre à jour le streak
    await db.user.update({
      where: { id: userId },
      data: {
        streak: newStreak,
        lastActiveAt: now
      }
    });

    // Bonus de streak
    if (newStreak > 1 && newStreak % 7 === 0) {
      await this.recordActivity(
        userId,
        ActivityType.STREAK_BONUS,
        `Bonus de streak: ${newStreak} jours consécutifs!`,
        { streak: newStreak }
      );
    }

    return newStreak;
  }

  // Bonus de connexion quotidienne
  static async claimDailyBonus(userId: string): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingBonus = await db.activity.findFirst({
      where: {
        userId,
        type: ActivityType.DAILY_BONUS,
        createdAt: {
          gte: today
        }
      }
    });

    if (existingBonus) {
      return false; // Bonus déjà réclamé aujourd'hui
    }

    await this.recordActivity(
      userId,
      ActivityType.DAILY_BONUS,
      'Bonus de connexion quotidienne',
      { date: today.toISOString() }
    );

    return true;
  }

  // Bonus de vitesse
  static async awardSpeedBonus(userId: string, resolutionTime: number): Promise<void> {
    if (resolutionTime < 15) { // Moins de 15 minutes
      await this.recordActivity(
        userId,
        ActivityType.SPEED_BONUS,
        `Bonus de vitesse: Résolution en ${resolutionTime} minutes`,
        { resolutionTime }
      );
    }
  }

  // Bonus de qualité
  static async awardQualityBonus(userId: string, rating: number): Promise<void> {
    if (rating >= 5) { // Évaluation parfaite
      await this.recordActivity(
        userId,
        ActivityType.QUALITY_BONUS,
        `Bonus de qualité: Évaluation de ${rating}/5 étoiles`,
        { rating }
      );
    }
  }

  // Récupérer les statistiques de gamification d'un utilisateur
  static async getUserGamificationStats(userId: string): Promise<GamificationStats> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        points: true,
        level: true,
        streak: true,
        totalTicketsResolved: true,
        avgResolutionTime: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const achievementsCount = await db.userAchievement.count({
      where: { userId }
    });

    const nextLevelPoints = this.getPointsForLevel(user.level + 1);
    const pointsToNextLevel = Math.max(0, nextLevelPoints - user.points);

    // Calculer le rang (leaderboard)
    const rank = await this.getUserRank(userId);

    return {
      points: user.points,
      level: user.level,
      streak: user.streak,
      totalTicketsResolved: user.totalTicketsResolved,
      avgResolutionTime: user.avgResolutionTime,
      achievementsUnlocked: achievementsCount,
      rank,
      nextLevelPoints,
      pointsToNextLevel
    };
  }

  // Récupérer le rang d'un utilisateur
  private static async getUserRank(userId: string): Promise<number> {
    const userPoints = await db.user.findUnique({
      where: { id: userId },
      select: { points: true }
    });

    if (!userPoints) return 0;

    const rank = await db.user.count({
      where: {
        points: {
          gt: userPoints.points
        }
      }
    });

    return rank + 1;
  }

  // Récupérer les activités récentes d'un utilisateur
  static async getUserActivities(userId: string, limit: number = 10) {
    return await db.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  // Récupérer le leaderboard
  static async getLeaderboard(period: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'all-time') {
    const whereClause = this.getLeaderboardDateFilter(period);

    return await db.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        points: true,
        level: true,
        totalTicketsResolved: true,
        avgResolutionTime: true
      },
      orderBy: [
        { points: 'desc' },
        { totalTicketsResolved: 'desc' }
      ],
      take: 50
    });
  }

  // Filtrer par période pour le leaderboard
  private static getLeaderboardDateFilter(period: string) {
    const now = new Date();
    
    switch (period) {
      case 'daily':
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return {
          lastActiveAt: {
            gte: today
          }
        };
      
      case 'weekly':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return {
          lastActiveAt: {
            gte: weekAgo
          }
        };
      
      case 'monthly':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return {
          lastActiveAt: {
            gte: monthAgo
          }
        };
      
      default:
        return {};
    }
  }

  // Initialiser la gamification pour un nouvel utilisateur
  static async initializeUserGamification(userId: string): Promise<void> {
    await AchievementService.initializeDefaultAchievements();
    
    // Bonus de bienvenue
    await this.recordActivity(
      userId,
      ActivityType.DAILY_BONUS,
      'Bienvenue dans la plateforme!',
      { welcomeBonus: true }
    );
  }
}