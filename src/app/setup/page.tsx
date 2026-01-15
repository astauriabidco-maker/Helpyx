'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Users, Ticket, ArrowRight } from 'lucide-react';

interface SetupResult {
  message: string;
  results: Array<{
    action: string;
    user?: string;
    item?: string;
  }>;
}

export default function Setup() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SetupResult | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSetup = async () => {
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Une erreur est survenue');
      }
    } catch (error) {
      setError('Impossible de contacter le serveur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Users className="w-6 h-6" />
            Configuration SAV
          </CardTitle>
          <CardDescription>
            Initialisez le système avec des données de démonstration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!result && (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  Cette configuration va créer :
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• 3 comptes utilisateurs (Client, Agent, Admin)</li>
                    <li>• 3 tickets de démonstration</li>
                    <li>• Données pour tester le dashboard</li>
                  </ul>
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={handleSetup} 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Configuration en cours...' : 'Initialiser le système'}
              </Button>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {result.message}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Comptes créés :</h4>
                <div className="space-y-1 text-sm bg-muted p-3 rounded">
                  <p><strong>Client :</strong> client@exemple.com / password123</p>
                  <p><strong>Agent :</strong> agent@exemple.com / password123</p>
                  <p><strong>Admin :</strong> admin@exemple.com / password123</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Détails :</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  {result.results.map((item, index) => (
                    <p key={index}>
                      • {item.action === 'created' ? '✅' : 'ℹ️'} {' '}
                      {item.user ? `Utilisateur ${item.user}` : item.item || 'Élément'}
                    </p>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => router.push('/auth/signin')} 
                  className="flex-1"
                >
                  Aller à la connexion
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setResult(null)}
                >
                  Reconfigurer
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}