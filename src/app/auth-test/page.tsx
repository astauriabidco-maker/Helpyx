'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, User, Lock, AlertCircle } from 'lucide-react';

const TEST_ACCOUNTS = [
  {
    email: 'admin@exemple.com',
    password: 'password123',
    role: 'ADMIN',
    name: 'Admin Demo'
  },
  {
    email: 'agent@exemple.com',
    password: 'password123',
    role: 'AGENT',
    name: 'Agent Demo'
  },
  {
    email: 'client@exemple.com',
    password: 'password123',
    role: 'CLIENT',
    name: 'Client Demo'
  },
  {
    email: 'test@company.com',
    password: 'password123',
    role: 'ADMIN',
    name: 'Test User'
  }
];

export default function AuthTestPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        setError(`Erreur de connexion: ${result.error}`);
      } else if (result?.ok) {
        setSuccess('Connexion réussie! Redirection...');
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        setError('Erreur inconnue lors de la connexion');
      }
    } catch (error) {
      setError(`Erreur réseau: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (account: typeof TEST_ACCOUNTS[0]) => {
    setEmail(account.email);
    setPassword(account.password);
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await signIn('credentials', {
        email: account.email,
        password: account.password,
        redirect: false
      });

      if (result?.error) {
        setError(`Erreur de connexion: ${result.error}`);
      } else if (result?.ok) {
        setSuccess(`Connexion réussie en tant que ${account.name}! Redirection...`);
        setTimeout(() => {
          router.push('/');
        }, 1500);
      }
    } catch (error) {
      setError(`Erreur réseau: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    const colors = {
      ADMIN: 'bg-red-100 text-red-800',
      AGENT: 'bg-blue-100 text-blue-800',
      CLIENT: 'bg-green-100 text-green-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">🔐 Test de Connexion</h1>
          <p className="text-muted-foreground">
            Page de test pour vérifier que l'authentification fonctionne correctement
          </p>
        </div>

        {/* Alert Messages */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Manual Login Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Connexion Manuelle
              </CardTitle>
              <CardDescription>
                Testez la connexion avec des identifiants personnalisés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@exemple.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="password123"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? 'Connexion...' : 'Se connecter'}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Info</span>
                </div>
                <p className="text-sm text-blue-700">
                  Le mot de passe universel pour tous les comptes est: <code className="bg-blue-100 px-1 rounded">password123</code>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Login */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Connexion Rapide
              </CardTitle>
              <CardDescription>
                Utilisez les comptes de test prédéfinis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {TEST_ACCOUNTS.map((account) => (
                  <div
                    key={account.email}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium">{account.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {account.email}
                        </div>
                      </div>
                      <Badge className={getRoleColor(account.role)}>
                        {account.role}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => quickLogin(account)}
                      disabled={loading}
                    >
                      Se connecter
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">Note</span>
                </div>
                <p className="text-sm text-amber-700">
                  Ces comptes sont configurés pour le développement. En production, chaque utilisateur aurait son propre mot de passe sécurisé.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Debug Information */}
        <Card>
          <CardHeader>
            <CardTitle>🔍 Informations de Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="env" className="w-full">
              <TabsList>
                <TabsTrigger value="env">Environment</TabsTrigger>
                <TabsTrigger value="auth">Auth Config</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
              </TabsList>
              
              <TabsContent value="env" className="space-y-2">
                <div className="p-3 bg-gray-50 rounded font-mono text-sm">
                  <div>NEXTAUTH_URL: {process.env.NEXTAUTH_URL || 'Non défini'}</div>
                  <div>NEXTAUTH_SECRET: {process.env.NEXTAUTH_SECRET ? '✅ Défini' : '❌ Non défini'}</div>
                  <div>DATABASE_URL: {process.env.DATABASE_URL ? '✅ Défini' : '❌ Non défini'}</div>
                </div>
              </TabsContent>
              
              <TabsContent value="auth" className="space-y-2">
                <div className="p-3 bg-gray-50 rounded text-sm">
                  <div>Provider: Credentials</div>
                  <div>Strategy: JWT</div>
                  <div>Sign-in page: /auth/signin</div>
                  <div>Password validation: password123 (hardcoded)</div>
                </div>
              </TabsContent>
              
              <TabsContent value="users" className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Les utilisateurs disponibles sont listés dans la section "Connexion Rapide" ci-dessus.
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="text-center">
          <Button variant="outline" onClick={() => router.push('/welcome')}>
            ← Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  );
}