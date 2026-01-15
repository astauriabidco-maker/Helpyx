import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Suspendre/ractiver une entreprise
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { action, reason } = await request.json();

    if (!['suspend', 'reactivate'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Vérifier si l'entreprise existe
    const existingCompany = await db.company.findUnique({
      where: { id: params.id },
      include: { subscription: true }
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
        where: { id: params.id },
        data: { 
          isActive: !isSuspended,
          ...(isSuspended && { 
            suspendedAt: new Date(),
            suspensionReason: reason || 'Suspended by administrator'
          })
        }
      }),
      db.subscription.update({
        where: { companyId: params.id },
        data: { 
          status: isSuspended ? 'SUSPENDED' : 'ACTIVE'
        }
      })
    ]);

    // Désactiver tous les utilisateurs si suspension
    if (isSuspended) {
      await db.user.updateMany({
        where: { companyId: params.id },
        data: { isActive: false }
      });
    } else {
      // Réactiver uniquement les administrateurs si réactivation
      await db.user.updateMany({
        where: { 
          companyId: params.id,
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