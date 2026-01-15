'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Shield, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'

export default function AdminTestPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  // Comptes admin disponibles pour le test
  const adminAccounts = [
    { email: 'admin@test.com', name: 'Admin User' },
    { email: 'admin@exemple.com', name: 'Admin Demo' },
    { email: 'test@company.com', name: 'Test User' }
  ]

  const testLogin = async (testEmail: string, testPassword: string) => {
    setIsLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/auth/simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword
        })
      })

      const data = await response.json()
      setResult(data)

      if (response.ok) {
        // Stocker les informations de connexion
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('isAuthenticated', 'true')
        
        // Rediriger vers le dashboard approprié
        if (data.user.role === 'ADMIN') {
          router.push('/admin')
        } else {
          router.push('/')
        }
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickTest = (accountEmail: string) => {
    setEmail(accountEmail)
    setPassword('password123')
    testLogin(accountEmail, 'password123')
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    testLogin(email, password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-2xl space-y-6">
        {/* En-tête */}
        <div className="text-center">
          <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Test Connexion Admin</h1>
          <p className="text-gray-600 mt-2">
            Testez la connexion avec les comptes administrateurs
          </p>
        </div>

        {/* Carte de test rapide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Test Rapide
            </CardTitle>
            <CardDescription>
              Cliquez sur un compte pour tester la connexion automatiquement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {adminAccounts.map((account) => (
                <Button
                  key={account.email}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start"
                  onClick={() => handleQuickTest(account.email)}
                  disabled={isLoading}
                >
                  <div className="font-medium text-sm">{account.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {account.email}
                  </div>
                  <div className="text-xs text-blue-600 mt-2">
                    Mot de passe: password123
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Formulaire de connexion manuel */}
        <Card>
          <CardHeader>
            <CardTitle>Connexion Manuelle</CardTitle>
            <CardDescription>
              Entrez manuellement les identifiants pour tester
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
                  placeholder="admin@test.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="password123"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !email || !password}
              >
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Résultat du test */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.user ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                Résultat du Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant={result.user ? 'default' : 'destructive'}>
                    {result.user ? 'SUCCÈS' : 'ÉCHEC'}
                  </Badge>
                </div>
                
                {result.user && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Utilisateur connecté:</h4>
                    <div className="text-sm text-green-800 space-y-1">
                      <div><strong>Nom:</strong> {result.user.name}</div>
                      <div><strong>Email:</strong> {result.user.email}</div>
                      <div><strong>Rôle:</strong> {result.user.role}</div>
                      <div><strong>ID:</strong> {result.user.id}</div>
                    </div>
                  </div>
                )}
                
                {result.error && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-medium text-red-900 mb-2">Erreur:</h4>
                    <div className="text-sm text-red-800">{result.error}</div>
                  </div>
                )}
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Debug Info:</h4>
                  <pre className="text-xs text-gray-800 overflow-x-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Message d'erreur */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <div>• Les comptes admin utilisent le mot de passe: <code className="bg-gray-100 px-2 py-1 rounded">password123</code></div>
            <div>• Cliquez sur "Test Rapide" pour tester automatiquement chaque compte</div>
            <div>• Utilisez "Connexion Manuelle" pour tester des identifiants spécifiques</div>
            <div>• En cas de succès, vous serez redirigé vers le dashboard admin</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}