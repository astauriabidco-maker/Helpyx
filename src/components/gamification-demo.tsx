'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  Star,
  Target,
  Zap,
  Flame,
  Crown,
  Users,
  TrendingUp,
  Award,
  Gift,
  Gamepad2,
  Loader2
} from 'lucide-react';
import { GamificationProfile } from '@/components/gamification/gamification-profile';
import { Leaderboard } from '@/components/gamification/leaderboard';
import { AvailableAchievements } from '@/components/gamification/available-achievements';

interface CompanyGamificationStats {
  activeAgentsPercent: number;
  totalTicketsResolved: number;
  avgSatisfaction: number;
  engagementRate: number;
}

export default function GamificationDemo() {
  const { data: session, status } = useSession();
  const [companyStats, setCompanyStats] = useState<CompanyGamificationStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Récupérer les stats de gamification de l'entreprise
  useEffect(() => {
    async function fetchCompanyStats() {
      try {
        setLoadingStats(true);
        const response = await fetch('/api/gamification/company-stats');
        if (response.ok) {
          const data = await response.json();
          setCompanyStats(data.stats);
        }
      } catch (error) {
        console.error('Error fetching company gamification stats:', error);
      } finally {
        setLoadingStats(false);
      }
    }

    if (session?.user?.id) {
      fetchCompanyStats();
    }
  }, [session?.user?.id]);

  const userId = session?.user?.id;

  if (status === 'loading') {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AppShell>
    );
  }

  if (!userId) {
    return (
      <AppShell>
        <div className="text-center py-20">
          <Gamepad2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-700">Connexion requise</h2>
          <p className="text-gray-500 mt-2">Connectez-vous pour accéder à la gamification</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gamepad2 className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
              Gamification
            </h1>
          </div>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Maximisez l'engagement de vos agents avec un système de gamification complet
            basé sur les performances, la collaboration et l'excellence.
          </p>
        </div>

        {/* Statistiques principales — données réelles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Agents Actifs</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {loadingStats ? '...' : `${companyStats?.activeAgentsPercent || 0}%`}
                  </p>
                  <p className="text-xs text-green-600">agents avec activité récente</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-full -mr-10 -mt-10"></div>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Tickets Résolus</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {loadingStats ? '...' : companyStats?.totalTicketsResolved?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs text-green-600">par tous les agents</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-full -mr-10 -mt-10"></div>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Satisfaction</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {loadingStats ? '...' : `${companyStats?.avgSatisfaction || 0}/5`}
                  </p>
                  <p className="text-xs text-green-600">note moyenne</p>
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
                  <p className="text-sm font-medium text-slate-600">Engagement</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {loadingStats ? '...' : `${companyStats?.engagementRate || 0}%`}
                  </p>
                  <p className="text-xs text-green-600">agents avec points</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Flame className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-50 rounded-full -mr-10 -mt-10"></div>
          </Card>
        </div>

        {/* Onglets */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Mon Profil
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Classement
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Fonctionnalités
            </TabsTrigger>
          </TabsList>

          {/* Profil de gamification — utilisateur connecté */}
          <TabsContent value="profile">
            <GamificationProfile userId={userId} />
          </TabsContent>

          {/* Leaderboard */}
          <TabsContent value="leaderboard">
            <Leaderboard userId={userId} />
          </TabsContent>

          {/* Achievements */}
          <TabsContent value="achievements">
            <AvailableAchievements userId={userId} />
          </TabsContent>

          {/* Fonctionnalités */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Star className="h-5 w-5 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">Système de Points</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Gagnez des points pour chaque action : création, résolution,
                    commentaires, et performances exceptionnelles.
                  </p>
                  <div className="space-y-2">
                    <Badge variant="outline">+5 pts Création</Badge>
                    <Badge variant="outline">+20 pts Résolution</Badge>
                    <Badge variant="outline">+10 pts Assignation</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Trophy className="h-5 w-5 text-green-600" />
                    </div>
                    <CardTitle className="text-lg">Achievements</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Débloquez des achievements en atteignant des objectifs spécifiques
                    et en démontrant votre expertise.
                  </p>
                  <div className="space-y-2">
                    <Badge className="bg-blue-100 text-blue-800">Vitesse</Badge>
                    <Badge className="bg-green-100 text-green-800">Qualité</Badge>
                    <Badge className="bg-purple-100 text-purple-800">Expertise</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Flame className="h-5 w-5 text-orange-600" />
                    </div>
                    <CardTitle className="text-lg">Streaks</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Maintenez votre activité quotidienne pour accumuler des streaks
                    et débloquer des bonus exclusifs.
                  </p>
                  <div className="space-y-2">
                    <Badge variant="outline">🔥 7 jours</Badge>
                    <Badge variant="outline">🔥 30 jours</Badge>
                    <Badge variant="outline">🔥 100 jours</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}