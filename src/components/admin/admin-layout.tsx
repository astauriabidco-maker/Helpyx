'use client'

import { ReactNode } from 'react'
import { AdminHeader } from './admin-header'
import { AdminBreadcrumb } from './admin-breadcrumb'

interface AdminLayoutProps {
  children: ReactNode
  showBreadcrumb?: boolean
}

export function AdminLayout({ children, showBreadcrumb = true }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      {showBreadcrumb && <AdminBreadcrumb />}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}