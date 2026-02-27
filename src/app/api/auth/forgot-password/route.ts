import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { JWTService } from '@/lib/jwt';
import { EmailService } from '@/lib/email';
import { z } from 'zod';

// Schéma de validation
const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des données
    const validatedData = forgotPasswordSchema.parse(body);
    const { email } = validatedData;

    // Rechercher l'utilisateur
    const user = await db.user.findUnique({
      where: { email }
    });

    // Toujours retourner un succès pour éviter l'énumération d'emails
    if (!user) {
      return NextResponse.json({
        message: 'Si un compte avec cet email existe, un email de réinitialisation a été envoyé.',
      });
    }

    // Générer un token de réinitialisation
    const resetToken = JWTService.generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    // Mettre à jour l'utilisateur avec le token
    await db.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      }
    });

    // Envoyer l'email de réinitialisation
    try {
      await EmailService.sendPasswordResetEmail(email, resetToken, user.name || undefined);
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', emailError);
      // On ne fait pas échouer la requête si l'email échoue
    }

    return NextResponse.json({
      message: 'Si un compte avec cet email existe, un email de réinitialisation a été envoyé.',
    });

  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la demande de réinitialisation' },
      { status: 500 }
    );
  }
}