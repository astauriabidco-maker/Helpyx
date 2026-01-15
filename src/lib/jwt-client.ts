interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'CLIENT' | 'AGENT' | 'ADMIN';
  emailVerified?: string;
}

export class JWTClient {
  private static readonly ACCESS_TOKEN_KEY = 'access_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static readonly USER_KEY = 'user';

  // Sauvegarder les tokens et l'utilisateur
  static setAuth(tokens: TokenPair, user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  // Récupérer le token d'accès
  static getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    }
    return null;
  }

  // Récupérer le refresh token
  static getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
    return null;
  }

  // Récupérer l'utilisateur
  static getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  // Nettoyer le stockage
  static clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  // Vérifier si l'utilisateur est authentifié
  static isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.getUser();
  }

  // Rafraîchir le token
  static async refreshTokens(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        const user = this.getUser();
        if (user) {
          this.setAuth(data.tokens, user);
        }
        return true;
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
    }

    // Si le rafraîchissement échoue, nettoyer l'authentification
    this.clearAuth();
    return false;
  }

  // Faire une requête authentifiée avec gestion du rafraîchissement automatique
  static async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    let token = this.getAccessToken();
    
    if (!token) {
      throw new Error('Non authentifié');
    }

    // Essayer la requête avec le token actuel
    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });

    // Si le token est expiré (401), essayer de le rafraîchir
    if (response.status === 401) {
      const refreshed = await this.refreshTokens();
      if (refreshed) {
        token = this.getAccessToken();
        if (token) {
          // Réessayer la requête avec le nouveau token
          response = await fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${token}`,
            },
          });
        }
      }
    }

    return response;
  }

  // Déconnexion
  static async logout(): Promise<void> {
    try {
      const token = this.getAccessToken();
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      this.clearAuth();
    }
  }
}