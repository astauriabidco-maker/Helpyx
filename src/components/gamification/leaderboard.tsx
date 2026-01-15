'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Trophy, 
  Medal, 
  Crown,
  Star,
  TrendingUp,
  Users
} from 'lucide-react';

interface LeaderboardUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  points: number;
  level: number;
  totalTicketsResolved: number;
  avgResolutionTime: number;
}

interface LeaderboardProps {
  userId?: string;
  showPeriodSelector?: boolean;
}

export function Leaderboard({ userId, showPeriodSelector = true }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all-time'>('all-time');
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/gamification/leaderboard?userId=${userId}&period=${period}`);
      const data = await response.json();
      
      setLeaderboard(data.leaderboard || []);
      
      // Trouver le rang de l'utilisateur
      if (userId) {
        const userIndex = data.leaderboard?.findIndex((user: LeaderboardUser) => user.id === userId);
        setUserRank(userIndex !== -1 ? userIndex + 1 : null);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-orange-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (rank === 2) return 'bg-gray-100 text-gray-800 border-gray-200';
    if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'daily': return 'Aujourd\'hui';
      case 'weekly': return 'Cette semaine';
      case 'monthly': return 'Ce mois';
      case 'all-time': return 'Tous le temps';
      default: return period;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Classement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border rounded-lg animate-pulse">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
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
            <Trophy className="h-5 w-5" />
            Classement {getPeriodLabel(period)}
          </CardTitle>
          {showPeriodSelector && (
            <div className="flex gap-1">
              {(['daily', 'weekly', 'monthly', 'all-time'] as const).map((p) => (
                <Button
                  key={p}
                  variant={period === p ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod(p)}
                >
                  {getPeriodLabel(p)}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun utilisateur dans le classement pour cette période</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((user, index) => {
              const isCurrentUser = user.id === userId;
              const rank = index + 1;
              
              return (
                <div
                  key={user.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    isCurrentUser 
                      ? 'bg-blue-50 border-blue-200 shadow-sm' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center w-10">
                    {getRankIcon(rank)}
                  </div>

                  {/* Avatar */}
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.image} alt={user.name} />
                    <AvatarFallback>
                      {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  {/* User info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {user.name || user.email}
                      </p>
                      {isCurrentUser && (
                        <Badge variant="outline" className="text-xs">
                          Vous
                        </Badge>
                      )}
                      <Badge className={getRankBadgeColor(rank)}>
                        #{rank}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        Niv. {user.level}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {user.totalTicketsResolved} tickets
                      </span>
                      {user.avgResolutionTime > 0 && (
                        <span>{user.avgResolutionTime}m avg</span>
                      )}
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-right">
                    <p className="font-bold text-lg text-blue-600">
                      {user.points.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">points</p>
                  </div>
                </div>
              );
            })}

            {/* User rank if not in top */}
            {userId && userRank && userRank > 10 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center justify-center w-10">
                    <span className="text-lg font-bold text-blue-600">#{userRank}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-blue-800">Votre position</p>
                    <p className="text-sm text-blue-600">
                      Continuez à progresser pour atteindre le top 10!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}