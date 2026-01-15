import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { JWTService } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = JWTService.extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'Token d\'accès requis' },
        { status: 401 }
      );
    }

    // Vérifier le token et obtenir l'userId
    const payload = JWTService.verifyAccessToken(token);

    // Supprimer tous les refresh tokens de cet utilisateur
    await db.refreshToken.deleteMany({
      where: { userId: payload.userId }
    });

    return NextResponse.json({
      message: 'Déconnexion réussie',
    });

  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la déconnexion' },
      { status: 401 }
    );
  }
}