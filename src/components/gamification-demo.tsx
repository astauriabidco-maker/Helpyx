'use client';

import React, { useState } from 'react';
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
  Gamepad2
} from 'lucide-react';
import { GamificationProfile } from '@/components/gamification/gamification-profile';
import { Leaderboard } from '@/components/gamification/leaderboard';
import { AvailableAchievements } from '@/components/gamification/available-achievements';

export default function GamificationDemo() {
  const [demoUserId] = useState('demo-agent-001');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
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

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Agents Actifs</p>
                  <p className="text-3xl font-bold text-slate-900">87%</p>
                  <p className="text-xs text-green-600">+12% ce mois</p>
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
                  <p className="text-3xl font-bold text-slate-900">1,247</p>
                  <p className="text-xs text-green-600">+23% ce mois</p>
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
                  <p className="text-3xl font-bold text-slate-900">4.8/5</p>
                  <p className="text-xs text-green-600">+0.3 ce mois</p>
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
                  <p className="text-3xl font-bold text-slate-900">92%</p>
                  <p className="text-xs text-green-600">+8% ce mois</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Flame className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-50 rounded-full -mr-10 -mt-10"></div>
          </Card>
        </div>

        {/* Onglets de démonstration */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Profil Agent
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

          {/* Profil de gamification */}
          <TabsContent value="profile">
            <GamificationProfile userId={demoUserId} />
          </TabsContent>

          {/* Leaderboard */}
          <TabsContent value="leaderboard">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Leaderboard userId={demoUserId} />
              <Leaderboard userId={demoUserId} />
            </div>
          </TabsContent>

          {/* Achievements */}
          <TabsContent value="achievements">
            <AvailableAchievements userId={demoUserId} />
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
                    <Badge variant="outline">+5 pts</Badge>
                    <Badge variant="outline">+20 pts</Badge>
                    <Badge variant="outline">+50 pts</Badge>
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
                    <Badge className="bg-yellow-100 text-yellow-800">Vitesse</Badge>
                    <Badge className="bg-purple-100 text-purple-800">Qualité</Badge>
                    <Badge className="bg-blue-100 text-blue-800">Expertise</Badge>
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

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Crown className="h-5 w-5 text-purple-600" />
                    </div>
                    <CardTitle className="text-lg">Niveaux</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Progressez à travers différents niveaux en accumulant 
                    des points et en améliorant vos compétences.
                  </p>
                  <div className="space-y-2">
                    <Badge variant="outline">Niv. 1: Débutant</Badge>
                    <Badge variant="outline">Niv. 10: Expert</Badge>
                    <Badge variant="outline">Niv. 50: Légende</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Gift className="h-5 w-5 text-red-600" />
                    </div>
                    <CardTitle className="text-lg">Bonus Quotidiens</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Connectez-vous chaque jour pour réclamer des bonus 
                    et maintenir votre engagement.
                  </p>
                  <div className="space-y-2">
                    <Badge variant="outline">+25 pts/jour</Badge>
                    <Badge variant="outline">Bonus streak</Badge>
                    <Badge variant="outline">Récompenses</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">Classement</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Comparez vos performances avec celles de vos collègues 
                    et visez le sommet du classement.
                  </p>
                  <div className="space-y-2">
                    <Badge variant="outline">Top 10</Badge>
                    <Badge variant="outline">Mensuel</Badge>
                    <Badge variant="outline">Tous le temps</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Métriques d'impact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Impact sur la Performance
                </CardTitle>
                <CardDescription>
                  Résultats observés après l'implémentation de la gamification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">+40%</div>
                    <p className="text-sm text-gray-600">Productivité</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">+35%</div>
                    <p className="text-sm text-gray-600">Engagement</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">+25%</div>
                    <p className="text-sm text-gray-600">Satisfaction</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">-30%</div>
                    <p className="text-sm text-gray-600">Turnover</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}