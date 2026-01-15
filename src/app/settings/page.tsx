'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Headphones, 
  Shield, 
  Settings as SettingsIcon, 
  ArrowRight,
  CheckCircle,
  UserCircle,
  Bell,
  Lock,
  Database,
  BarChart3,
  Users,
  TrendingUp
} from 'lucide-react';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      const role = session?.user?.role?.toLowerCase();
      switch (role) {
        case 'admin':
          router.push('/settings/admin');
          break;
        case 'agent':
          router.push('/settings/agent');
          break;
        case 'user':
          router.push('/settings/user');
          break;
        default:
          router.push('/settings/user');
      }
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  const userRole = session?.user?.role?.toLowerCase();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Paramètres du compte
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Choisissez vos paramètres ci-dessous
          </p>
          <Badge variant="outline" className="mt-4">
            Connecté en tant que: {session?.user?.role}
          </Badge>
        </div>

        {/* Cartes des paramètres */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Paramètres Utilisateur */}
          <Card className={`hover:shadow-lg transition-all cursor-pointer ${
            userRole === 'user' ? 'ring-2 ring-primary' : ''
          }`}
                onClick={() => router.push('/settings/user')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <User className="h-8 w-8 text-blue-500" />
                {userRole === 'user' && <CheckCircle className="h-5 w-5 text-green-500" />}
              </div>
              <CardTitle>Paramètres Utilisateur</CardTitle>
              <CardDescription>
                Gérez votre profil et préférences personnelles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <UserCircle className="h-4 w-4" />
                  <span>Profil personnel</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <span>Sécurité</span>
                </div>
                <Button className="w-full mt-4" variant={userRole === 'user' ? 'default' : 'outline'}>
                  Accéder
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Paramètres Agent */}
          <Card className={`hover:shadow-lg transition-all cursor-pointer ${
            userRole === 'agent' ? 'ring-2 ring-primary' : ''
          }`}
                onClick={() => router.push('/settings/agent')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Headphones className="h-8 w-8 text-green-500" />
                {userRole === 'agent' && <CheckCircle className="h-5 w-5 text-green-500" />}
              </div>
              <CardTitle>Paramètres Agent</CardTitle>
              <CardDescription>
                Configurez vos préférences de travail et performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <UserCircle className="h-4 w-4" />
                  <span>Profil professionnel</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <SettingsIcon className="h-4 w-4" />
                  <span>Paramètres de travail</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>Performance</span>
                </div>
                <Button className="w-full mt-4" variant={userRole === 'agent' ? 'default' : 'outline'}>
                  Accéder
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Paramètres Administrateur */}
          <Card className={`hover:shadow-lg transition-all cursor-pointer ${
            userRole === 'admin' ? 'ring-2 ring-primary' : ''
          }`}
                onClick={() => router.push('/settings/admin')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Shield className="h-8 w-8 text-red-500" />
                {userRole === 'admin' && <CheckCircle className="h-5 w-5 text-green-500" />}
              </div>
              <CardTitle>Paramètres Admin</CardTitle>
              <CardDescription>
                Administration système et configuration globale
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Database className="h-4 w-4" />
                  <span>Configuration système</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Sécurité globale</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Gestion utilisateurs</span>
                </div>
                <Button className="w-full mt-4" variant={userRole === 'admin' ? 'default' : 'outline'}>
                  Accéder
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>
              Accédez rapidement à vos fonctionnalités principales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => router.push(getDashboardPath())}
              >
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => router.push('/tickets')}
              >
                <SettingsIcon className="h-4 w-4" />
                Tickets
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => window.location.href = '/welcome'}
              >
                <ArrowRight className="h-4 w-4" />
                Retour à l'accueil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  function getDashboardPath() {
    const role = session?.user?.role?.toLowerCase();
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
  }
}