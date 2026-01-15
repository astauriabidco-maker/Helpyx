import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// Schéma de validation
const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token requis'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des données
    const validatedData = verifyEmailSchema.parse(body);
    const { token } = validatedData;

    // Rechercher l'utilisateur avec le token de vérification
    const user = await db.user.findFirst({
      where: {
        emailToken: token,
        emailTokenExpiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Token de vérification invalide ou expiré' },
        { status: 400 }
      );
    }

    // Marquer l'email comme vérifié
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        emailToken: null,
        emailTokenExpiry: null,
      }
    });

    return NextResponse.json({
      message: 'Email vérifié avec succès !',
    });

  } catch (error) {
    console.error('Erreur lors de la vérification de l\'email:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la vérification de l\'email' },
      { status: 500 }
    );
  }
}