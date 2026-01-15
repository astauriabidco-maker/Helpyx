'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Star, 
  Target, 
  Lock,
  CheckCircle,
  Zap,
  Heart,
  Shield,
  Sword,
  Crown
} from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: string;
  target?: number;
}

interface AvailableAchievementsProps {
  userId: string;
}

export function AvailableAchievements({ userId }: AvailableAchievementsProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchAvailableAchievements();
  }, [userId]);

  const fetchAvailableAchievements = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/gamification/achievements?userId=${userId}&type=available`);
      const data = await response.json();
      setAchievements(data.achievements || []);
    } catch (error) {
      console.error('Error fetching available achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'SPEED': return <Zap className="h-4 w-4" />;
      case 'QUALITY': return <Star className="h-4 w-4" />;
      case 'CONSISTENCY': return <Heart className="h-4 w-4" />;
      case 'EXPERTISE': return <Shield className="h-4 w-4" />;
      case 'TEAMWORK': return <Sword className="h-4 w-4" />;
      case 'MILESTONE': return <Crown className="h-4 w-4" />;
      default: return <Trophy className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'SPEED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'QUALITY': return 'bg-green-100 text-green-800 border-green-200';
      case 'CONSISTENCY': return 'bg-red-100 text-red-800 border-red-200';
      case 'EXPERTISE': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'TEAMWORK': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'MILESTONE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyColor = (points: number) => {
    if (points >= 500) return 'bg-red-100 text-red-800';
    if (points >= 200) return 'bg-orange-100 text-orange-800';
    if (points >= 100) return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };

  const getDifficultyLabel = (points: number) => {
    if (points >= 500) return 'Légendaire';
    if (points >= 200) return 'Rare';
    if (points >= 100) return 'Commun';
    return 'Facile';
  };

  const filteredAchievements = achievements.filter(achievement => 
    filter === 'all' || achievement.category === filter
  );

  const categories = Array.from(new Set(achievements.map(a => a.category)));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Achievements à Débloquer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Achievements à Débloquer ({achievements.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Continuez à progresser pour débloquer ces achievements
            </span>
          </div>
        </div>
        
        {/* Filtres par catégorie */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Tous ({achievements.length})
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={filter === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(category)}
              className="flex items-center gap-1"
            >
              {getCategoryIcon(category)}
              {category}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {filteredAchievements.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">
              {filter === 'all' 
                ? 'Félicitations! Vous avez débloqué tous les achievements disponibles!' 
                : `Aucun achievement à débloquer dans la catégorie ${filter}`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="group relative p-4 border rounded-lg hover:shadow-md transition-all duration-200 hover:border-blue-300"
              >
                {/* En-tête */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl opacity-50 group-hover:opacity-100 transition-opacity">
                      {achievement.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {achievement.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getCategoryColor(achievement.category)}>
                          {getCategoryIcon(achievement.category)}
                          {achievement.category}
                        </Badge>
                        <Badge className={getDifficultyColor(achievement.points)}>
                          {getDifficultyLabel(achievement.points)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">+{achievement.points}</p>
                    <p className="text-xs text-gray-500">points</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-3">
                  {achievement.description}
                </p>

                {/* Objectif */}
                {achievement.target && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Progression</span>
                      <span>0 / {achievement.target}</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                )}

                {/* Icône de verrouillage */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>

                {/* Effet de brillance au hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none"></div>
              </div>
            ))}
          </div>
        )}

        {/* Statistiques */}
        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {achievements.filter(a => a.points >= 500).length}
              </p>
              <p className="text-sm text-gray-600">Légendaires</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {achievements.filter(a => a.points >= 200 && a.points < 500).length}
              </p>
              <p className="text-sm text-gray-600">Rares</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {achievements.filter(a => a.points >= 100 && a.points < 200).length}
              </p>
              <p className="text-sm text-gray-600">Communs</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {achievements.filter(a => a.points < 100).length}
              </p>
              <p className="text-sm text-gray-600">Faciles</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}