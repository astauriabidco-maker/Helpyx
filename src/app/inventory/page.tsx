'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { InventoryManagement } from '@/components/inventory-management';
import { Package, Loader2 } from 'lucide-react';

export default function InventoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) { router.push('/auth/signin'); return; }
    const userRole = session.user?.role;
    if (userRole !== 'ADMIN' && userRole !== 'AGENT') { router.push('/'); return; }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'AGENT')) {
    return null;
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Package className="w-7 h-7 text-blue-600" />
            Gestion du Stock
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gérez vos pièces détachées et optimisez vos commandes automatiques
          </p>
        </div>

        <InventoryManagement />
      </div>
    </AppShell>
  );
}