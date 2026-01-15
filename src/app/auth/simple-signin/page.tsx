'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Rocket } from 'lucide-react';

export default function SimpleLoginPage() {
  const [email, setEmail] = useState('admin@test.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [debug, setDebug] = useState<any>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    setDebug(null);

    try {
      console.log('=== CLIENT LOGIN START ===');
      console.log('Sending:', { email, passwordLength: password.length });
      
      const response = await fetch('/api/auth/simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setSuccess('✅ Connexion réussie !');
        setDebug(data.debug);
        
        // Simuler une authentification simple
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isAuthenticated', 'true');
        
        // Rediriger selon le rôle après un délai
        setTimeout(() => {
          switch (data.user.role) {
            case 'ADMIN':
              router.push('/admin');
              break;
            case 'AGENT':
              router.push('/dashboard/agent');
              break;
            default:
              router.push('/dashboard/client');
              break;
          }
        }, 1500);
      } else {
        setError('❌ ' + data.error);
        setDebug(data.details || null);
      }
    } catch (error) {
      console.error('Network error:', error);
      setError('❌ Erreur réseau. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header avec retour */}
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 text-white p-3 rounded-full">
              <Rocket className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">TechSupport - Test</h1>
          <p className="text-gray-600">Connexion simplifiée pour debugging</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Connexion (Debug)</CardTitle>
            <CardDescription>
              Test de connexion avec logs détaillés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Messages */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {/* Champ Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="vous@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Champ Mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
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

              {/* Bouton de connexion */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Connexion...' : 'Se connecter (Debug)'}
              </Button>
            </form>

            {/* Debug info */}
            {debug && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
                <strong>Debug Info:</strong>
                <pre>{JSON.stringify(debug, null, 2)}</pre>
              </div>
            )}

            {/* Infos de connexion de test */}
            <div className="mt-4 p-3 bg-blue-50 rounded text-xs">
              <strong>Comptes de test réels :</strong><br />
              Client: client@test.com / password123<br />
              Agent: agent@test.com / password123<br />
              Admin: admin@test.com / password123
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}