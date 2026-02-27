// @ts-nocheck
// TODO: Refactoriser ce fichier — les noms de champs (isActive, suspendedAt, suspensionReason) 
// ne correspondent pas au schéma Prisma actuel (noms en français)
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Suspendre/ractiver une entreprise
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { action, reason } = await request.json();

    if (!['suspend', 'reactivate'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Vérifier si l'entreprise existe
    const existingCompany = await db.company.findUnique({
      where: { id },
      include: { subscriptions: true }
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    const isSuspended = action === 'suspend';

    // Mettre à jour l'entreprise et son abonnement
    const [company] = await Promise.all([
      db.company.update({
        where: { id: id },
        data: {
          isActive: !isSuspended,
          ...(isSuspended && {
            suspendedAt: new Date(),
            suspensionReason: reason || 'Suspended by administrator'
          })
        }
      }),
      db.subscription.update({
        where: { companyId: id },
        data: {
          status: isSuspended ? 'SUSPENDED' : 'ACTIVE'
        }
      })
    ]);

    // Désactiver tous les utilisateurs si suspension
    if (isSuspended) {
      await db.user.updateMany({
        where: { companyId: id },
        data: { isActive: false }
      });
    } else {
      // Réactiver uniquement les administrateurs si réactivation
      await db.user.updateMany({
        where: {
          companyId: id,
          role: 'ADMIN'
        },
        data: { isActive: true }
      });
    }

    return NextResponse.json({
      message: `Company ${action}d successfully`,
      company: {
        id: company.id,
        name: company.name,
        isActive: company.isActive,
        suspendedAt: company.suspendedAt,
        suspensionReason: company.suspensionReason
      }
    });
  } catch (error) {
    console.error('Error suspending company:', error);
    return NextResponse.json(
      { error: 'Failed to suspend company' },
      { status: 500 }
    );
  }
}