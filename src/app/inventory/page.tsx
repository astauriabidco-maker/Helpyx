'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/header';
import { InventoryManagement } from '@/components/inventory-management';
import { ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';

export default function InventoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Check if user has permission to access inventory
    const userRole = session.user?.role;
    if (userRole !== 'ADMIN' && userRole !== 'AGENT') {
      router.push('/');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const userRole = session.user?.role;
  if (userRole !== 'ADMIN' && userRole !== 'AGENT') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header companyName="TechSupport" />
      
      <main className="container px-4 py-8 md:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Package className="w-8 h-8" />
                Gestion du Stock
              </h1>
              <p className="text-muted-foreground">
                Gérez vos pièces détachées et optimisez vos commandes automatiques
              </p>
            </div>
          </div>

          {/* Inventory Management Component */}
          <InventoryManagement />
        </div>
      </main>
    </div>
  );
}