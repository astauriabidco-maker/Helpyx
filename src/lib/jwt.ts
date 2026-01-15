import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  name?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class JWTService {
  // Hash le mot de passe
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Vérifie le mot de passe
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Génère un token d'accès
  static generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'techsupport',
      audience: 'techsupport-users'
    });
  }

  // Génère un token de rafraîchissement
  static generateRefreshToken(payload: { userId: string; email: string }): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: 'techsupport',
      audience: 'techsupport-refresh'
    });
  }

  // Génère une paire de tokens
  static generateTokenPair(payload: JWTPayload): TokenPair {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken({
      userId: payload.userId,
      email: payload.email
    });

    return { accessToken, refreshToken };
  }

  // Vérifie un token d'accès
  static verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET, {
        issuer: 'techsupport',
        audience: 'techsupport-users'
      }) as JWTPayload;
    } catch (error) {
      throw new Error('Token d\'accès invalide ou expiré');
    }
  }

  // Vérifie un token de rafraîchissement
  static verifyRefreshToken(token: string): { userId: string; email: string } {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET, {
        issuer: 'techsupport',
        audience: 'techsupport-refresh'
      }) as { userId: string; email: string };
    } catch (error) {
      throw new Error('Token de rafraîchissement invalide ou expiré');
    }
  }

  // Extrait le token du header Authorization
  static extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  // Génère un token aléatoire pour la réinitialisation du mot de passe
  static generateResetToken(): string {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Génère un token pour la vérification email
  static generateEmailToken(): string {
    return this.generateResetToken();
  }
}