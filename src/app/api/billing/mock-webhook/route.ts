import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const { companyId, planId, sessionId } = await request.json();

        if (!companyId || !planId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const plan = await db.plan.findUnique({ where: { id: planId } });
        if (!plan) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        // Calcul de la période
        const now = new Date();
        const currentPeriodStart = new Date(now);
        const currentPeriodEnd = new Date(now);
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1); // 1 mois par défaut

        // Créer un abonnement simulé
        await db.subscription.create({
            data: {
                companyId: companyId,
                planId: planId,
                statut: 'active',
                stripeSubscriptionId: `sub_mock_${sessionId}`,
                dateDebut: currentPeriodStart,
                dateFin: currentPeriodEnd,
                prixMensuel: plan.prixMensuel,
                limiteUtilisateurs: plan.limiteUtilisateurs,
                autoRenew: true
            }
        });

        // Mettre à jour l'entreprise
        await db.company.update({
            where: { id: companyId },
            data: {
                planAbonnement: plan.slug,
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Mock webhook error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
