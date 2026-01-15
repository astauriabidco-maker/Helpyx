import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { JWTService } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token requis' },
        { status: 400 }
      );
    }

    // Vérifier le refresh token
    const payload = JWTService.verifyRefreshToken(refreshToken);

    // Vérifier que le token existe en base et n'est pas expiré
    const storedToken = await db.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Refresh token invalide ou expiré' },
        { status: 401 }
      );
    }

    // Générer une nouvelle paire de tokens
    const newTokens = JWTService.generateTokenPair({
      userId: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
      name: storedToken.user.name || undefined,
    });

    // Supprimer l'ancien refresh token
    await db.refreshToken.delete({
      where: { id: storedToken.id }
    });

    // Sauvegarder le nouveau refresh token
    await db.refreshToken.create({
      data: {
        token: newTokens.refreshToken,
        userId: storedToken.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      }
    });

    return NextResponse.json({
      tokens: newTokens,
    });

  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token:', error);
    return NextResponse.json(
      { error: 'Erreur lors du rafraîchissement du token' },
      { status: 401 }
    );
  }
}