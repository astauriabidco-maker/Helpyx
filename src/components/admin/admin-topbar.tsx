'use client'

import { usePathname } from 'next/navigation'
import { NotificationBell } from '@/components/notification-bell'
import { Button } from '@/components/ui/button'
import {
    ChevronRight,
    Home,
    Search,
    Menu
} from 'lucide-react'
import Link from 'next/link'

const breadcrumbNames: Record<string, string> = {
    'admin': 'Administration',
    'users': 'Utilisateurs',
    'tickets': 'Tickets',
    'settings': 'Paramètres',
    'articles': 'Articles KB',
    'knowledge-graph': 'Knowledge Graph',
    'monitoring': 'Monitoring',
    'inventory': 'Inventaire',
    'notifications': 'Notifications',
}

interface AdminTopBarProps {
    onMobileMenuToggle?: () => void;
}

export function AdminTopBar({ onMobileMenuToggle }: AdminTopBarProps) {
    const pathname = usePathname()

    const pathSegments = pathname.split('/').filter(Boolean)

    // Build breadcrumbs
    const breadcrumbs: { href: string; label: string }[] = []
    let currentPath = ''

    for (const segment of pathSegments) {
        currentPath += '/' + segment
        const label = breadcrumbNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
        breadcrumbs.push({ href: currentPath, label })
    }

    // Page title = last breadcrumb
    const pageTitle = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].label : 'Tableau de bord'

    return (
        <header className="sticky top-0 z-30 h-14 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-between px-6">
            {/* Left: Mobile menu + Breadcrumb */}
            <div className="flex items-center gap-4">
                {/* Mobile menu button */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden h-8 w-8 p-0"
                    onClick={onMobileMenuToggle}
                >
                    <Menu className="h-5 w-5" />
                </Button>

                {/* Breadcrumb */}
                <nav className="hidden sm:flex items-center gap-1.5 text-sm">
                    <Link href="/admin" className="text-slate-400 hover:text-slate-600 transition-colors">
                        <Home className="h-3.5 w-3.5" />
                    </Link>
                    {breadcrumbs.map((crumb, index) => (
                        <div key={crumb.href} className="flex items-center gap-1.5">
                            <ChevronRight className="h-3 w-3 text-slate-300" />
                            {index === breadcrumbs.length - 1 ? (
                                <span className="text-slate-900 dark:text-white font-medium">{crumb.label}</span>
                            ) : (
                                <Link href={crumb.href} className="text-slate-400 hover:text-slate-600 transition-colors">
                                    {crumb.label}
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Mobile: just page title */}
                <span className="sm:hidden text-sm font-medium text-slate-900 dark:text-white">
                    {pageTitle}
                </span>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                <NotificationBell />
            </div>
        </header>
    )
}
