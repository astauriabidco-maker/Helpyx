'use client'

import { ReactNode, useState, useEffect } from 'react'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminTopBar } from '@/components/admin/admin-topbar'

interface AppShellProps {
    children: ReactNode
}

/**
 * Composant shell réutilisable avec sidebar et topbar.
 * À utiliser pour les layouts en dehors de /admin qui ont besoin de la sidebar.
 */
export function AppShell({ children }: AppShellProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem('sidebar-collapsed')
        if (saved === 'true') setSidebarCollapsed(true)

        const interval = setInterval(() => {
            const current = localStorage.getItem('sidebar-collapsed') === 'true'
            setSidebarCollapsed(current)
        }, 300)

        return () => clearInterval(interval)
    }, [])

    const marginLeft = sidebarCollapsed ? 'lg:ml-[68px]' : 'lg:ml-[260px]'

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="hidden lg:block">
                <AdminSidebar />
            </div>

            {mobileMenuOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <div className="lg:hidden fixed z-40">
                        <AdminSidebar />
                    </div>
                </>
            )}

            <div className={`${marginLeft} transition-all duration-300`}>
                <AdminTopBar
                    onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
                />
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
