'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, User, Settings, ArrowRight, CheckCircle, XCircle } from 'lucide-react'

export default function SimpleTestPage() {
  const router = useRouter()
  const [testResults, setTestResults] = useState<string[]>([])

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const simulateLogin = (email: string, role: string, redirectPath: string) => {
    addResult(`🧪 Simulation connexion pour ${email} (rôle: ${role})`)
    
    // Simuler une connexion en stockant dans localStorage
    const mockUser = {
      id: 'mock-id',
      email: email,
      name: email.split('@')[0],
      role: role
    }
    
    localStorage.setItem('user', JSON.stringify(mockUser))
    localStorage.setItem('isAuthenticated', 'true')
    
    addResult(`✅ Utilisateur simulé et stocké dans localStorage`)
    addResult(`📍 Redirection manuelle vers ${redirectPath}`)
    
    // Redirection directe
    setTimeout(() => {
      router.push(redirectPath)
    }, 1000)
  }

  const clearStorage = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('isAuthenticated')
    setTestResults([])
    addResult(`🗑️ localStorage nettoyé`)
  }

  const checkStorage = () => {
    const user = localStorage.getItem('user')
    const isAuthenticated = localStorage.getItem('isAuthenticated')
    
    addResult(`📊 Vérification localStorage:`)
    addResult(`   - user: ${user ? '✅ présent' : '❌ absent'}`)
    addResult(`   - isAuthenticated: ${isAuthenticated ? '✅ présent' : '❌ absent'}`)
    
    if (user) {
      try {
        const userObj = JSON.parse(user)
        addResult(`   - user.role: ${userObj.role}`)
        addResult(`   - user.email: ${userObj.email}`)
      } catch (e) {
        addResult(`   - ❌ Erreur parsing user`)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test Simple de Redirection
          </h1>
          <p className="text-gray-600">
            Test sans NextAuth - utilisation de localStorage
          </p>
        </div>

        {/* Actions rapides */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions de test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={checkStorage} variant="outline" className="w-full">
                📊 Vérifier localStorage
              </Button>
              <Button onClick={clearStorage} variant="outline" className="w-full">
                🗑️ Nettoyer localStorage
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tests de redirection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard">
                <Button variant="outline" className="w-full">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Test /dashboard (redirection auto)
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline" className="w-full">
                  <Shield className="w-4 h-4 mr-2" />
                  Test /admin direct
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Cartes de simulation de connexion */}
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
                Simulation connexion admin
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
                  onClick={() => simulateLogin('admin@test.com', 'ADMIN', '/admin')}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <User className="w-4 h-4 mr-2" />
                  Simuler Admin
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
                Simulation connexion agent
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
                  onClick={() => simulateLogin('agent@test.com', 'AGENT', '/dashboard/agent')}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <User className="w-4 h-4 mr-2" />
                  Simuler Agent
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
                Simulation connexion client
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
                  onClick={() => simulateLogin('client@test.com', 'CLIENT', '/dashboard/client')}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <User className="w-4 h-4 mr-2" />
                  Simuler Client
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Résultats des tests */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Résultats des tests</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setTestResults([])}
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
                  Cliquez sur les boutons ci-dessus pour tester...
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

        {/* Instructions */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            <strong>Instructions:</strong><br />
            1. Cliquez sur "Simuler Admin/Agent/Client" pour stocker un utilisateur dans localStorage<br />
            2. Puis cliquez sur "Test /dashboard" pour vérifier la redirection automatique<br />
            3. Utilisez la console du navigateur pour voir les logs de redirection
          </p>
        </div>
      </div>
    </div>
  )
}