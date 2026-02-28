'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { NotificationBell } from '@/components/notification-bell'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    LogOut,
    Home,
    Brain,
    Package,
    BookOpen,
    Bell,
    ChevronLeft,
    ChevronRight,
    Ticket,
    BarChart3,
    HelpCircle,
    Search,
    PanelLeftClose,
    PanelLeft,
    CreditCard,
    Trophy,
    Monitor,
    Store,
    Sparkles,
    Plug,
    Stethoscope,
    RotateCcw
} from 'lucide-react'
import { useState, useEffect } from 'react'

const navSections = [
    {
        label: 'Principal',
        items: [
            { title: 'Tableau de bord', href: '/admin', icon: LayoutDashboard },
            { title: 'Tickets', href: '/admin/tickets', icon: Ticket, badge: '' },
            { title: 'Utilisateurs', href: '/admin/users', icon: Users },
            { title: 'Reporting IA', href: '/admin/reporting', icon: BarChart3 },
        ]
    },
    {
        label: 'Gestion',
        items: [
            { title: 'Inventaire', href: '/inventory', icon: Package },
            { title: 'Audit Matériel', href: '/admin/audit', icon: Stethoscope },
            { title: 'SAV / RMA', href: '/admin/rma', icon: RotateCcw },
            { title: 'Articles KB', href: '/admin/articles', icon: BookOpen },
            { title: 'Knowledge Graph', href: '/knowledge-graph', icon: Brain },
            { title: 'Automatisations', href: '/admin/workflows', icon: Sparkles },
            { title: 'Changements', href: '/admin/changes', icon: BarChart3 },
        ]
    },
    {
        label: 'Avancé',
        items: [
            { title: 'Billing', href: '/billing', icon: CreditCard },
            { title: 'Gamification', href: '/gamification', icon: Trophy },
            { title: 'IA Comportementale', href: '/ai-behavioral', icon: Brain },
            { title: 'Digital Twin', href: '/digital-twin', icon: Monitor },
            { title: 'Marketplace', href: '/marketplace', icon: Store },
        ]
    },
    {
        label: 'Système',
        items: [
            { title: 'Intégrations', href: '/admin/integrations', icon: Plug },
            { title: 'Notifications', href: '/notifications', icon: Bell },
            { title: 'Paramètres', href: '/admin/settings', icon: Settings },
        ]
    }
]

export function AdminSidebar() {
    const { data: session } = useSession()
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const saved = localStorage.getItem('sidebar-collapsed')
        if (saved === 'true') setCollapsed(true)
    }, [])

    const toggleCollapsed = () => {
        const next = !collapsed
        setCollapsed(next)
        localStorage.setItem('sidebar-collapsed', String(next))
    }

    const isActive = (href: string) => {
        if (href === '/admin') return pathname === href
        return pathname.startsWith(href)
    }

    const handleSignOut = () => {
        signOut({ callbackUrl: '/' })
    }

    const userInitials = session?.user?.name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'A'

    const sidebarWidth = collapsed ? 'w-[68px]' : 'w-[260px]'

    if (!mounted) return null

    return (
        <TooltipProvider delayDuration={0}>
            <aside
                className={`
          ${sidebarWidth}
          fixed left-0 top-0 z-40 h-screen
          bg-slate-900 text-slate-300
          border-r border-slate-800
          flex flex-col
          transition-all duration-300 ease-in-out
          overflow-hidden
        `}
            >
                {/* Logo */}
                <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} h-16 px-4 border-b border-slate-800`}>
                    <Link href="/admin" className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                            <span className="text-white font-bold text-sm">H</span>
                        </div>
                        {!collapsed && (
                            <div className="overflow-hidden">
                                <h1 className="text-lg font-bold text-white truncate">Helpyx</h1>
                                <p className="text-[10px] text-slate-500 truncate">Support & IT Management</p>
                            </div>
                        )}
                    </Link>
                    {!collapsed && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleCollapsed}
                            className="h-7 w-7 p-0 text-slate-500 hover:text-white hover:bg-slate-800"
                        >
                            <PanelLeftClose className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin">
                    {navSections.map((section) => (
                        <div key={section.label}>
                            {!collapsed && (
                                <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                    {section.label}
                                </p>
                            )}
                            {collapsed && <div className="border-b border-slate-800 mb-3 mx-2" />}
                            <div className="space-y-1">
                                {section.items.map((item) => {
                                    const Icon = item.icon
                                    const active = isActive(item.href)

                                    const linkContent = (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                        transition-all duration-200 group relative
                        ${active
                                                    ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/10 text-white border border-blue-500/20 shadow-sm'
                                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                                                }
                        ${collapsed ? 'justify-center px-2' : ''}
                      `}
                                        >
                                            <Icon className={`h-[18px] w-[18px] flex-shrink-0 ${active ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                                            {!collapsed && (
                                                <>
                                                    <span className="truncate">{item.title}</span>
                                                    {item.badge && (
                                                        <Badge className="ml-auto bg-blue-600/80 text-white text-[10px] px-1.5 py-0">
                                                            {item.badge}
                                                        </Badge>
                                                    )}
                                                </>
                                            )}
                                            {active && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-500 rounded-r-full" />
                                            )}
                                        </Link>
                                    )

                                    if (collapsed) {
                                        return (
                                            <Tooltip key={item.href}>
                                                <TooltipTrigger asChild>
                                                    {linkContent}
                                                </TooltipTrigger>
                                                <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                                                    {item.title}
                                                </TooltipContent>
                                            </Tooltip>
                                        )
                                    }

                                    return linkContent
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Bottom Section */}
                <div className="border-t border-slate-800 p-3 space-y-2">
                    {/* Expand button when collapsed */}
                    {collapsed && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleCollapsed}
                                    className="w-full h-9 text-slate-500 hover:text-white hover:bg-slate-800"
                                >
                                    <PanelLeft className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                                Étendre la sidebar
                            </TooltipContent>
                        </Tooltip>
                    )}

                    {/* Retour au site */}
                    {collapsed ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link href="/">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full h-9 text-slate-500 hover:text-white hover:bg-slate-800"
                                    >
                                        <Home className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                                Retour au site
                            </TooltipContent>
                        </Tooltip>
                    ) : (
                        <Link href="/">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start gap-3 text-slate-500 hover:text-white hover:bg-slate-800"
                            >
                                <Home className="h-4 w-4" />
                                <span className="text-sm">Retour au site</span>
                            </Button>
                        </Link>
                    )}

                    {/* User Profile */}
                    <div className={`
            flex items-center gap-3 p-2 rounded-lg bg-slate-800/50 
            ${collapsed ? 'justify-center' : ''}
          `}>
                        <Avatar className="h-8 w-8 flex-shrink-0 border border-slate-700">
                            <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs">
                                {userInitials}
                            </AvatarFallback>
                        </Avatar>
                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {session?.user?.name || 'Admin'}
                                </p>
                                <p className="text-[11px] text-slate-500 truncate">
                                    {session?.user?.email || ''}
                                </p>
                            </div>
                        )}
                        {!collapsed && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSignOut}
                                className="h-7 w-7 p-0 text-slate-500 hover:text-red-400 hover:bg-red-500/10 flex-shrink-0"
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </aside>
        </TooltipProvider>
    )
}
