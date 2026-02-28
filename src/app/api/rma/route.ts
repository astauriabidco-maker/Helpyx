import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/rma — Créer une demande RMA (retour)
 * GET  /api/rma — Lister les RMA (filtres: status, clientId, companyId)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            clientId,
            inventoryId,
            clientEquipmentId,
            ticketId,
            motif,
            categorieMotif,
            description,
            companyId,
        } = body;

        if (!clientId || !inventoryId || !motif || !companyId) {
            return NextResponse.json(
                { error: 'clientId, inventoryId, motif et companyId sont requis' },
                { status: 400 }
            );
        }

        // Générer la référence RMA
        const year = new Date().getFullYear();
        const count = await db.rMA.count({ where: { companyId } });
        const reference = `RMA-${year}-${String(count + 1).padStart(4, '0')}`;

        // Vérifier la garantie si clientEquipmentId fourni
        let sousGarantie = false;
        let dateAchat: Date | null = null;
        let finGarantie: Date | null = null;

        if (clientEquipmentId) {
            const ce = await db.clientEquipment.findUnique({
                where: { id: clientEquipmentId },
            });
            if (ce) {
                dateAchat = ce.dateVente;
                finGarantie = ce.finGarantie;
                sousGarantie = ce.finGarantie ? new Date() < ce.finGarantie : false;
            }
        }

        const rma = await db.rMA.create({
            data: {
                reference,
                clientId,
                inventoryId,
                clientEquipmentId,
                ticketId,
                motif,
                categorieMotif,
                description,
                companyId,
                sousGarantie,
                dateAchat,
                finGarantie,
            },
            include: {
                client: { select: { name: true, email: true } },
                inventory: { select: { nom: true, reference: true, marque: true, modele: true, grade: true } },
            },
        });

        // Mettre à jour le statut de l'inventaire
        await db.inventory.update({
            where: { id: inventoryId },
            data: { statut: 'rma' },
        });

        return NextResponse.json({
            success: true,
            rma,
            warrantyStatus: sousGarantie
                ? '✅ Sous garantie — retour pris en charge'
                : '⚠️ Hors garantie — retour soumis à frais éventuels',
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const clientId = searchParams.get('clientId');
        const companyId = searchParams.get('companyId');

        const where: any = {};
        if (status) where.status = status;
        if (clientId) where.clientId = clientId;
        if (companyId) where.companyId = companyId;

        const rmas = await db.rMA.findMany({
            where,
            include: {
                client: { select: { id: true, name: true, email: true } },
                inventory: { select: { id: true, nom: true, reference: true, marque: true, modele: true, grade: true } },
                clientEquipment: {
                    select: { dateVente: true, numeroSerie: true, finGarantie: true, prixVendu: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Stats
        const stats = {
            total: rmas.length,
            enAttente: rmas.filter(r => ['DEMANDE', 'APPROUVE'].includes(r.status)).length,
            enCours: rmas.filter(r => ['RECU', 'EN_INSPECTION'].includes(r.status)).length,
            resolus: rmas.filter(r => ['REPARE', 'REMPLACEMENT', 'REMBOURSE', 'CLOTURE'].includes(r.status)).length,
            refuses: rmas.filter(r => r.status === 'REFUSE').length,
            sousGarantie: rmas.filter(r => r.sousGarantie).length,
            horsGarantie: rmas.filter(r => !r.sousGarantie).length,
        };

        return NextResponse.json({ stats, rmas });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * PATCH /api/rma — Mettre à jour un RMA (changer statut, ajouter diagnostic, etc.)
 */
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json({ error: 'id requis' }, { status: 400 });
        }

        // Si on clôture le RMA, ajouter la date
        if (updateData.status === 'CLOTURE') {
            updateData.closedAt = new Date();
        }

        // Si décision de remboursement
        if (updateData.decision === 'REMBOURSER') {
            updateData.status = 'REMBOURSE';
        }

        // Si décision de remplacement
        if (updateData.decision === 'REMPLACER') {
            updateData.status = 'REMPLACEMENT';
        }

        // Si réparé
        if (updateData.decision === 'REPARER' && updateData.diagnosticTech) {
            updateData.status = 'REPARE';
        }

        // Si refusé
        if (updateData.decision === 'REFUSER') {
            updateData.status = 'REFUSE';
        }

        const rma = await db.rMA.update({
            where: { id },
            data: updateData,
            include: {
                client: { select: { name: true, email: true } },
                inventory: { select: { nom: true, reference: true, marque: true, modele: true } },
            },
        });

        return NextResponse.json({ success: true, rma });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
