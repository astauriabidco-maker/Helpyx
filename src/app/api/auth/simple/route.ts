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
    console.log('=== LOGIN DEBUG START ===');
    
    const body = await request.json();
    console.log('Request body:', { email: body.email, passwordLength: body.password?.length });
    
    // Validation des données
    const email = loginSchema.email(body.email);
    const password = loginSchema.password(body.password);
    
    console.log('Validated data:', { email, passwordLength: password.length });

    // Rechercher l'utilisateur
    const user = await db.user.findUnique({
      where: { email }
    });

    console.log('User found:', !!user);
    if (user) {
      console.log('User details:', { 
        id: user.id, 
        name: user.name, 
        role: user.role, 
        hasPassword: !!user.password,
        isActive: user.isActive 
      });
    }

    if (!user) {
      console.log('❌ User not found');
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Vérifier le mot de passe avec bcrypt
    let isPasswordValid = false;
    
    if (user.password) {
      // Utiliser bcrypt pour vérifier le mot de passe hashé
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // Pour compatibilité avec les anciens comptes sans mot de passe hashé
      isPasswordValid = password === 'password123';
    }
    
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Pour l'instant, retourner une réponse simple sans tokens
    console.log('✅ Login successful');
    
    return NextResponse.json({
      message: 'Connexion réussie',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      debug: {
        timestamp: new Date().toISOString(),
        loginMethod: 'simple'
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    
    return NextResponse.json({
      error: 'Erreur lors de la connexion',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}