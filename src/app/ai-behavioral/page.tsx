'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Brain,
    Users,
    Activity,
    TrendingUp,
    Smile,
    Frown,
    Meh,
    MessageSquare,
    Shield,
    Zap,
    Target,
    Settings,
    RefreshCw,
    Loader2,
    CheckCircle,
    AlertTriangle,
    Eye,
    BarChart3,
} from 'lucide-react';

interface Profile {
    id: string;
    userId: string;
    userName: string;
    userRole: string;
    style: string;
    preferredResponse: string;
    emotionalState: string;
    communicationStyle: string;
    technicalLevel: string;
    sentimentScore: number;
    interactionCount: number;
    messageFrequency: number;
    urgencyLevel: string;
    recentAdaptations: any[];
    recentSessions: any[];
}

interface Rule {
    id: string;
    name: string;
    description: string;
    triggerType: string;
    threshold: number;
    actionType: string;
    priority: number;
    enabled: boolean;
    successRate: number;
    usageCount: number;
    lastUsed: string | null;
}

interface DashboardData {
    stats: {
        totalProfiles: number;
        avgSentiment: number;
        totalInteractions: number;
        totalAdaptations: number;
        activeRules: number;
        avgSuccessRate: number;
    };
    distributions: {
        styles: Record<string, number>;
        emotions: Record<string, number>;
        technicalLevels: Record<string, number>;
    };
    profiles: Profile[];
    rules: Rule[];
}

export default function AIBehavioralPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/ai-behavioral/dashboard');
            if (!response.ok) throw new Error('Failed to fetch');
            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error('Error fetching AI behavioral data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getSentimentIcon = (score: number) => {
        if (score >= 0.7) return <Smile className="h-4 w-4 text-green-500" />;
        if (score >= 0.4) return <Meh className="h-4 w-4 text-amber-500" />;
        return <Frown className="h-4 w-4 text-red-500" />;
    };

    const getSentimentColor = (score: number) => {
        if (score >= 0.7) return 'text-green-600';
        if (score >= 0.4) return 'text-amber-600';
        return 'text-red-600';
    };

    const getStyleBadge = (style: string) => {
        const colors: Record<string, string> = {
            textual: 'bg-blue-100 text-blue-800',
            visual: 'bg-purple-100 text-purple-800',
            auditory: 'bg-green-100 text-green-800',
        };
        return colors[style] || 'bg-gray-100 text-gray-800';
    };

    const getTechBadge = (level: string) => {
        const colors: Record<string, string> = {
            beginner: 'bg-green-100 text-green-800',
            intermediate: 'bg-blue-100 text-blue-800',
            advanced: 'bg-purple-100 text-purple-800',
            expert: 'bg-red-100 text-red-800',
        };
        return colors[level] || 'bg-gray-100 text-gray-800';
    };

    const getTriggerIcon = (type: string) => {
        switch (type) {
            case 'frustration': return <Frown className="h-4 w-4 text-red-500" />;
            case 'urgency': return <Zap className="h-4 w-4 text-amber-500" />;
            case 'learning_style': return <Eye className="h-4 w-4 text-blue-500" />;
            case 'technical_level': return <Target className="h-4 w-4 text-purple-500" />;
            default: return <Settings className="h-4 w-4 text-gray-500" />;
        }
    };

    if (loading) {
        return (
            <AppShell>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <Loader2 className="h-10 w-10 animate-spin text-purple-600 mx-auto mb-4" />
                        <p className="text-slate-600">Analyse des profils comportementaux...</p>
                    </div>
                </div>
            </AppShell>
        );
    }

    if (!data) {
        return (
            <AppShell>
                <div className="text-center py-20">
                    <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune donnée disponible</p>
                    <Button onClick={fetchData} className="mt-4">Réessayer</Button>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <Brain className="h-7 w-7 text-purple-600" />
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                IA Comportementale
                            </h1>
                        </div>
                        <p className="text-slate-500 mt-1">
                            Analyse de sentiment, suggestions automatiques et adaptation intelligente
                        </p>
                    </div>
                    <Button onClick={fetchData} variant="outline" className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Actualiser
                    </Button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <Card className="p-4">
                        <div className="flex items-center gap-2 text-purple-600 mb-2">
                            <Users className="h-4 w-4" />
                            <span className="text-xs font-medium">Profils</span>
                        </div>
                        <p className="text-2xl font-bold">{data.stats.totalProfiles}</p>
                        <p className="text-xs text-gray-500">analysés</p>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            {getSentimentIcon(data.stats.avgSentiment)}
                            <span className="text-xs font-medium">Sentiment Moyen</span>
                        </div>
                        <p className={`text-2xl font-bold ${getSentimentColor(data.stats.avgSentiment)}`}>
                            {Math.round(data.stats.avgSentiment * 100)}%
                        </p>
                        <p className="text-xs text-gray-500">positif</p>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                            <MessageSquare className="h-4 w-4" />
                            <span className="text-xs font-medium">Interactions</span>
                        </div>
                        <p className="text-2xl font-bold">{data.stats.totalInteractions}</p>
                        <p className="text-xs text-gray-500">total</p>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center gap-2 text-amber-600 mb-2">
                            <Zap className="h-4 w-4" />
                            <span className="text-xs font-medium">Adaptations</span>
                        </div>
                        <p className="text-2xl font-bold">{data.stats.totalAdaptations}</p>
                        <p className="text-xs text-gray-500">déclenchées</p>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center gap-2 text-green-600 mb-2">
                            <Shield className="h-4 w-4" />
                            <span className="text-xs font-medium">Règles Actives</span>
                        </div>
                        <p className="text-2xl font-bold">{data.stats.activeRules}</p>
                        <p className="text-xs text-gray-500">en service</p>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center gap-2 text-emerald-600 mb-2">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-xs font-medium">Taux Succès</span>
                        </div>
                        <p className="text-2xl font-bold">{data.stats.avgSuccessRate}%</p>
                        <p className="text-xs text-gray-500">moyen</p>
                    </Card>
                </div>

                <Tabs defaultValue="profiles" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="profiles" className="flex items-center gap-2">
                            <Users className="h-4 w-4" /> Profils Utilisateurs
                        </TabsTrigger>
                        <TabsTrigger value="rules" className="flex items-center gap-2">
                            <Shield className="h-4 w-4" /> Règles d'Adaptation
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" /> Analytiques
                        </TabsTrigger>
                    </TabsList>

                    {/* Profils */}
                    <TabsContent value="profiles" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {data.profiles.map(profile => (
                                <Card
                                    key={profile.id}
                                    className={`cursor-pointer transition-all hover:shadow-lg ${selectedProfile?.id === profile.id ? 'ring-2 ring-purple-500' : ''
                                        }`}
                                    onClick={() => setSelectedProfile(
                                        selectedProfile?.id === profile.id ? null : profile
                                    )}
                                >
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">
                                                    {profile.userName.charAt(0)}
                                                </div>
                                                <div>
                                                    <CardTitle className="text-sm">{profile.userName}</CardTitle>
                                                    <p className="text-xs text-gray-500">{profile.userRole}</p>
                                                </div>
                                            </div>
                                            {getSentimentIcon(profile.sentimentScore)}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex flex-wrap gap-1">
                                            <Badge className={getStyleBadge(profile.style)}>{profile.style}</Badge>
                                            <Badge className={getTechBadge(profile.technicalLevel)}>{profile.technicalLevel}</Badge>
                                            <Badge variant="outline">{profile.communicationStyle}</Badge>
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-500">Sentiment</span>
                                                <span className={getSentimentColor(profile.sentimentScore)}>
                                                    {Math.round(profile.sentimentScore * 100)}%
                                                </span>
                                            </div>
                                            <Progress value={profile.sentimentScore * 100} className="h-1.5" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <span className="text-gray-500">Interactions</span>
                                                <p className="font-semibold">{profile.interactionCount}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Fréq. messages</span>
                                                <p className="font-semibold">{profile.messageFrequency}/min</p>
                                            </div>
                                        </div>

                                        {selectedProfile?.id === profile.id && profile.recentAdaptations.length > 0 && (
                                            <div className="pt-2 border-t">
                                                <p className="text-xs font-semibold text-gray-500 mb-1">Dernières adaptations:</p>
                                                {profile.recentAdaptations.map(a => (
                                                    <div key={a.id} className="text-xs flex items-center gap-1 py-0.5">
                                                        {getTriggerIcon(a.triggerType)}
                                                        <span>{a.ruleName}</span>
                                                        <Badge variant="outline" className="ml-auto text-[10px]">
                                                            {Math.round(a.effectiveness * 100)}%
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Règles */}
                    <TabsContent value="rules" className="space-y-4">
                        <div className="space-y-3">
                            {data.rules.map(rule => (
                                <Card key={rule.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {getTriggerIcon(rule.triggerType)}
                                                <div>
                                                    <h3 className="font-semibold text-sm">{rule.name}</h3>
                                                    <p className="text-xs text-gray-500">{rule.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right text-xs">
                                                    <p className="text-gray-500">Utilisation</p>
                                                    <p className="font-bold">{rule.usageCount}×</p>
                                                </div>
                                                <div className="text-right text-xs">
                                                    <p className="text-gray-500">Succès</p>
                                                    <p className="font-bold text-green-600">{Math.round(rule.successRate * 100)}%</p>
                                                </div>
                                                <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                                                    {rule.enabled ? (
                                                        <><CheckCircle className="h-3 w-3 mr-1" /> Active</>
                                                    ) : (
                                                        <><AlertTriangle className="h-3 w-3 mr-1" /> Inactive</>
                                                    )}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                                            <span>Trigger: <Badge variant="outline">{rule.triggerType}</Badge></span>
                                            <span>Seuil: {Math.round(rule.threshold * 100)}%</span>
                                            <span>Action: <Badge variant="outline">{rule.actionType}</Badge></span>
                                            <span>Priorité: #{rule.priority}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Analytics */}
                    <TabsContent value="analytics" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            {/* Style Distribution */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Eye className="h-4 w-4" /> Styles d'apprentissage
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {Object.entries(data.distributions.styles).map(([style, count]) => (
                                        <div key={style} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge className={getStyleBadge(style)}>{style}</Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Progress
                                                    value={(count / data.stats.totalProfiles) * 100}
                                                    className="w-24 h-2"
                                                />
                                                <span className="text-sm font-semibold w-8 text-right">{count}</span>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Emotion Distribution */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Smile className="h-4 w-4" /> États émotionnels
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {Object.entries(data.distributions.emotions).map(([emotion, count]) => {
                                        const icon = emotion === 'satisfied' ? '😊' : emotion === 'confident' ? '💪' : '😐';
                                        return (
                                            <div key={emotion} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span>{icon}</span>
                                                    <span className="text-sm capitalize">{emotion}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Progress
                                                        value={(count / data.stats.totalProfiles) * 100}
                                                        className="w-24 h-2"
                                                    />
                                                    <span className="text-sm font-semibold w-8 text-right">{count}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>

                            {/* Tech Level Distribution */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Target className="h-4 w-4" /> Niveaux techniques
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {Object.entries(data.distributions.technicalLevels).map(([level, count]) => (
                                        <div key={level} className="flex items-center justify-between">
                                            <Badge className={getTechBadge(level)}>{level}</Badge>
                                            <div className="flex items-center gap-2">
                                                <Progress
                                                    value={(count / data.stats.totalProfiles) * 100}
                                                    className="w-24 h-2"
                                                />
                                                <span className="text-sm font-semibold w-8 text-right">{count}</span>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppShell>
    );
}
