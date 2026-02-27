'use client'

import { ReactNode, useState, useEffect } from 'react'
import { AdminAuthWrapper } from '@/components/admin/admin-auth-wrapper'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminTopBar } from '@/components/admin/admin-topbar'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved === 'true') setSidebarCollapsed(true)

    // Listen for sidebar collapse changes
    const observer = new MutationObserver(() => {
      const saved = localStorage.getItem('sidebar-collapsed')
      setSidebarCollapsed(saved === 'true')
    })

    // Use a simpler approach: poll localStorage
    const interval = setInterval(() => {
      const current = localStorage.getItem('sidebar-collapsed') === 'true'
      setSidebarCollapsed(current)
    }, 300)

    return () => clearInterval(interval)
  }, [])

  const marginLeft = sidebarCollapsed ? 'lg:ml-[68px]' : 'lg:ml-[260px]'

  return (
    <AdminAuthWrapper>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* Sidebar — hidden on mobile, visible on desktop */}
        <div className="hidden lg:block">
          <AdminSidebar />
        </div>

        {/* Mobile sidebar overlay */}
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

        {/* Main content area */}
        <div className={`${marginLeft} transition-all duration-300`}>
          <AdminTopBar
            onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          />
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthWrapper>
  )
}