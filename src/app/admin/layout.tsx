'use client'

import { ReactNode } from 'react'
import { AdminAuthWrapper } from '@/components/admin/admin-auth-wrapper'
import { AdminHeader } from '@/components/admin/admin-header'
import { AdminBreadcrumb } from '@/components/admin/admin-breadcrumb'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminAuthWrapper>
      <div className="min-h-screen bg-background">
        <AdminHeader />
        <AdminBreadcrumb />
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
      </div>
    </AdminAuthWrapper>
  )
}