'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

const breadcrumbNames: Record<string, string> = {
  '/admin': 'Tableau de bord',
  '/admin/users': 'Utilisateurs',
  '/admin/tickets': 'Tickets',
  '/admin/settings': 'Paramètres',
  '/admin/analytics': 'Analytiques',
  '/admin/reports': 'Rapports'
}

export function AdminBreadcrumb() {
  const pathname = usePathname()

  // Ne pas afficher le breadcrumb sur la page d'accueil de l'admin
  if (pathname === '/admin') {
    return null
  }

  const pathSegments = pathname.split('/').filter(Boolean)
  const breadcrumbs = []

  // Ajouter l'accueil
  breadcrumbs.push({
    href: '/admin',
    label: 'Accueil',
    isCurrent: false
  })

  // Ajouter les segments intermédiaires
  let currentPath = ''
  for (let i = 1; i < pathSegments.length; i++) {
    currentPath += '/' + pathSegments[i]
    const isLast = i === pathSegments.length - 1
    
    breadcrumbs.push({
      href: currentPath,
      label: breadcrumbNames[currentPath] || pathSegments[i],
      isCurrent: isLast
    })
  }

  return (
    <div className="flex items-center space-x-2 text-sm text-muted-foreground py-3 px-4 border-b bg-muted/30">
      <Link 
        href="/admin" 
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center space-x-2">
          <ChevronRight className="h-4 w-4" />
          {crumb.isCurrent ? (
            <span className="text-foreground font-medium">{crumb.label}</span>
          ) : (
            <Link 
              href={crumb.href}
              className="hover:text-foreground transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  )
}