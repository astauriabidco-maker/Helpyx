'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, User, Shield, Settings, ArrowRight } from 'lucide-react'

export default function TestRedirectionPage() {
  const router = useRouter()
  const [testResults, setTestResults] = useState<string[]>([])

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testRedirection = async (email: string, expectedRole: string, expectedPath: string) => {
    addResult(`🧪 Test de connexion pour ${email} (rôle: ${expectedRole})`)
    
    try {
      const response = await fetch('/api/auth/simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email, 
          password: 'password123' 
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        addResult(`✅ Connexion réussie - Rôle: ${data.user.role}`)
        
        if (data.user.role === expectedRole) {
          addResult(`✅ Rôle correct - Redirection vers ${expectedPath}`)
          
          // Test de redirection
          setTimeout(() => {
            router.push(expectedPath)
          }, 1000)
        } else {
          addResult(`❌ Rôle incorrect: attendu ${expectedRole}, reçu ${data.user.role}`)
        }
      } else {
        addResult(`❌ Échec de connexion: ${data.error}`)
      }
    } catch (error) {
      addResult(`❌ Erreur réseau: ${error}`)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test de Redirection Dashboard Admin
          </h1>
          <p className="text-gray-600">
            Vérification du système de redirection selon les rôles utilisateurs
          </p>
        </div>

        {/* Cartes de test */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Carte Admin */}
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                <CardTitle className="text-purple-900">Admin</CardTitle>
                <Badge variant="secondary" className="bg-purple-200 text-purple-800">
                  ADMIN
                </Badge>
              </div>
              <CardDescription>
                Accès complet à l'administration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-mono bg-white p-2 rounded border">
                    admin@test.com
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Redirection vers /admin
                  </p>
                </div>
                <Button 
                  onClick={() => testRedirection('admin@test.com', 'ADMIN', '/admin')}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <User className="w-4 h-4 mr-2" />
                  Tester Admin
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Carte Agent */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-blue-900">Agent</CardTitle>
                <Badge variant="secondary" className="bg-blue-200 text-blue-800">
                  AGENT
                </Badge>
              </div>
              <CardDescription>
                Gestion des tickets et support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-mono bg-white p-2 rounded border">
                    agent@test.com
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Redirection vers /dashboard/agent
                  </p>
                </div>
                <Button 
                  onClick={() => testRedirection('agent@test.com', 'AGENT', '/dashboard/agent')}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <User className="w-4 h-4 mr-2" />
                  Tester Agent
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Carte Client */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-green-600" />
                <CardTitle className="text-green-900">Client</CardTitle>
                <Badge variant="secondary" className="bg-green-200 text-green-800">
                  CLIENT
                </Badge>
              </div>
              <CardDescription>
                Suivi des tickets personnels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-mono bg-white p-2 rounded border">
                    client@test.com
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Redirection vers /dashboard/client
                  </p>
                </div>
                <Button 
                  onClick={() => testRedirection('client@test.com', 'CLIENT', '/dashboard/client')}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <User className="w-4 h-4 mr-2" />
                  Tester Client
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Résultats des tests */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Résultats des tests</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearResults}
                disabled={testResults.length === 0}
              >
                Effacer
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
              {testResults.length === 0 ? (
                <div className="text-gray-500">
                  Cliquez sur les boutons ci-dessus pour tester les redirections...
                </div>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="mb-1">
                    {result}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <div className="flex justify-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowRight className="w-4 h-4 mr-2" />
              Test redirection directe
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="outline">
              <Shield className="w-4 h-4 mr-2" />
              Accès direct admin
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline">
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}