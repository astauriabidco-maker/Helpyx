/**
 * Seed Modules Avancés — Digital Twin, IA Comportementale, Marketplace
 * 
 * Usage: npx tsx prisma/seed-advanced-modules.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAdvancedModules() {
    console.log('🚀 Initialisation des modules avancés...\n');

    // Récupérer la première entreprise et ses agents
    const company = await prisma.company.findFirst();
    if (!company) {
        console.error('❌ Aucune entreprise trouvée. Lancez d\'abord le seed principal.');
        return;
    }

    const agents = await prisma.user.findMany({
        where: { companyId: company.id, role: { in: ['AGENT', 'ADMIN'] } },
    });

    // ============================
    // 1. DIGITAL TWIN — Monitoring Infrastructure
    // ============================
    console.log('🖥️ Digital Twin — Création des équipements...');

    const equipmentData = [
        { name: 'Serveur Principal', type: 'server', model: 'Dell PowerEdge R740', manufacturer: 'Dell', serialNumber: 'SRV-2024-001', location: 'Salle Serveurs', os: 'Windows Server 2022', healthScore: 92 },
        { name: 'Serveur Backup', type: 'server', model: 'HP ProLiant DL380', manufacturer: 'HP', serialNumber: 'SRV-2024-002', location: 'Salle Serveurs', os: 'Ubuntu 22.04 LTS', healthScore: 87 },
        { name: 'PC Direction', type: 'pc', model: 'Dell XPS 15', manufacturer: 'Dell', serialNumber: 'PC-2024-001', location: 'Bureau A101', os: 'Windows 11 Pro', healthScore: 95 },
        { name: 'PC Comptabilité', type: 'pc', model: 'HP EliteDesk 800', manufacturer: 'HP', serialNumber: 'PC-2024-002', location: 'Bureau A102', os: 'Windows 11 Pro', healthScore: 78 },
        { name: 'PC Open Space 1', type: 'pc', model: 'Lenovo ThinkCentre', manufacturer: 'Lenovo', serialNumber: 'PC-2024-003', location: 'Open Space', os: 'Windows 11', healthScore: 65 },
        { name: 'Imprimante Réseau', type: 'printer', model: 'HP LaserJet Pro M404n', manufacturer: 'HP', serialNumber: 'IMP-2024-001', location: 'Open Space', os: 'Firmware v3.2', healthScore: 82 },
        { name: 'Switch Principal', type: 'network', model: 'Cisco Catalyst 2960-X', manufacturer: 'Cisco', serialNumber: 'NET-2024-001', location: 'Salle Serveurs', os: 'IOS 15.2', healthScore: 97 },
        { name: 'Point d\'accès WiFi', type: 'network', model: 'Ubiquiti UniFi AP', manufacturer: 'Ubiquiti', serialNumber: 'NET-2024-002', location: 'Plafond Open Space', os: 'UniFi OS', healthScore: 90 },
    ];

    for (const eq of equipmentData) {
        const status = eq.healthScore > 90 ? 'online' : eq.healthScore > 70 ? 'warning' : eq.healthScore > 50 ? 'warning' : 'critical';

        const twin = await prisma.digitalTwin.upsert({
            where: { equipmentId: `EQ-${eq.serialNumber}` },
            create: {
                equipmentId: `EQ-${eq.serialNumber}`,
                name: eq.name,
                type: eq.type,
                model: eq.model,
                manufacturer: eq.manufacturer,
                serialNumber: eq.serialNumber,
                location: eq.location,
                operatingSystem: eq.os,
                status,
                healthScore: eq.healthScore,
                companyId: company.id,
                userId: agents.length > 0 ? agents[0].id : undefined,
                specifications: JSON.stringify({
                    cpu: eq.type === 'server' ? 'Intel Xeon E5-2690 v4' : eq.type === 'pc' ? 'Intel Core i7-12700K' : 'ARM Cortex-A53',
                    ram: eq.type === 'server' ? '64 GB DDR4 ECC' : eq.type === 'pc' ? '16 GB DDR4' : '4 GB',
                    storage: eq.type === 'server' ? '2 TB SSD RAID' : eq.type === 'pc' ? '512 GB NVMe SSD' : '64 GB',
                    os: eq.os,
                }),
            },
            update: { healthScore: eq.healthScore, status },
        });

        // Données capteurs
        const sensorTypes = ['temperature', 'cpu_usage', 'memory_usage', 'disk_usage'];
        for (const sensorType of sensorTypes) {
            const value = sensorType === 'temperature' ? 40 + Math.random() * 30 :
                Math.floor(20 + Math.random() * 60);
            const sensorStatus = value > 80 ? 'critical' : value > 70 ? 'warning' : 'normal';

            await prisma.sensorData.create({
                data: {
                    equipmentId: twin.id,
                    sensorType,
                    value: Math.round(value * 10) / 10,
                    unit: sensorType === 'temperature' ? '°C' : '%',
                    status: sensorStatus,
                    thresholdMin: 0,
                    thresholdMax: sensorType === 'temperature' ? 75 : 90,
                }
            });
        }

        // Prédictions
        const failureProbability = 100 - eq.healthScore + Math.random() * 15;
        await prisma.prediction.create({
            data: {
                equipmentId: twin.id,
                predictionType: 'failure',
                probability: Math.round(failureProbability),
                timeframe: `${Math.floor(30 + Math.random() * 60)} jours`,
                confidence: Math.round(70 + Math.random() * 25),
                impact: failureProbability > 50 ? 'high' : failureProbability > 30 ? 'medium' : 'low',
                issues: JSON.stringify(
                    eq.healthScore < 80
                        ? ['Composants usés', 'Performance dégradée']
                        : ['Fonctionnement normal']
                ),
                recommendations: JSON.stringify(['Maintenance préventive recommandée']),
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            }
        });
    }

    console.log(`   ✅ ${equipmentData.length} équipements créés avec capteurs et prédictions\n`);

    // ============================
    // 2. IA COMPORTEMENTALE
    // ============================
    console.log('🧠 IA Comportementale — Création des profils...');

    const allUsers = await prisma.user.findMany({ where: { companyId: company.id } });

    for (const user of allUsers) {
        const styles = ['textual', 'visual', 'auditory'];
        const responses = ['detailed', 'quick', 'step-by-step'];
        const emotions = ['neutral', 'satisfied', 'confident'];
        const commStyles = ['formal', 'casual', 'technical'];
        const techLevels = ['beginner', 'intermediate', 'advanced', 'expert'];

        await prisma.behavioralProfile.upsert({
            where: { userId: user.id },
            create: {
                userId: user.id,
                userStyle: styles[Math.floor(Math.random() * styles.length)],
                preferredResponse: responses[Math.floor(Math.random() * responses.length)],
                emotionalState: emotions[Math.floor(Math.random() * emotions.length)],
                communicationStyle: commStyles[Math.floor(Math.random() * commStyles.length)],
                technicalProficiency: user.role === 'ADMIN' ? 'expert' : user.role === 'AGENT' ? 'advanced' : techLevels[Math.floor(Math.random() * techLevels.length)],
                sentimentScore: Math.round((0.3 + Math.random() * 0.7) * 100) / 100,
                interactionCount: Math.floor(Math.random() * 50) + 5,
                messageFrequency: Math.round((0.5 + Math.random() * 2) * 10) / 10,
            },
            update: {},
        });
    }

    // Créer des règles d'adaptation
    const adaptationRules = [
        { name: 'Détection Frustration', description: 'Escalade automatique si frustration détectée', triggerType: 'frustration', triggerThreshold: 0.7, actionType: 'escalate', actionParams: { escalateTo: 'senior_agent', priority: 'high' }, priority: 1 },
        { name: 'Adaptation Débutant', description: 'Réponses simplifiées pour les débutants', triggerType: 'technical_level', triggerThreshold: 0.3, actionType: 'adapt_communication', actionParams: { style: 'simplified', addScreenshots: true }, priority: 3 },
        { name: 'Client Impatient', description: 'Réponses raccourcies pour clients pressés', triggerType: 'urgency', triggerThreshold: 0.8, actionType: 'adapt_communication', actionParams: { style: 'quick', maxLength: 200 }, priority: 2 },
        { name: 'Suggestion KB', description: 'Proposer articles KB pertinents', triggerType: 'learning_style', triggerThreshold: 0.5, actionType: 'provide_resources', actionParams: { source: 'knowledge_base', maxSuggestions: 3 }, priority: 4 },
        { name: 'Analyse Sentiment', description: 'Alerter si sentiment négatif prolongé', triggerType: 'frustration', triggerThreshold: 0.6, actionType: 'escalate', actionParams: { notifyManager: true, reason: 'sentiment_negative' }, priority: 2 },
    ];

    for (const rule of adaptationRules) {
        await prisma.adaptationRule.upsert({
            where: { id: `rule-${rule.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}` },
            create: {
                id: `rule-${rule.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                name: rule.name,
                description: rule.description,
                triggerType: rule.triggerType,
                triggerConditions: { type: rule.triggerType, threshold: rule.triggerThreshold },
                triggerThreshold: rule.triggerThreshold,
                actionType: rule.actionType,
                actionParameters: rule.actionParams,
                priority: rule.priority,
                enabled: true,
                successRate: Math.round((0.6 + Math.random() * 0.35) * 100) / 100,
                usageCount: Math.floor(Math.random() * 100) + 10,
            },
            update: {},
        });
    }

    console.log(`   ✅ ${allUsers.length} profils comportementaux + ${adaptationRules.length} règles d'adaptation\n`);

    // ============================
    // 3. MARKETPLACE
    // ============================
    console.log('🏪 Marketplace — Création des experts et gigs...');

    // Créer des profils experts pour les agents
    for (const agent of agents) {
        const categories = ['SOFTWARE', 'HARDWARE', 'NETWORK', 'SECURITY'];
        const category = categories[Math.floor(Math.random() * categories.length)] as any;

        const expert = await prisma.expert.upsert({
            where: { userId: agent.id },
            create: {
                userId: agent.id,
                bio: `Expert ${category.toLowerCase()} avec ${3 + Math.floor(Math.random() * 10)} ans d'expérience.`,
                category,
                yearsExperience: 3 + Math.floor(Math.random() * 10),
                hourlyRate: 50 + Math.floor(Math.random() * 100),
                minimumGigPrice: 100,
                maximumGigPrice: 2000,
                rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
                totalGigs: Math.floor(Math.random() * 20),
                completedGigs: Math.floor(Math.random() * 15),
                successRate: Math.round((0.8 + Math.random() * 0.2) * 100) / 100,
                earnings: Math.floor(Math.random() * 5000),
                availability: 'available',
                responseTime: 2 + Math.floor(Math.random() * 22),
                location: 'Paris, France',
                isVerified: Math.random() > 0.3,
            },
            update: {},
        });

        // Skills
        const skillSets: Record<string, string[]> = {
            SOFTWARE: ['JavaScript', 'Python', 'Node.js', 'React', 'Docker'],
            HARDWARE: ['Diagnostic PC', 'Réparation carte mère', 'Assemblage', 'Soudure CMS'],
            NETWORK: ['Cisco IOS', 'TCP/IP', 'Firewall', 'VPN', 'WiFi'],
            SECURITY: ['Pentest', 'Audit sécurité', 'Cryptographie', 'SIEM'],
        };

        const skills = skillSets[category] || ['Général'];
        for (const skill of skills.slice(0, 3)) {
            await prisma.expertSkill.upsert({
                where: { id: `skill-${agent.id}-${skill.toLowerCase().replace(/[^a-z0-9]/g, '-')}` },
                create: {
                    id: `skill-${agent.id}-${skill.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                    expertId: expert.id,
                    skill,
                    level: ['INTERMEDIATE', 'ADVANCED', 'EXPERT'][Math.floor(Math.random() * 3)] as any,
                    yearsExperience: 2 + Math.floor(Math.random() * 6),
                    verified: Math.random() > 0.4,
                },
                update: {},
            });
        }

        // Créer un gig par expert
        await prisma.gig.upsert({
            where: { id: `gig-${agent.id}` },
            create: {
                id: `gig-${agent.id}`,
                clientId: agent.id,
                title: `Service ${category.toLowerCase()} — ${agent.name}`,
                description: `Intervention ${category.toLowerCase()} par un expert certifié. Diagnostic, réparation et maintenance.`,
                category: category as any,
                complexity: ['SIMPLE', 'INTERMEDIATE', 'COMPLEX'][Math.floor(Math.random() * 3)] as any,
                price: 100 + Math.floor(Math.random() * 400),
                estimatedDuration: 2 + Math.floor(Math.random() * 6),
                status: 'OPEN' as any,
                tags: JSON.stringify([category.toLowerCase(), 'expert', 'maintenance']),
                remote: Math.random() > 0.5,
                expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            },
            update: {},
        });
    }

    // Stats marketplace
    await prisma.marketplaceStats.upsert({
        where: { id: 'main-stats' },
        create: {
            id: 'main-stats',
            totalExperts: agents.length,
            activeExperts: agents.length,
            totalGigs: agents.length,
            activeGigs: agents.length,
            completedGigs: Math.floor(agents.length * 0.6),
            totalReviews: Math.floor(Math.random() * 20) + 5,
            averageRating: 4.2,
            averageGigPrice: 250,
            totalRevenue: Math.floor(Math.random() * 10000) + 5000,
            monthlyRevenue: Math.floor(Math.random() * 3000) + 1000,
        },
        update: {
            totalExperts: agents.length,
            activeExperts: agents.length,
        },
    });

    console.log(`   ✅ ${agents.length} experts + ${agents.length} gigs + stats marketplace\n`);

    // Résumé
    const dtCount = await prisma.digitalTwin.count();
    const sensorCount = await prisma.sensorData.count();
    const profileCount = await prisma.behavioralProfile.count();
    const ruleCount = await prisma.adaptationRule.count();
    const expertCount = await prisma.expert.count();
    const gigCount = await prisma.gig.count();

    console.log('📊 Résumé:');
    console.log(`   🖥️ Digital Twin: ${dtCount} équipements, ${sensorCount} capteurs`);
    console.log(`   🧠 IA Comportementale: ${profileCount} profils, ${ruleCount} règles`);
    console.log(`   🏪 Marketplace: ${expertCount} experts, ${gigCount} gigs`);
    console.log('\n✅ Modules avancés initialisés avec succès !');
}

seedAdvancedModules()
    .catch((e) => {
        console.error('❌ Erreur:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
