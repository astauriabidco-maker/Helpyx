import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

// Schéma de validation simplifié
const loginSchema = {
  email: (value: string) => {
    if (!value || !value.includes('@')) {
      throw new Error('Email invalide');
    }
    return value;
  },
  password: (value: string) => {
    if (!value || value.length < 1) {
      throw new Error('Le mot de passe est requis');
    }
    return value;
  }
};

export async function GET() {
  return NextResponse.json({
    message: 'API Simple Auth - Use POST method for login',
    availableEndpoints: {
      'POST /api/auth/simple': 'Login with email and password',
      'POST /api/auth/logout': 'Logout user',
      'GET /api/auth/session': 'Get current session'
    },
    note: 'This endpoint only accepts POST requests for login'
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation des données
    const email = loginSchema.email(body.email);
    const password = loginSchema.password(body.password);

    // Rechercher l'utilisateur
    const user = await db.user.findUnique({
      where: { email }
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Vérifier le mot de passe avec bcrypt uniquement - plus de fallback en clair
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: 'Connexion réussie',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      }
    });

  } catch (error) {
    console.error('Login error:', error instanceof Error ? (error as any).message : 'Unknown error');

    return NextResponse.json({
      error: 'Erreur lors de la connexion'
    }, { status: 500 });
  }
}