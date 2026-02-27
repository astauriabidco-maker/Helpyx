'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trophy,
  Star,
  Zap,
  Target,
  Calendar,
  Award,
  TrendingUp,
  Crown,
  Gift,
  Flame
} from 'lucide-react';

interface GamificationStats {
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

interface Achievement {
  id: string;
  achievement: {
    id: string;
    name: string;
    description: string;
    icon: string;
    points: number;
    category: string;
  };
  unlockedAt: string;
  progress: number;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  points: number;
  createdAt: string;
  metadata?: any;
}

interface GamificationProfileProps {
  userId: string;
}

export function GamificationProfile({ userId }: GamificationProfileProps) {
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyBonusClaimed, setDailyBonusClaimed] = useState(false);

  useEffect(() => {
    fetchGamificationData();
  }, [userId]);

  const fetchGamificationData = async () => {
    try {
      setLoading(true);

      // Récupérer les statistiques (auth via session, pas userId)
      const statsResponse = await fetch(`/api/gamification/stats`);
      const statsData = await statsResponse.json();
      setStats(statsData.stats);

      // Récupérer les achievements
      const achievementsResponse = await fetch(`/api/gamification/achievements`);
      const achievementsData = await achievementsResponse.json();
      setAchievements(achievementsData.achievements || []);

      // Récupérer les activités
      const activitiesResponse = await fetch(`/api/gamification/activities`);
      const activitiesData = await activitiesResponse.json();
      setActivities(activitiesData.activities || []);

    } catch (error) {
      console.error('Error fetching gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimDailyBonus = async () => {
    try {
      const response = await fetch('/api/gamification/bonus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'daily' })
      });

      const data = await response.json();

      if (data.success) {
        setDailyBonusClaimed(true);
        fetchGamificationData(); // Rafraîchir les données
      }
    } catch (error) {
      console.error('Error claiming daily bonus:', error);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'TICKET_RESOLVED': return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'ACHIEVEMENT_UNLOCKED': return <Award className="h-4 w-4 text-purple-500" />;
      case 'DAILY_BONUS': return <Gift className="h-4 w-4 text-green-500" />;
      case 'LEVEL_UP': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'STREAK_BONUS': return <Flame className="h-4 w-4 text-orange-500" />;
      default: return <Star className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'SPEED': return 'bg-blue-100 text-blue-800';
      case 'QUALITY': return 'bg-green-100 text-green-800';
      case 'CONSISTENCY': return 'bg-orange-100 text-orange-800';
      case 'EXPERTISE': return 'bg-purple-100 text-purple-800';
      case 'TEAMWORK': return 'bg-pink-100 text-pink-800';
      case 'MILESTONE': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Impossible de charger les données de gamification</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Points</p>
                <p className="text-2xl font-bold text-gray-900">{stats.points.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-50 rounded-full -mr-10 -mt-10"></div>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Niveau</p>
                <p className="text-2xl font-bold text-gray-900">{stats.level}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Crown className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2">
              <Progress value={(stats.points / stats.nextLevelPoints) * 100} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                {stats.pointsToNextLevel} pts pour le niveau suivant
              </p>
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-50 rounded-full -mr-10 -mt-10"></div>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Streak</p>
                <p className="text-2xl font-bold text-gray-900">{stats.streak} jours</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Flame className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-50 rounded-full -mr-10 -mt-10"></div>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Classement</p>
                <p className="text-2xl font-bold text-gray-900">#{stats.rank || '-'}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Trophy className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-full -mr-10 -mt-10"></div>
        </Card>
      </div>

      {/* Bonus quotidien */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Bonus Quotidien
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Réclamez votre bonus quotidien</p>
              <p className="text-sm text-gray-600">Gagnez 25 points chaque jour en vous connectant</p>
            </div>
            <Button
              onClick={claimDailyBonus}
              disabled={dailyBonusClaimed}
              className="min-w-32"
            >
              {dailyBonusClaimed ? 'Déjà réclamé' : 'Réclamer'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="achievements" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="activities">Activité Récente</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Achievements Débloqués ({achievements.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {achievements.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Aucun achievement débloqué pour le moment. Continuez à résoudre des tickets!
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((userAchievement) => (
                    <div
                      key={userAchievement.id}
                      className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="text-2xl">{userAchievement.achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium">{userAchievement.achievement.name}</h4>
                        <p className="text-sm text-gray-600">
                          {userAchievement.achievement.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getCategoryColor(userAchievement.achievement.category)}>
                            {userAchievement.achievement.category}
                          </Badge>
                          <Badge variant="outline">
                            +{userAchievement.achievement.points} pts
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Activité Récente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Aucune activité récente
                </p>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getActivityIcon(activity.type)}
                        <div>
                          <p className="font-medium">{activity.description}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(activity.createdAt).toLocaleString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-600">
                        +{activity.points} pts
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}