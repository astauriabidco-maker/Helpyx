import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/warranty?serialNumber=xxx   — Vérifier la garantie par numéro de série
 * GET /api/warranty?clientId=xxx       — Garanties d'un client
 * GET /api/warranty?inventoryId=xxx    — Garantie d'un équipement
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const serialNumber = searchParams.get('serialNumber');
        const clientId = searchParams.get('clientId');
        const inventoryId = searchParams.get('inventoryId');

        // Recherche par numéro de série
        if (serialNumber) {
            const equipment = await db.clientEquipment.findFirst({
                where: { numeroSerie: serialNumber },
                include: {
                    client: { select: { id: true, name: true, email: true } },
                    inventory: { select: { id: true, nom: true, reference: true, marque: true, modele: true, grade: true } },
                },
            });

            if (!equipment) {
                return NextResponse.json({ found: false, message: 'Aucun équipement trouvé avec ce numéro de série' });
            }

            const now = new Date();
            const isUnderWarranty = equipment.finGarantie ? now < equipment.finGarantie : false;
            const daysRemaining = equipment.finGarantie
                ? Math.ceil((equipment.finGarantie.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                : 0;

            return NextResponse.json({
                found: true,
                equipment: {
                    ...equipment,
                    warranty: {
                        isUnderWarranty,
                        daysRemaining: Math.max(0, daysRemaining),
                        startDate: equipment.debutGarantie,
                        endDate: equipment.finGarantie,
                        duration: equipment.dureeGarantieMois,
                        extended: equipment.garantieEtendue,
                        status: isUnderWarranty ? '✅ Sous garantie' : '❌ Garantie expirée',
                    },
                },
            });
        }

        // Équipements d'un client
        if (clientId) {
            const equipments = await db.clientEquipment.findMany({
                where: { clientId },
                include: {
                    inventory: { select: { id: true, nom: true, reference: true, marque: true, modele: true, grade: true, categorie: true } },
                    rmas: { select: { id: true, reference: true, status: true } },
                },
                orderBy: { dateVente: 'desc' },
            });

            const now = new Date();
            const result = equipments.map(eq => ({
                ...eq,
                warranty: {
                    isUnderWarranty: eq.finGarantie ? now < eq.finGarantie : false,
                    daysRemaining: eq.finGarantie ? Math.max(0, Math.ceil((eq.finGarantie.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0,
                    endDate: eq.finGarantie,
                },
            }));

            return NextResponse.json({ equipments: result });
        }

        // Garantie d'un équipement spécifique
        if (inventoryId) {
            const sales = await db.clientEquipment.findMany({
                where: { inventoryId },
                include: {
                    client: { select: { id: true, name: true, email: true } },
                },
                orderBy: { dateVente: 'desc' },
            });

            return NextResponse.json({ sales });
        }

        return NextResponse.json({ error: 'Paramètre requis: serialNumber, clientId ou inventoryId' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
