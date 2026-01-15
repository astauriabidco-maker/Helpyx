'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'CLIENT' | 'AGENT' | 'ADMIN';
}

interface SimpleSessionContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

export const SimpleSessionContext = createContext<SimpleSessionContextType | undefined>(undefined);

export function SimpleSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier la session au chargement
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Vérifier si nous sommes en environnement Preview (Vercel)
        const isPreviewEnvironment = 
          window.location.hostname.includes('vercel.app') && 
          window.location.hostname !== 'localhost' &&
          window.location.hostname !== '127.0.0.1';

        // En environnement Preview, injecter un utilisateur de développement automatiquement
        if (isPreviewEnvironment) {
          console.log('🚀 Environnement Preview détecté - Injection utilisateur automatique');
          const devUser: User = {
            id: 'dev-user-preview',
            name: 'Utilisateur Preview',
            email: 'preview@dev.local',
            role: 'CLIENT'
          };
          setUser(devUser);
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/auth/simple', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error('Erreur vérification session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Vérifier si nous sommes en environnement Preview
      const isPreviewEnvironment = 
        typeof window !== 'undefined' &&
        window.location.hostname.includes('vercel.app') && 
        window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1';

      // En environnement Preview, accepter n'importe quel login
      if (isPreviewEnvironment) {
        console.log('🚀 Login Preview - Acceptation automatique');
        const devUser: User = {
          id: 'dev-user-preview',
          name: 'Utilisateur Preview',
          email: email || 'preview@dev.local',
          role: 'CLIENT'
        };
        setUser(devUser);
        return { success: true };
      }

      const response = await fetch('/api/auth/simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Erreur de connexion' };
      }
    } catch (error) {
      console.error('Erreur connexion:', error);
      return { success: false, error: 'Erreur réseau' };
    }
  };

  const logout = async () => {
    try {
      // Vérifier si nous sommes en environnement Preview
      const isPreviewEnvironment = 
        typeof window !== 'undefined' &&
        window.location.hostname.includes('vercel.app') && 
        window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1';

      if (!isPreviewEnvironment) {
        await fetch('/api/auth/simple', {
          method: 'DELETE',
          credentials: 'include',
        });
      } else {
        console.log('🚀 Logout Preview - Déconnexion locale uniquement');
      }
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <SimpleSessionContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </SimpleSessionContext.Provider>
  );
}

export function useSimpleSession() {
  const context = useContext(SimpleSessionContext);
  if (context === undefined) {
    throw new Error('useSimpleSession must be used within a SimpleSessionProvider');
  }
  return context;
}