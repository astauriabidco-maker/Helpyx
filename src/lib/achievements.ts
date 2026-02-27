import { db } from '@/lib/db';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: AchievementCategory;
  target?: number;
}

export enum AchievementCategory {
  SPEED = 'SPEED',
  QUALITY = 'QUALITY',
  CONSISTENCY = 'CONSISTENCY',
  EXPERTISE = 'EXPERTISE',
  TEAMWORK = 'TEAMWORK',
  MILESTONE = 'MILESTONE'
}

export class AchievementService {
  // Liste des achievements prédéfinis
  private static readonly DEFAULT_ACHIEVEMENTS: Omit<Achievement, 'id'>[] = [
    // Speed achievements
    {
      name: "Éclair",
      description: "Résoudre 5 tickets en moins de 30 minutes chacun",
      icon: "⚡",
      points: 100,
      category: AchievementCategory.SPEED,
      target: 5
    },
    {
      name: "Speed Demon",
      description: "Résoudre 10 tickets en moins de 15 minutes chacun",
      icon: "🚀",
      points: 250,
      category: AchievementCategory.SPEED,
      target: 10
    },
    {
      name: "Réponse Rapide",
      description: "Répondre à un nouveau ticket en moins de 5 minutes",
      icon: "⏰",
      points: 50,
      category: AchievementCategory.SPEED,
      target: 1
    },

    // Quality achievements
    {
      name: "Qualité Premium",
      description: "Obtenir 10 évaluations 5 étoiles consécutives",
      icon: "⭐",
      points: 200,
      category: AchievementCategory.QUALITY,
      target: 10
    },
    {
      name: "Expert en Résolution",
      description: "Résoudre 50 tickets sans réouverture",
      icon: "🎯",
      points: 500,
      category: AchievementCategory.QUALITY,
      target: 50
    },
    {
      name: "Satisfaction Client",
      description: "Maintenir un taux de satisfaction de 95% sur 100 tickets",
      icon: "😊",
      points: 300,
      category: AchievementCategory.QUALITY,
      target: 100
    },

    // Consistency achievements
    {
      name: "Warrior",
      description: "Résoudre au moins 5 tickets par jour pendant 7 jours consécutifs",
      icon: "⚔️",
      points: 350,
      category: AchievementCategory.CONSISTENCY,
      target: 7
    },
    {
      name: "Marathonien",
      description: "Résoudre 100 tickets en un mois",
      icon: "🏃",
      points: 400,
      category: AchievementCategory.CONSISTENCY,
      target: 100
    },
    {
      name: "Présence Quotidienne",
      description: "Se connecter 20 jours consécutifs",
      icon: "📅",
      points: 150,
      category: AchievementCategory.CONSISTENCY,
      target: 20
    },

    // Expertise achievements
    {
      name: "Expert Hardware",
      description: "Résoudre 25 tickets hardware",
      icon: "💻",
      points: 200,
      category: AchievementCategory.EXPERTISE,
      target: 25
    },
    {
      name: "Gourou Software",
      description: "Résoudre 25 tickets software",
      icon: "🖥️",
      points: 200,
      category: AchievementCategory.EXPERTISE,
      target: 25
    },
    {
      name: "Maître Réseau",
      description: "Résoudre 15 tickets réseau",
      icon: "🌐",
      points: 150,
      category: AchievementCategory.EXPERTISE,
      target: 15
    },

    // Teamwork achievements
    {
      name: "Collaborateur",
      description: "Aider 10 autres agents avec des commentaires utiles",
      icon: "🤝",
      points: 100,
      category: AchievementCategory.TEAMWORK,
      target: 10
    },
    {
      name: "Mentor",
      description: "Former 3 nouveaux agents",
      icon: "👨‍🏫",
      points: 300,
      category: AchievementCategory.TEAMWORK,
      target: 3
    },

    // Milestone achievements
    {
      name: "Premier Ticket",
      description: "Résoudre votre premier ticket",
      icon: "🎉",
      points: 25,
      category: AchievementCategory.MILESTONE,
      target: 1
    },
    {
      name: "Novice",
      description: "Résoudre 10 tickets",
      icon: "🌟",
      points: 75,
      category: AchievementCategory.MILESTONE,
      target: 10
    },
    {
      name: "Vétéran",
      description: "Résoudre 100 tickets",
      icon: "🏆",
      points: 250,
      category: AchievementCategory.MILESTONE,
      target: 100
    },
    {
      name: "Légende",
      description: "Résoudre 1000 tickets",
      icon: "👑",
      points: 1000,
      category: AchievementCategory.MILESTONE,
      target: 1000
    }
  ];

  // Initialiser les achievements par défaut
  static async initializeDefaultAchievements(): Promise<void> {
    try {
      for (const achievement of this.DEFAULT_ACHIEVEMENTS) {
        const existing = await db.achievement.findFirst({
          where: { name: achievement.name }
        });
        if (!existing) {
          await db.achievement.create({
            data: {
              name: achievement.name,
              description: achievement.description,
              icon: achievement.icon,
              points: achievement.points,
              category: achievement.category as any,
              target: achievement.target
            }
          });
        }
      }
    } catch (error) {
      console.error('Error initializing achievements:', error);
    }
  }

  // Vérifier et débloquer les achievements pour un utilisateur
  static async checkAndUnlockAchievements(userId: string): Promise<Achievement[]> {
    const unlockedAchievements: Achievement[] = [];

    try {
      // Récupérer tous les achievements
      const allAchievements = await db.achievement.findMany();

      // Récupérer les achievements déjà débloqués
      const userAchievements = await db.userAchievement.findMany({
        where: { userId },
        include: { achievement: true }
      });

      const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));

      // Récupérer les statistiques de l'utilisateur
      const userStats = await this.getUserStats(userId);

      // Vérifier chaque achievement
      for (const achievement of allAchievements) {
        if (unlockedIds.has(achievement.id)) continue;

        const isUnlocked = await this.checkAchievementCondition(achievement, userStats);

        if (isUnlocked) {
          // Débloquer l'achievement
          await db.userAchievement.create({
            data: {
              userId,
              achievementId: achievement.id,
              progress: achievement.target || 1
            }
          });

          // Ajouter les points à l'utilisateur
          await db.user.update({
            where: { id: userId },
            data: {
              points: {
                increment: achievement.points
              }
            }
          });

          unlockedAchievements.push(achievement as any);
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }

    return unlockedAchievements;
  }

  // Vérifier la condition d'un achievement spécifique
  private static async checkAchievementCondition(
    achievement: any,
    userStats: any
  ): Promise<boolean> {
    const { name, target } = achievement;

    switch (name) {
      case "Premier Ticket":
        return userStats.totalTicketsResolved >= 1;

      case "Novice":
        return userStats.totalTicketsResolved >= 10;

      case "Vétéran":
        return userStats.totalTicketsResolved >= 100;

      case "Légende":
        return userStats.totalTicketsResolved >= 1000;

      case "Expert Hardware":
        return userStats.hardwareTicketsResolved >= 25;

      case "Gourou Software":
        return userStats.softwareTicketsResolved >= 25;

      case "Maître Réseau":
        return userStats.networkTicketsResolved >= 15;

      case "Présence Quotidienne":
        return userStats.consecutiveDays >= 20;

      case "Warrior":
        return userStats.currentStreak >= 7;

      default:
        // Pour les achievements plus complexes, une logique supplémentaire serait nécessaire
        return false;
    }
  }

  // Récupérer les statistiques d'un utilisateur
  private static async getUserStats(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        totalTicketsResolved: true,
        streak: true,
        lastActiveAt: true
      }
    });

    // Récupérer les tickets résolus par type
    const ticketsByType = await db.ticket.groupBy({
      by: ['type_panne'],
      where: {
        assignedToId: userId,
        status: 'REPARÉ'
      },
      _count: true
    });

    const hardwareTicketsResolved = ticketsByType.find(t => t.type_panne === 'HARDWARE')?._count || 0;
    const softwareTicketsResolved = ticketsByType.find(t => t.type_panne === 'SOFTWARE')?._count || 0;
    const networkTicketsResolved = ticketsByType.find(t => t.type_panne === 'RÉSEAU')?._count || 0;

    // Calculer les jours consécutifs
    const consecutiveDays = this.calculateConsecutiveDays(user?.lastActiveAt);

    return {
      totalTicketsResolved: user?.totalTicketsResolved || 0,
      currentStreak: user?.streak || 0,
      consecutiveDays,
      hardwareTicketsResolved,
      softwareTicketsResolved,
      networkTicketsResolved
    };
  }

  // Calculer les jours consécutifs d'activité
  private static calculateConsecutiveDays(lastActiveAt?: Date): number {
    if (!lastActiveAt) return 0;

    const now = new Date();
    const lastActive = new Date(lastActiveAt);
    const diffTime = Math.abs(now.getTime() - lastActive.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays <= 1 ? 1 : 0;
  }

  // Récupérer tous les achievements d'un utilisateur
  static async getUserAchievements(userId: string) {
    return await db.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' }
    });
  }

  // Récupérer les achievements disponibles (non débloqués)
  static async getAvailableAchievements(userId: string) {
    const userAchievements = await db.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true }
    });

    const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));

    return await db.achievement.findMany({
      where: {
        id: {
          notIn: Array.from(unlockedIds)
        }
      },
      orderBy: { category: 'asc' }
    });
  }

  // Mettre à jour le progrès d'un achievement
  static async updateAchievementProgress(
    userId: string,
    achievementId: string,
    progress: number
  ) {
    return await db.userAchievement.upsert({
      where: {
        userId_achievementId: { userId, achievementId }
      },
      update: { progress },
      create: {
        userId,
        achievementId,
        progress
      }
    });
  }
}