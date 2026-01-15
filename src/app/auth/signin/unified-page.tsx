'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, ArrowRight, Eye, EyeOff, Mail, Lock, Shield, Zap, 
  AlertCircle, ArrowLeft, Rocket, Users, Briefcase, Crown, Key,
  Fingerprint, Smartphone, Monitor, Chrome, Github, Building,
  Settings
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useUnifiedAuth, useDemoAccounts } from '@/hooks/use-unified-auth';

export default function UnifiedSignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, isLoading, isDemoMode } = useUnifiedAuth();
  const { demoAccounts } = useDemoAccounts();

  // Afficher un message de succès si l'inscription a réussi
  const message = searchParams.get('message');

  useEffect(() => {
    // Pré-remplir avec le compte démo si demandé
    const demo = searchParams.get('demo');
    if (demo && isDemoMode) {
      const account = demoAccounts.find(acc => acc.role.toLowerCase() === demo.toLowerCase());
      if (account) {
        setEmail(account.email);
        setPassword(account.password);
        setActiveDemo(account.role);
      }
    }
  }, [searchParams, isDemoMode, demoAccounts]);

  // Redirection automatique si déjà connecté
  useEffect(() => {
    if (user) {
      let targetPath = '/dashboard/client';
      
      if (user.role === 'ADMIN') {
        targetPath = '/admin';
      } else if (user.role === 'AGENT') {
        targetPath = '/dashboard/agent';
      }
      
      router.push(targetPath);
    }
  }, [user, router]);

  const handleDemoLogin = (account: typeof demoAccounts[0]) => {
    setEmail(account.email);
    setPassword(account.password);
    setActiveDemo(account.role);
  };

  const handleOAuthSignIn = async (provider: string) => {
    setError('');
    try {
      // Utiliser NextAuth signIn pour OAuth
      const result = await signIn(provider, { callbackUrl: '/' });
      if (result?.error) {
        setError(`Erreur lors de la connexion avec ${provider}`);
      }
    } catch (error) {
      setError(`Erreur lors de la connexion avec ${provider}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await login(email, password);

    if (result.success) {
      // La redirection se fera via le useEffect ci-dessus
      router.refresh();
    } else {
      setError(result.error || 'Email ou mot de passe incorrect');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="absolute top-0 w-full z-10 p-6">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TechSupport Pro
            </span>
          </Link>
          
          <div className="flex items-center space-x-4">
            {isDemoMode && (
              <Badge className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-0">
                <Zap className="w-4 h-4 mr-2" />
                Mode Démo
              </Badge>
            )}
            <span className="text-sm text-gray-600">Pas encore de compte ?</span>
            <Link href="/auth/register">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Essai Gratuit
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center min-h-screen pt-20 pb-12 px-6">
        <div className="w-full max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Section gauche - Informations */}
            <div className="space-y-8">
              <div>
                <Badge className="mb-4 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-0">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Authentification Unifiée
                </Badge>
                <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  Bon retour sur
                  <br />
                  TechSupport Pro
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Connectez-vous avec notre système d'authentification unifié 
                  pour accéder à votre tableau de bord personnel.
                </p>
              </div>

              {/* Comptes de démonstration */}
              {isDemoMode && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Comptes de démonstration</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Mode développement</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Pour tous les comptes ci-dessous, le mot de passe est: <code className="bg-blue-100 px-1 rounded">password123</code>
                    </p>
                  </div>
                  <div className="grid gap-3">
                    {demoAccounts.map((account) => (
                      <div
                        key={account.role}
                        className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                          activeDemo === account.role
                            ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleDemoLogin(account)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${account.color} flex items-center justify-center text-white text-lg`}>
                              {account.icon}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">Compte {account.role}</h4>
                              <p className="text-sm text-gray-600">{account.email}</p>
                            </div>
                          </div>
                          <Key className="w-4 h-4 text-gray-400" />
                        </div>
                        {activeDemo === account.role && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Avantages sécurité */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Sécurité & Performance</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: <Shield className="w-5 h-5" />, text: "NextAuth.js sécurisé" },
                    { icon: <Fingerprint className="w-5 h-5" />, text: "Sessions JWT" },
                    { icon: <Smartphone className="w-5 h-5" />, text: "OAuth multi-fournisseurs" },
                    { icon: <Monitor className="w-5 h-5" />, text: "Mode démo intégré" }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg flex items-center justify-center text-green-600">
                        {feature.icon}
                      </div>
                      <span className="text-sm text-gray-700">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section droite - Formulaire */}
            <div className="w-full max-w-md mx-auto">
              <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Connexion Unifiée</CardTitle>
                  <CardDescription>
                    Accédez à votre espace avec NextAuth.js
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Message de succès */}
                  {message === 'inscription-reussie' && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Inscription réussie ! Vous pouvez maintenant vous connecter.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Message d'erreur */}
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email professionnel</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="jean@entreprise.com"
                          className="pl-10 h-12"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Mot de passe</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Entrez votre mot de passe"
                          className="pl-10 pr-10 h-12"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="remember" 
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        />
                        <Label htmlFor="remember" className="text-sm text-gray-600">
                          Se souvenir de moi
                        </Label>
                      </div>
                      <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
                        Mot de passe oublié ?
                      </Link>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Ou continuer avec</span>
                    </div>
                  </div>

                  {/* Boutons de connexion sociale */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleOAuthSignIn('google')}
                      className="h-12"
                    >
                      <Chrome className="w-4 h-4 mr-2" />
                      Google
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleOAuthSignIn('github')}
                      className="h-12"
                    >
                      <Github className="w-4 h-4 mr-2" />
                      GitHub
                    </Button>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Pas encore de compte ?{' '}
                      <Link href="/auth/register" className="text-blue-600 hover:underline font-medium">
                        Créer un compte
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}