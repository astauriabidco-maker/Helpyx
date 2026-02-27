import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireTenant } from '@/lib/tenant';

/**
 * GET /api/ai-behavioral/dashboard
 * 
 * Données du dashboard IA Comportementale :
 * - Profils comportementaux des utilisateurs
 * - Règles d'adaptation actives
 * - Statistiques de sentiment
 */
export async function GET(request: NextRequest) {
    try {
        const [ctx, errorResponse] = await requireTenant();
        if (errorResponse) return errorResponse;
        const { companyId } = ctx;

        // Récupérer les users de la company
        const users = await db.user.findMany({
            where: { companyId },
            select: { id: true, name: true, role: true, image: true },
        });
        const userIds = users.map(u => u.id);
        const userMap = new Map(users.map(u => [u.id, u]));

        // Profils comportementaux
        const profiles = await db.behavioralProfile.findMany({
            where: { userId: { in: userIds } },
        });

        // Adaptations récentes
        const adaptations = await db.behavioralAdaptation.findMany({
            where: { userId: { in: userIds } },
            orderBy: { timestamp: 'desc' },
            take: 20,
        });

        // Sessions récentes
        const sessions = await db.behavioralSession.findMany({
            where: { userId: { in: userIds } },
            orderBy: { startTime: 'desc' },
            take: 15,
        });

        // Règles d'adaptation
        const rules = await db.adaptationRule.findMany({
            orderBy: { priority: 'asc' },
        });

        // Statistiques globales
        const totalProfiles = profiles.length;
        const avgSentiment = profiles.length > 0
            ? Math.round((profiles.reduce((sum, p) => sum + p.sentimentScore, 0) / profiles.length) * 100) / 100
            : 0;
        const totalInteractions = profiles.reduce((sum, p) => sum + p.interactionCount, 0);

        // Distribution des styles
        const styleDistribution: Record<string, number> = {};
        const emotionDistribution: Record<string, number> = {};
        const techDistribution: Record<string, number> = {};

        profiles.forEach(p => {
            styleDistribution[p.userStyle] = (styleDistribution[p.userStyle] || 0) + 1;
            emotionDistribution[p.emotionalState] = (emotionDistribution[p.emotionalState] || 0) + 1;
            techDistribution[p.technicalProficiency] = (techDistribution[p.technicalProficiency] || 0) + 1;
        });

        // Grouper adaptations par userId
        const adaptationsByUser = new Map<string, typeof adaptations>();
        adaptations.forEach(a => {
            if (!adaptationsByUser.has(a.userId)) adaptationsByUser.set(a.userId, []);
            adaptationsByUser.get(a.userId)!.push(a);
        });

        // Grouper sessions par userId
        const sessionsByUser = new Map<string, typeof sessions>();
        sessions.forEach(s => {
            if (!sessionsByUser.has(s.userId)) sessionsByUser.set(s.userId, []);
            sessionsByUser.get(s.userId)!.push(s);
        });

        // Transformer les profils
        const enrichedProfiles = profiles.map(p => {
            const user = userMap.get(p.userId);
            const userAdaptations = adaptationsByUser.get(p.userId) || [];
            const userSessions = sessionsByUser.get(p.userId) || [];
            return {
                id: p.id,
                userId: p.userId,
                userName: user?.name || 'Inconnu',
                userRole: user?.role || 'USER',
                userImage: user?.image,
                style: p.userStyle,
                preferredResponse: p.preferredResponse,
                emotionalState: p.emotionalState,
                communicationStyle: p.communicationStyle,
                technicalLevel: p.technicalProficiency,
                sentimentScore: p.sentimentScore,
                interactionCount: p.interactionCount,
                messageFrequency: p.messageFrequency,
                urgencyLevel: p.urgencyLevel,
                recentAdaptations: userAdaptations.slice(0, 5).map(a => ({
                    id: a.id,
                    ruleName: a.ruleName,
                    triggerType: a.triggerType,
                    actionType: a.actionType,
                    confidence: a.triggerConfidence,
                    effectiveness: a.effectiveness,
                    timestamp: a.timestamp,
                })),
                recentSessions: userSessions.slice(0, 3).map(s => ({
                    id: s.id,
                    messageCount: s.messageCount,
                    avgResponseTime: s.averageResponseTime,
                    adaptationCount: s.adaptationCount,
                    score: s.sessionScore,
                    startTime: s.startTime,
                })),
            };
        });

        return NextResponse.json({
            success: true,
            stats: {
                totalProfiles,
                avgSentiment,
                totalInteractions,
                totalAdaptations: adaptations.length,
                activeRules: rules.filter(r => r.enabled).length,
                avgSuccessRate: rules.length > 0
                    ? Math.round((rules.reduce((sum, r) => sum + r.successRate, 0) / rules.length) * 100)
                    : 0,
            },
            distributions: {
                styles: styleDistribution,
                emotions: emotionDistribution,
                technicalLevels: techDistribution,
            },
            profiles: enrichedProfiles,
            rules: rules.map(r => ({
                id: r.id,
                name: r.name,
                description: r.description,
                triggerType: r.triggerType,
                threshold: r.triggerThreshold,
                actionType: r.actionType,
                priority: r.priority,
                enabled: r.enabled,
                successRate: r.successRate,
                usageCount: r.usageCount,
                lastUsed: r.lastUsed,
            })),
        });

    } catch (error) {
        console.error('AI Behavioral dashboard error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
