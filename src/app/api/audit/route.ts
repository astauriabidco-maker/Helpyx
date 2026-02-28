import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ============================================================
//  Poids pour le calcul du score global
// ============================================================
const COMPONENT_WEIGHTS: Record<string, number> = {
    CPU: 15,
    RAM: 15,
    SSD: 20,
    HDD: 20,
    BATTERY: 20,
    SCREEN: 10,
    GPU: 5,
    NETWORK: 5,
    KEYBOARD: 3,
    TOUCHPAD: 3,
    USB: 2,
    WEBCAM: 1,
    AUDIO: 1,
    FAN: 5,
};

function calculateGlobalScore(components: { composant: string; score: number }[]): { score: number; verdict: string } {
    if (components.length === 0) return { score: 0, verdict: 'non_teste' };

    let totalWeight = 0;
    let weightedSum = 0;

    for (const comp of components) {
        const weight = COMPONENT_WEIGHTS[comp.composant] || 5;
        totalWeight += weight;
        weightedSum += comp.score * weight;
    }

    const score = Math.round(weightedSum / totalWeight);
    let verdict: string;

    if (score >= 90) verdict = 'excellent';
    else if (score >= 70) verdict = 'bon';
    else if (score >= 50) verdict = 'correct';
    else if (score >= 30) verdict = 'attention';
    else verdict = 'critique';

    return { score, verdict };
}

function getComponentStatus(score: number): string {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'bon';
    if (score >= 50) return 'correct';
    if (score >= 30) return 'attention';
    return 'critique';
}

/**
 * POST /api/audit — Créer un audit matériel complet
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            inventoryId,
            companyId,
            hostname,
            fabricant,
            modele,
            numeroSerie,
            biosVersion,
            os,
            osVersion,
            architecture,
            uptime,
            auditeurId,
            auditeurNom,
            notes,
            components, // Array of component data
        } = body;

        if (!companyId) {
            return NextResponse.json({ error: 'companyId requis' }, { status: 400 });
        }

        // Calculer les scores et statuts par composant
        const processedComponents = (components || []).map((comp: any) => ({
            ...comp,
            status: getComponentStatus(comp.score || 0),
        }));

        // Calculer le score global
        const { score: scoreGlobal, verdict } = calculateGlobalScore(processedComponents);

        // Créer l'audit avec tous les composants
        const audit = await db.hardwareAudit.create({
            data: {
                inventoryId,
                companyId,
                hostname,
                fabricant,
                modele,
                numeroSerie,
                biosVersion,
                os,
                osVersion,
                architecture,
                uptime,
                scoreGlobal,
                verdict,
                auditeurId,
                auditeurNom,
                notes,
                components: {
                    create: processedComponents,
                },
            },
            include: {
                components: true,
            },
        });

        // Si inventoryId fourni, mettre à jour l'inventaire avec la date de test
        if (inventoryId) {
            await db.inventory.update({
                where: { id: inventoryId },
                data: {
                    dateTestQualite: new Date(),
                    testeePar: auditeurNom || 'Agent Helpyx',
                    notesTest: `Score: ${scoreGlobal}/100 — ${verdict}`,
                },
            }).catch(() => { }); // Silently fail if inventory doesn't exist
        }

        return NextResponse.json({
            success: true,
            audit: {
                id: audit.id,
                scoreGlobal,
                verdict,
                verdictEmoji: getVerdictEmoji(verdict),
                machine: `${fabricant || ''} ${modele || ''}`.trim() || hostname || 'Machine inconnue',
                components: audit.components.map(c => ({
                    composant: c.composant,
                    nom: c.nom,
                    score: c.score,
                    status: c.status,
                    statusEmoji: getStatusEmoji(c.status),
                })),
                createdAt: audit.createdAt,
            },
        });
    } catch (error: any) {
        console.error('[Audit] Erreur:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * GET /api/audit — Lister les audits ou obtenir un audit spécifique
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const inventoryId = searchParams.get('inventoryId');
        const companyId = searchParams.get('companyId');
        const numeroSerie = searchParams.get('serialNumber');

        // Audit spécifique par ID
        if (id) {
            const audit = await db.hardwareAudit.findUnique({
                where: { id },
                include: { components: true },
            });

            if (!audit) {
                return NextResponse.json({ error: 'Audit non trouvé' }, { status: 404 });
            }

            return NextResponse.json({ audit: formatAuditResponse(audit) });
        }

        // Audits par numéro de série
        if (numeroSerie) {
            const audits = await db.hardwareAudit.findMany({
                where: { numeroSerie },
                include: { components: true },
                orderBy: { createdAt: 'desc' },
                take: 5,
            });

            return NextResponse.json({
                serialNumber: numeroSerie,
                totalAudits: audits.length,
                audits: audits.map(formatAuditResponse),
            });
        }

        // Audits d'un équipement
        if (inventoryId) {
            const audits = await db.hardwareAudit.findMany({
                where: { inventoryId },
                include: { components: true },
                orderBy: { createdAt: 'desc' },
            });

            return NextResponse.json({
                inventoryId,
                totalAudits: audits.length,
                latestScore: audits[0]?.scoreGlobal || 0,
                latestVerdict: audits[0]?.verdict || 'non_teste',
                audits: audits.map(formatAuditResponse),
            });
        }

        // Tous les audits d'une company
        const where: any = {};
        if (companyId) where.companyId = companyId;

        const audits = await db.hardwareAudit.findMany({
            where,
            include: { components: true },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        // Stats globales
        const stats = {
            totalAudits: audits.length,
            scoreMoyen: audits.length > 0 ? Math.round(audits.reduce((s, a) => s + a.scoreGlobal, 0) / audits.length) : 0,
            excellent: audits.filter(a => a.verdict === 'excellent').length,
            bon: audits.filter(a => a.verdict === 'bon').length,
            correct: audits.filter(a => a.verdict === 'correct').length,
            attention: audits.filter(a => a.verdict === 'attention').length,
            critique: audits.filter(a => a.verdict === 'critique').length,
        };

        return NextResponse.json({
            stats,
            audits: audits.map(formatAuditResponse),
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ============================================================
//  Helpers
// ============================================================

function formatAuditResponse(audit: any) {
    return {
        id: audit.id,
        machine: {
            hostname: audit.hostname,
            fabricant: audit.fabricant,
            modele: audit.modele,
            numeroSerie: audit.numeroSerie,
            os: audit.os,
            label: `${audit.fabricant || ''} ${audit.modele || ''}`.trim() || audit.hostname || 'Inconnu',
        },
        scoreGlobal: audit.scoreGlobal,
        verdict: audit.verdict,
        verdictEmoji: getVerdictEmoji(audit.verdict),
        auditeur: audit.auditeurNom,
        notes: audit.notes,
        components: audit.components.map((c: any) => ({
            composant: c.composant,
            nom: c.nom,
            score: c.score,
            status: c.status,
            statusEmoji: getStatusEmoji(c.status),
            details: getComponentDetails(c),
        })),
        createdAt: audit.createdAt,
    };
}

function getComponentDetails(comp: any): Record<string, any> {
    const details: Record<string, any> = {};

    switch (comp.composant) {
        case 'CPU':
            if (comp.cpuModel) details['Modèle'] = comp.cpuModel;
            if (comp.cpuCores) details['Cœurs'] = `${comp.cpuCores} cœurs / ${comp.cpuThreads} threads`;
            if (comp.cpuFreqBase) details['Fréquence'] = `${comp.cpuFreqBase} GHz (max ${comp.cpuFreqMax} GHz)`;
            if (comp.cpuTemperature) details['Température'] = `${comp.cpuTemperature}°C`;
            break;
        case 'RAM':
            if (comp.ramTotal) details['Capacité'] = `${comp.ramTotal} Go ${comp.ramType || ''}`;
            if (comp.ramSpeed) details['Vitesse'] = `${comp.ramSpeed} MHz`;
            if (comp.ramSlots) details['Slots'] = `${comp.ramSlotsUsed}/${comp.ramSlots} utilisés`;
            if (comp.ramErrors > 0) details['⚠️ Erreurs'] = comp.ramErrors;
            break;
        case 'SSD':
        case 'HDD':
            if (comp.storageTotal) details['Capacité'] = `${comp.storageTotal} Go (${comp.storageType})`;
            if (comp.storageHealth != null) details['Santé SMART'] = `${comp.storageHealth}%`;
            if (comp.storageTBW) details['TBW'] = `${comp.storageTBW} To écrits`;
            if (comp.storageReadSpeed) details['Lecture'] = `${comp.storageReadSpeed} Mo/s`;
            if (comp.storageWriteSpeed) details['Écriture'] = `${comp.storageWriteSpeed} Mo/s`;
            if (comp.storageBadSectors && comp.storageBadSectors > 0) details['⚠️ Secteurs défectueux'] = comp.storageBadSectors;
            break;
        case 'BATTERY':
            if (comp.batteryHealth != null) details['Santé'] = `${comp.batteryHealth}%`;
            if (comp.batteryCycles != null) details['Cycles'] = comp.batteryCycles;
            if (comp.batteryCapacity && comp.batteryActual) details['Capacité'] = `${comp.batteryActual} / ${comp.batteryCapacity} mWh`;
            break;
        case 'SCREEN':
            if (comp.screenResolution) details['Résolution'] = comp.screenResolution;
            if (comp.screenSize) details['Taille'] = comp.screenSize;
            if (comp.screenType) details['Type'] = comp.screenType;
            if (comp.screenDeadPixels && comp.screenDeadPixels > 0) details['⚠️ Pixels morts'] = comp.screenDeadPixels;
            break;
        case 'GPU':
            if (comp.gpuModel) details['Modèle'] = comp.gpuModel;
            if (comp.gpuVram) details['VRAM'] = `${comp.gpuVram} Go`;
            break;
        case 'NETWORK':
            if (comp.networkType) details['Type'] = comp.networkType;
            if (comp.networkSpeed) details['Vitesse'] = `${comp.networkSpeed} Mbps`;
            if (comp.networkLatency) details['Latence'] = `${comp.networkLatency} ms`;
            break;
    }

    if (comp.testResult) details['Test'] = comp.testResult;
    if (comp.testDetails) details['Détails'] = comp.testDetails;

    return details;
}

function getVerdictEmoji(verdict: string): string {
    switch (verdict) {
        case 'excellent': return '🟢';
        case 'bon': return '🔵';
        case 'correct': return '🟡';
        case 'attention': return '🟠';
        case 'critique': return '🔴';
        default: return '⚪';
    }
}

function getStatusEmoji(status: string): string {
    switch (status) {
        case 'excellent': return '✅';
        case 'bon': return '👍';
        case 'correct': return '⚠️';
        case 'attention': return '🔶';
        case 'critique': return '🔴';
        default: return '❓';
    }
}
