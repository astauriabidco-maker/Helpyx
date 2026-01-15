'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'CLIENT' | 'AGENT' | 'ADMIN';
  isDemo?: boolean;
  environment?: string;
}

interface UnifiedSessionContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  isDemoMode: boolean;
}

export function useUnifiedAuth(): UnifiedSessionContextType {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  
  // Détection du mode démo
  const isDemoMode = session?.user?.isDemo || false;
  
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      
      if (result?.error) {
        return { success: false, error: 'Email ou mot de passe incorrect' };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Erreur lors de la connexion' };
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    user: session?.user as User || null,
    login,
    logout,
    isLoading: status === 'loading' || isLoading,
    isDemoMode,
  };
}

// Hook pour les comptes démo
export function useDemoAccounts() {
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  useEffect(() => {
    // Vérifier si nous sommes en environnement de développement/preview
    const isDev = process.env.NODE_ENV === 'development';
    const isPreview = process.env.VERCEL_ENV === 'preview';
    setIsDemoMode(isDev || isPreview);
  }, []);
  
  const demoAccounts = [
    {
      role: 'Client',
      email: 'client@exemple.com',
      password: 'password123',
      icon: '👤',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      role: 'Agent',
      email: 'agent@exemple.com',
      password: 'password123',
      icon: '🎯',
      color: 'from-purple-500 to-pink-600'
    },
    {
      role: 'Admin',
      email: 'admin@exemple.com',
      password: 'password123',
      icon: '👑',
      color: 'from-amber-500 to-orange-600'
    }
  ];
  
  return { demoAccounts, isDemoMode };
}