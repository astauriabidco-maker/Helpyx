import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { JWTService } from '@/lib/jwt';
import { z } from 'zod';

// Schéma de validation
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requis'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des données
    const validatedData = resetPasswordSchema.parse(body);
    const { token, password } = validatedData;

    // Rechercher l'utilisateur avec le token de réinitialisation
    const user = await db.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Token de réinitialisation invalide ou expiré' },
        { status: 400 }
      );
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await JWTService.hashPassword(password);

    // Mettre à jour l'utilisateur
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      }
    });

    // Supprimer tous les refresh tokens existants pour forcer la reconnexion
    await db.refreshToken.deleteMany({
      where: { userId: user.id }
    });

    return NextResponse.json({
      message: 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.',
    });

  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la réinitialisation du mot de passe' },
      { status: 500 }
    );
  }
}