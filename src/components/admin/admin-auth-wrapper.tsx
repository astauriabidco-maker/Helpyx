'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'

interface AdminAuthWrapperProps {
  children: React.ReactNode
}

export function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Attendre que la session soit chargée
    if (status === 'loading') return

    console.log('AdminAuthWrapper - Session:', session)
    console.log('AdminAuthWrapper - Status:', status)

    // Vérifier si l'utilisateur est authentifié
    if (!session) {
      console.log('AdminAuthWrapper: Aucune session trouvée, redirection vers signin')
      router.push('/auth/signin')
      return
    }

    // Vérifier si l'utilisateur est un admin
    if (session.user?.role !== 'ADMIN') {
      console.log('AdminAuthWrapper: Utilisateur non admin (rôle:', session.user?.role, '), redirection vers dashboard')
      router.push('/dashboard')
      return
    }

    // Si on arrive ici, l'utilisateur est autorisé
    console.log('AdminAuthWrapper: Utilisateur autorisé pour l\'administration')
    setIsAuthorized(true)
    setIsLoading(false)
  }, [session, status, router])

  // Afficher le chargement pendant la vérification
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Vérification des autorisations...</p>
        </div>
      </div>
    )
  }

  // Afficher l'erreur si non autorisé
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600 mb-2">Accès Non Autorisé</h1>
          <p className="text-muted-foreground mb-4">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    )
  }

  // Si autorisé, afficher le contenu
  return <>{children}</>
}