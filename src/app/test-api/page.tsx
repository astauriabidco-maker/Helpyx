'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export default function SystemTestPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    const results = [];

    // Test API Tickets
    try {
      const response = await fetch('/api/tickets');
      const data = await response.json();
      results.push({
        name: 'API Tickets',
        status: response.ok ? 'success' : 'error',
        message: response.ok ? `${data.tickets?.length || 0} tickets trouvés` : `Erreur ${response.status}`
      });
    } catch (error) {
      results.push({
        name: 'API Tickets',
        status: 'error',
        message: `Erreur: ${error.message}`
      });
    }

    // Test API Auth Simple
    try {
      const response = await fetch('/api/auth/simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@exemple.com', password: 'password123' })
      });
      const data = await response.json();
      results.push({
        name: 'Auth Simple',
        status: response.ok ? 'success' : 'error',
        message: response.ok ? `Connexion réussie: ${data.user?.name}` : data.error
      });
    } catch (error) {
      results.push({
        name: 'Auth Simple',
        status: 'error',
        message: `Erreur: ${error.message}`
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Page de Test Système</h1>
          <p className="text-gray-600">Tests des composants principaux de l'application</p>
        </div>

        <div className="grid gap-4 mb-8">
          {testResults.map((test, index) => (
            <Card key={index} className={`border-l-4 ${
              test.status === 'success' ? 'border-l-green-500' : 'border-l-red-500'
            }`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  {test.status === 'success' ? 
                    <CheckCircle className="h-5 w-5 text-green-500" /> :
                    <XCircle className="h-5 w-5 text-red-500" />
                  }
                  {test.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{test.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center gap-4 flex flex-col sm:flex-row justify-center items-center">
          <Button onClick={runTests} disabled={isRunning} className="w-full sm:w-auto">
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Tests en cours...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Relancer les tests
              </>
            )}
          </Button>
          
          <div className="flex gap-2 flex-wrap justify-center">
            <Button variant="outline" onClick={() => window.location.href = '/auth/simple-signin'}>
              Test Connexion
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Accueil
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/admin'}>
              Admin
            </Button>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">📋 Informations de test:</h3>
          <div className="text-sm space-y-1">
            <p><strong>Comptes disponibles:</strong></p>
            <p>• Admin: admin@exemple.com / password123</p>
            <p>• Agent: agent@exemple.com / password123</p>
            <p>• Client: client@exemple.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}