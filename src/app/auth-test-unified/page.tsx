'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, AlertCircle, Shield, Users, Settings, 
  Eye, EyeOff, Key, Zap, ArrowRight
} from 'lucide-react';
import { useUnifiedAuth, useDemoAccounts } from '@/hooks/use-unified-auth';

export default function UnifiedAuthTest() {
  const [showDetails, setShowDetails] = useState(false);
  const { user, login, logout, isLoading, isDemoMode } = useUnifiedAuth();
  const { demoAccounts } = useDemoAccounts();

  const handleDemoLogin = async (role: string) => {
    const account = demoAccounts.find(acc => acc.role === role);
    if (account) {
      await login(account.email, account.password);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Test d'Authentification Unifiée
            </h1>
          </div>
          <p className="text-gray-600">
            Validation du système NextAuth.js unifié avec mode développement intégré
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <Badge className={isDemoMode ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}>
              {isDemoMode ? (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Mode Démo Actif
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mode Production
                </>
              )}
            </Badge>
            
            <Badge variant="outline">
              {isLoading ? "Chargement..." : "Prêt"}
            </Badge>
          </div>
        </div>

        {/* État de l'authentification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>État de l'authentification</span>
            </CardTitle>
            <CardDescription>
              Informations sur la session utilisateur actuelle
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Utilisateur connecté avec succès !
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Informations utilisateur</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">ID:</span> {user.id}</p>
                      <p><span className="font-medium">Nom:</span> {user.name}</p>
                      <p><span className="font-medium">Email:</span> {user.email}</p>
                      <p><span className="font-medium">Rôle:</span> 
                        <Badge className="ml-2" variant="secondary">
                          {user.role}
                        </Badge>
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Métadonnées</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Mode Démo:</span> 
                        <Badge className="ml-2" variant={user.isDemo ? "default" : "secondary"}>
                          {user.isDemo ? "Oui" : "Non"}
                        </Badge>
                      </p>
                      <p><span className="font-medium">Environnement:</span> {user.environment || "Production"}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <Button onClick={logout} variant="destructive">
                    Se déconnecter
                  </Button>
                  <Button 
                    onClick={() => setShowDetails(!showDetails)} 
                    variant="outline"
                  >
                    {showDetails ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    {showDetails ? "Cacher" : "Voir"} les détails
                  </Button>
                </div>
                
                {showDetails && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Détails bruts:</h4>
                    <pre className="text-xs overflow-auto bg-white p-3 rounded border">
                      {JSON.stringify(user, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <Alert className="border-blue-200 bg-blue-50">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Aucun utilisateur connecté
                  </AlertDescription>
                </Alert>
                
                <p className="text-gray-600">
                  Testez la connexion avec les comptes de démonstration ci-dessous.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comptes de démonstration */}
        {isDemoMode && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="w-5 h-5" />
                <span>Comptes de démonstration</span>
              </CardTitle>
              <CardDescription>
                Testez différents rôles avec ces comptes pré-configurés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {demoAccounts.map((account) => (
                  <Card key={account.role} className="border-2 hover:border-blue-300 transition-colors">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <span className="text-2xl">{account.icon}</span>
                        <span>Compte {account.role}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">Email:</span> {account.email}</p>
                        <p><span className="font-medium">MDP:</span> <code className="bg-gray-100 px-1 rounded">password123</code></p>
                      </div>
                      
                      <Button 
                        onClick={() => handleDemoLogin(account.role)}
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? "Connexion..." : (
                          <>
                            Se connecter
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions rapides */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Actions rapides</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                onClick={() => window.location.href = '/auth/signin'} 
                variant="outline"
                className="h-16 flex flex-col items-center space-y-2"
              >
                <Shield className="w-6 h-6" />
                <span>Page de connexion</span>
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/dashboard'} 
                variant="outline"
                className="h-16 flex flex-col items-center space-y-2"
              >
                <Users className="w-6 h-6" />
                <span>Tableau de bord</span>
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/admin'} 
                variant="outline"
                className="h-16 flex flex-col items-center space-y-2"
              >
                <Settings className="w-6 h-6" />
                <span>Administration</span>
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/'} 
                variant="outline"
                className="h-16 flex flex-col items-center space-y-2"
              >
                <ArrowRight className="w-6 h-6" />
                <span>Accueil</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Informations système */}
        <Card>
          <CardHeader>
            <CardTitle>Informations système</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Configuration</h4>
                <div className="space-y-1">
                  <p><span className="font-medium">Node ENV:</span> {process.env.NODE_ENV}</p>
                  <p><span className="font-medium">Vercel ENV:</span> {process.env.VERCEL_ENV || "N/A"}</p>
                  <p><span className="font-medium">NextAuth Secret:</span> {process.env.NEXTAUTH_SECRET ? "✅ Configuré" : "❌ Manquant"}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">OAuth Providers</h4>
                <div className="space-y-1">
                  <p><span className="font-medium">Google:</span> {process.env.GOOGLE_CLIENT_ID ? "✅ Configuré" : "❌ Non configuré"}</p>
                  <p><span className="font-medium">GitHub:</span> {process.env.GITHUB_ID ? "✅ Configuré" : "❌ Non configuré"}</p>
                  <p><span className="font-medium">Azure AD:</span> {process.env.AZURE_AD_CLIENT_ID ? "✅ Configuré" : "❌ Non configuré"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}