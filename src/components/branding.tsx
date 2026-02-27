'use client';

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BrandingConfig {
  companyName: string;
  primaryColor: string;
  secondaryColor: string;
  logo?: string;
  favicon?: string;
}

interface BrandingProviderProps {
  children: ReactNode;
  config: BrandingConfig;
}

const defaultBranding: BrandingConfig = {
  companyName: 'Helpyx',
  primaryColor: '#3b82f6',
  secondaryColor: '#10b981',
};

export function BrandingProvider({ children, config }: BrandingProviderProps) {
  const branding = { ...defaultBranding, ...config };

  // Injecter les couleurs CSS personnalisées
  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', branding.primaryColor);
    root.style.setProperty('--brand-secondary', branding.secondaryColor);

    // Mettre à jour le favicon si fourni
    if (branding.favicon) {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement ||
        document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = branding.favicon;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }, [branding]);

  return <>{children}</>;
}

export function useBranding() {
  return {
    companyName: 'Helpyx', // Peut venir d'un contexte global
    primaryColor: 'var(--brand-primary)',
    secondaryColor: 'var(--brand-secondary)',
  };
}

// Composants thématiques
interface BrandingCardProps {
  children: ReactNode;
  variant?: 'default' | 'branded';
  className?: string;
}

export function BrandingCard({ children, variant = 'default', className }: BrandingCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        variant === 'branded' && "border-l-4 border-l-[var(--brand-primary)]",
        className
      )}
    >
      {children}
    </div>
  );
}

interface BrandingButtonProps {
  children: ReactNode;
  variant?: 'default' | 'branded' | 'outline';
  className?: string;
  onClick?: () => void;
}

export function BrandingButton({
  children,
  variant = 'default',
  className,
  onClick
}: BrandingButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variant === 'default' && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === 'branded' && "bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary)]/90",
        variant === 'outline' && "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        "h-10 px-4 py-2",
        className
      )}
    >
      {children}
    </button>
  );
}