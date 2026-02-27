/**
 * Seed Gamification — Initialiser les achievements et les scores des agents
 * 
 * Ce script:
 * 1. Crée les achievements par défaut
 * 2. Initialise les points/niveaux des agents basés sur leurs vrais tickets
 * 3. Enregistre des activités historiques
 * 4. Crée des entrées dans le leaderboard
 * 
 * Usage: npx tsx prisma/seed-gamification.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Achievements par défaut
const DEFAULT_ACHIEVEMENTS = [
    { name: "Premier Pas", description: "Résoudre votre premier ticket", icon: "🎯", points: 25, category: "QUALITY", target: 1 },
    { name: "Éclair", description: "Résoudre un ticket en moins de 30 minutes", icon: "⚡", points: 50, category: "SPEED", target: 1 },
    { name: "Marathonien", description: "Résoudre 10 tickets au total", icon: "🏃", points: 100, category: "CONSISTENCY", target: 10 },
    { name: "Expert", description: "Résoudre 50 tickets au total", icon: "🧠", points: 250, category: "EXPERTISE", target: 50 },
    { name: "Légende", description: "Résoudre 100 tickets au total", icon: "👑", points: 500, category: "EXPERTISE", target: 100 },
    { name: "Précision", description: "Résoudre 5 tickets sans réouverture", icon: "🎯", points: 75, category: "QUALITY", target: 5 },
    { name: "Satisfaction Client", description: "Obtenir une note de satisfaction de 5/5", icon: "⭐", points: 50, category: "QUALITY", target: 5 },
    { name: "Flamme", description: "Maintenir un streak de 7 jours consécutifs", icon: "🔥", points: 100, category: "CONSISTENCY", target: 7 },
    { name: "Infatigable", description: "Maintenir un streak de 30 jours", icon: "💪", points: 300, category: "CONSISTENCY", target: 30 },
    { name: "Multitâche", description: "Résoudre 5 tickets dans une même journée", icon: "🎪", points: 75, category: "SPEED", target: 5 },
    { name: "Mentor", description: "Ajouter 20 commentaires d'aide sur les tickets", icon: "📝", points: 100, category: "TEAMWORK", target: 20 },
    { name: "Spécialiste Hardware", description: "Résoudre 10 tickets de catégorie Hardware", icon: "🔧", points: 100, category: "EXPERTISE", target: 10 },
    { name: "Spécialiste Réseau", description: "Résoudre 10 tickets de catégorie Réseau", icon: "🌐", points: 100, category: "EXPERTISE", target: 10 },
    { name: "Spécialiste Logiciel", description: "Résoudre 10 tickets de catégorie Logiciel", icon: "💻", points: 100, category: "EXPERTISE", target: 10 },
    { name: "Premier Connexion", description: "Se connecter à la plateforme", icon: "🚀", points: 10, category: "QUALITY", target: 1 },
];

async function seedGamification() {
    console.log('🎮 Initialisation de la gamification...\n');

    // 1. Créer les achievements
    console.log('📌 Création des achievements...');
    for (const achievement of DEFAULT_ACHIEVEMENTS) {
        await prisma.achievement.upsert({
            where: { id: `ach-${achievement.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}` },
            create: {
                id: `ach-${achievement.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                name: achievement.name,
                description: achievement.description,
                icon: achievement.icon,
                points: achievement.points,
                category: achievement.category as any,
                target: achievement.target,
            },
            update: {
                description: achievement.description,
                icon: achievement.icon,
                points: achievement.points,
            },
        });
    }
    console.log(`   ✅ ${DEFAULT_ACHIEVEMENTS.length} achievements créés\n`);

    // 2. Récupérer les agents et admins
    const agents = await prisma.user.findMany({
        where: { role: { in: ['AGENT', 'ADMIN'] } },
        include: {
            assignedTickets: {
                select: {
                    id: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                }
            },
            _count: {
                select: {
                    assignedTickets: true,
                    comments: true,
                }
            }
        }
    });

    console.log(`👤 ${agents.length} agents/admins trouvés\n`);

    // 3. Calculer et attribuer des points basés sur les vrais tickets
    for (const agent of agents) {
        const resolvedTickets = agent.assignedTickets.filter(t =>
            ['REPARÉ', 'FERMÉ'].includes(t.status)
        );

        const totalResolved = resolvedTickets.length;
        const totalComments = agent._count.comments;

        // Calculer les points
        const ticketPoints = totalResolved * 20; // 20 pts par ticket résolu
        const commentPoints = totalComments * 5; // 5 pts par commentaire
        const assignmentPoints = agent._count.assignedTickets * 10; // 10 pts par assignment
        const totalPoints = ticketPoints + commentPoints + assignmentPoints;

        // Calculer le niveau (100 pts par niveau)
        const level = Math.max(1, Math.floor(totalPoints / 100) + 1);

        // Calculer le temps moyen de résolution (en heures)
        let avgResolutionTime = 0;
        if (resolvedTickets.length > 0) {
            const totalTime = resolvedTickets.reduce((sum, t) => {
                return sum + (t.updatedAt.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60);
            }, 0);
            avgResolutionTime = totalTime / resolvedTickets.length;
        }

        // Mettre à jour l'utilisateur
        await prisma.user.update({
            where: { id: agent.id },
            data: {
                points: totalPoints,
                level,
                streak: Math.floor(Math.random() * 5) + 1, // Sim streak 1-5 jours
                totalTicketsResolved: totalResolved,
                avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
                lastActiveAt: new Date(),
            }
        });

        console.log(`   👤 ${agent.name}: ${totalPoints} pts (Niv ${level}) — ${totalResolved} tickets résolus`);

        // 4. Enregistrer des activités pour cet agent
        // Activités pour tickets assignés
        for (const ticket of agent.assignedTickets.slice(0, 5)) {
            await prisma.activity.upsert({
                where: { id: `act-assign-${ticket.id}-${agent.id}` },
                create: {
                    id: `act-assign-${ticket.id}-${agent.id}`,
                    userId: agent.id,
                    type: 'TICKET_ASSIGNED',
                    description: `Ticket #${ticket.id} assigné`,
                    points: 10,
                    createdAt: ticket.createdAt,
                },
                update: {},
            });
        }

        // Activités pour tickets résolus
        for (const ticket of resolvedTickets.slice(0, 5)) {
            await prisma.activity.upsert({
                where: { id: `act-resolve-${ticket.id}-${agent.id}` },
                create: {
                    id: `act-resolve-${ticket.id}-${agent.id}`,
                    userId: agent.id,
                    type: 'TICKET_RESOLVED',
                    description: `Ticket #${ticket.id} résolu`,
                    points: 20,
                    createdAt: ticket.updatedAt,
                },
                update: {},
            });
        }

        // 5. Débloquer les achievements pertinents
        const achievements = await prisma.achievement.findMany();

        for (const achievement of achievements) {
            let shouldUnlock = false;

            if (achievement.name === 'Premier Pas' && totalResolved >= 1) shouldUnlock = true;
            if (achievement.name === 'Marathonien' && totalResolved >= 10) shouldUnlock = true;
            if (achievement.name === 'Premier Connexion') shouldUnlock = true;
            if (achievement.name === 'Mentor' && totalComments >= 20) shouldUnlock = true;

            if (shouldUnlock) {
                await prisma.userAchievement.upsert({
                    where: {
                        userId_achievementId: {
                            userId: agent.id,
                            achievementId: achievement.id,
                        }
                    },
                    create: {
                        userId: agent.id,
                        achievementId: achievement.id,
                        progress: 100,
                    },
                    update: {},
                });
            }
        }

        // 6. Créer/mettre à jour le leaderboard
        await prisma.leaderboard.upsert({
            where: {
                userId_companyId_period: {
                    userId: agent.id,
                    companyId: agent.companyId || '',
                    period: 'all-time',
                }
            },
            create: {
                userId: agent.id,
                companyId: agent.companyId,
                period: 'all-time',
                rank: 0, // Sera calculé après
                points: totalPoints,
                ticketsResolved: totalResolved,
                avgResolutionTime: avgResolutionTime,
            },
            update: {
                points: totalPoints,
                ticketsResolved: totalResolved,
                avgResolutionTime: avgResolutionTime,
            }
        });
    }

    // 7. Recalculer les rangs du leaderboard
    const leaderboardEntries = await prisma.leaderboard.findMany({
        where: { period: 'all-time' },
        orderBy: { points: 'desc' },
    });

    for (let i = 0; i < leaderboardEntries.length; i++) {
        await prisma.leaderboard.update({
            where: { id: leaderboardEntries[i].id },
            data: { rank: i + 1 },
        });
    }

    console.log(`\n🏆 Leaderboard mis à jour (${leaderboardEntries.length} entrées)`);

    // Stats finales
    const totalAchievements = await prisma.achievement.count();
    const totalActivities = await prisma.activity.count();
    const totalUserAchievements = await prisma.userAchievement.count();

    console.log('\n📊 Résumé:');
    console.log(`   🏅 ${totalAchievements} achievements`);
    console.log(`   📋 ${totalActivities} activités`);
    console.log(`   🎖️ ${totalUserAchievements} achievements débloqués`);
    console.log('\n✅ Gamification initialisée avec succès !');
}

seedGamification()
    .catch((e) => {
        console.error('❌ Erreur:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
