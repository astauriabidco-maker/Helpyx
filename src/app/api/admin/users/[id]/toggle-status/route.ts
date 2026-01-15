import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Activer/désactiver un utilisateur
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { action } = await request.json();

    if (!['activate', 'deactivate'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe
    const existingUser = await db.user.findUnique({
      where: { id: params.id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Mettre à jour le statut
    const isActive = action === 'activate';
    const user = await db.user.update({
      where: { id: params.id },
      data: { isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true
      }
    });

    return NextResponse.json({
      message: `User ${action}d successfully`,
      user
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    return NextResponse.json(
      { error: 'Failed to toggle user status' },
      { status: 500 }
    );
  }
}