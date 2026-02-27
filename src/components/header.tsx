'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NotificationDropdown } from '@/components/ui/notification-dropdown';
import {
  BarChart3,
  LogOut,
  Settings,
  User,
  HelpCircle,
  Bell,
  Moon,
  Sun,
  Play,
  Shield
} from 'lucide-react';

interface HeaderProps {
  companyName?: string;
  logo?: string;
}

export function Header({ companyName = "Helpyx", logo }: HeaderProps) {
  const { user, isLoading, logout } = useUnifiedAuth();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const canManageTickets = user?.role === 'AGENT' || user?.role === 'ADMIN';
  const isSuperAdmin = user?.role === 'ADMIN' || user?.email === 'admin@platform.com';
  const userInitial = user?.name?.charAt(0).toUpperCase() || 'U';

  const getDashboardPath = () => {
    const role = user?.role?.toLowerCase();
    switch (role) {
      case 'admin':
        return '/dashboard/admin';
      case 'agent':
        return '/dashboard/agent';
      case 'user':
        return '/dashboard/user';
      default:
        return '/dashboard/user';
    }
  };

  const getSettingsPath = () => {
    const role = user?.role?.toLowerCase();
    switch (role) {
      case 'admin':
        return '/settings/admin';
      case 'agent':
        return '/settings/agent';
      case 'user':
        return '/settings/user';
      default:
        return '/settings/user';
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/welcome');
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Logique de changement de thème à implémenter
    document.documentElement.classList.toggle('dark');
  };

  if (isLoading || !user) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        {/* Logo et Nom de l'entreprise */}
        <div className="flex items-center gap-4">
          {logo ? (
            <img
              src={logo}
              alt={`${companyName} logo`}
              className="h-8 w-8 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              {companyName.charAt(0)}
            </div>
          )}
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-foreground">
              {companyName} SAV
            </h1>
            <p className="text-xs text-muted-foreground">
              Support Client
            </p>
          </div>

          {canManageTickets && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(getDashboardPath())}
              className="hidden sm:flex"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          )}
        </div>

        {/* Actions rapides */}
        <div className="flex items-center gap-2">
          {/* Toggle thème */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="hidden sm:flex"
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Notifications */}
          <NotificationDropdown />

          {/* Menu utilisateur */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
              {/* Infos utilisateur */}
              <div className="flex items-center justify-start gap-3 p-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user.name}</p>
                  <p className="w-[180px] truncate text-sm text-muted-foreground">
                    {user.email}
                  </p>
                  <Badge variant="secondary" className="w-fit text-xs">
                    {user.role}
                  </Badge>
                </div>
              </div>

              {/* Séparateur */}
              <div className="border-t px-2 py-1.5">
                <p className="text-xs font-medium text-muted-foreground px-2">
                  Menu
                </p>
              </div>

              {/* Actions */}
              <DropdownMenuItem onClick={() => router.push(getDashboardPath())} className="cursor-pointer">
                <BarChart3 className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </DropdownMenuItem>

              {isSuperAdmin && (
                <DropdownMenuItem onClick={() => router.push('/admin')} className="cursor-pointer">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Administration Globale</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuItem onClick={() => router.push('/tickets/demo')} className="cursor-pointer">
                <Play className="mr-2 h-4 w-4" />
                <span>Démo Formulaire</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => router.push(getSettingsPath())} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="cursor-pointer">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Aide</span>
              </DropdownMenuItem>

              {/* Séparateur */}
              <div className="border-t px-2 py-1.5">
                <p className="text-xs font-medium text-muted-foreground px-2">
                  Session
                </p>
              </div>

              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}