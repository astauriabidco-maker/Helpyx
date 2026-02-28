import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/client-equipment — Enregistrer une vente (lier client ↔ équipement)
 * GET  /api/client-equipment?clientId=xxx — Lister les achats d'un client
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            clientId,
            inventoryId,
            prixVendu,
            numeroFacture,
            canal,
            dureeGarantieMois = 12,
            garantieEtendue = false,
            numeroSerie,
            notes,
        } = body;

        if (!clientId || !inventoryId) {
            return NextResponse.json({ error: 'clientId et inventoryId requis' }, { status: 400 });
        }

        // Calculer la date de fin de garantie
        const debutGarantie = new Date();
        const finGarantie = new Date();
        finGarantie.setMonth(finGarantie.getMonth() + dureeGarantieMois);

        // Créer le lien client ↔ équipement
        const sale = await db.clientEquipment.create({
            data: {
                clientId,
                inventoryId,
                prixVendu,
                numeroFacture,
                canal,
                debutGarantie,
                finGarantie,
                dureeGarantieMois,
                garantieEtendue,
                numeroSerie,
                notes,
            },
            include: {
                client: { select: { name: true, email: true } },
                inventory: { select: { nom: true, reference: true, marque: true, modele: true } },
            },
        });

        // Mettre à jour le statut de l'inventaire
        await db.inventory.update({
            where: { id: inventoryId },
            data: {
                statut: 'vendu',
                quantite: { decrement: 1 },
            },
        });

        return NextResponse.json({
            success: true,
            sale,
            warranty: {
                startDate: debutGarantie,
                endDate: finGarantie,
                duration: `${dureeGarantieMois} mois`,
                extended: garantieEtendue,
            },
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get('clientId');

        if (!clientId) {
            return NextResponse.json({ error: 'clientId requis' }, { status: 400 });
        }

        const equipments = await db.clientEquipment.findMany({
            where: { clientId },
            include: {
                inventory: {
                    select: {
                        id: true, nom: true, reference: true, marque: true,
                        modele: true, grade: true, categorie: true,
                        processeur: true, ram: true, stockage: true, ecran: true,
                    },
                },
                rmas: {
                    select: { id: true, reference: true, status: true, motif: true, createdAt: true },
                    orderBy: { createdAt: 'desc' },
                },
            },
            orderBy: { dateVente: 'desc' },
        });

        const now = new Date();
        const result = equipments.map(eq => {
            const isUnderWarranty = eq.finGarantie ? now < eq.finGarantie : false;
            const daysRemaining = eq.finGarantie
                ? Math.max(0, Math.ceil((eq.finGarantie.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
                : 0;

            return {
                ...eq,
                warranty: {
                    isUnderWarranty,
                    daysRemaining,
                    status: isUnderWarranty
                        ? daysRemaining <= 30
                            ? `⚠️ Expire dans ${daysRemaining} jours`
                            : `✅ Sous garantie (${daysRemaining}j restants)`
                        : '❌ Garantie expirée',
                },
            };
        });

        return NextResponse.json({
            client: clientId,
            totalEquipments: result.length,
            underWarranty: result.filter(e => e.warranty.isUnderWarranty).length,
            expired: result.filter(e => !e.warranty.isUnderWarranty).length,
            equipments: result,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
