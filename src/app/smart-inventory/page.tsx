'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/header';
import { SmartInventoryDiscovery } from '@/components/smart-inventory-discovery';
import { ArrowLeft, Radar, Package, Activity, Shield, Zap } from 'lucide-react';
import Link from 'next/link';

export default function SmartInventoryPage() {
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
      <Header companyName="Helpyx" />

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
                <Radar className="w-8 h-8" />
                Inventaire Intelligent
              </h1>
              <p className="text-muted-foreground">
                Découvrez automatiquement les équipements de votre environnement et gérez-les efficacement
              </p>
            </div>
          </div>

          {/* Statistiques principales */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Équipements découverts</CardTitle>
                <Radar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">+3 cette semaine</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Équipements en ligne</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">18</div>
                <p className="text-xs text-muted-foreground">75% du total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alertes maintenance</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">5</div>
                <p className="text-xs text-muted-foreground">2 urgentes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Efficacité scan</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94%</div>
                <p className="text-xs text-muted-foreground">Confiance moyenne</p>
              </CardContent>
            </Card>
          </div>

          {/* Cartes d'information */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Radar className="w-5 h-5" />
                  Découverte Réseau
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-700 mb-4">
                  Scannez automatiquement votre réseau pour découvrir ordinateurs, serveurs, imprimantes et équipements réseau.
                </p>
                <div className="space-y-2 text-sm text-blue-600">
                  <div>• Scan IP et ports ouverts</div>
                  <div>• Identification OS et services</div>
                  <div>• Détection fabricant et modèle</div>
                  <div>• Évaluation de la confiance</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <Package className="w-5 h-5" />
                  Intégration Inventaire
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-purple-700 mb-4">
                  Ajoutez automatiquement les équipements découverts à votre inventaire avec toutes leurs caractéristiques.
                </p>
                <div className="space-y-2 text-sm text-purple-600">
                  <div>• Catégorisation automatique</div>
                  <div>• Estimation des coûts</div>
                  <div>• Planification maintenance</div>
                  <div>• Suivi des garanties</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Shield className="w-5 h-5" />
                  Maintenance Prédictive
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-700 mb-4">
                  Recevez des alertes intelligentes pour la maintenance basées sur l'âge et l'utilisation des équipements.
                </p>
                <div className="space-y-2 text-sm text-green-600">
                  <div>• Calculs de garantie</div>
                  <div>• Planification automatique</div>
                  <div>• Alertes prioritaires</div>
                  <div>• Historique complet</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Outil de découverte principal */}
          <SmartInventoryDiscovery />

          {/* Guide rapide */}
          <Card>
            <CardHeader>
              <CardTitle>Guide d'utilisation rapide</CardTitle>
              <CardDescription>
                Comment utiliser l'outil d'inventaire intelligent efficacement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Étape 1: Lancer la découverte</h4>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li>1. Choisissez le type de scan (Réseau, Bluetooth, USB)</li>
                    <li>2. Configurez la plage d'adresses IP si nécessaire</li>
                    <li>3. Appliquez des filtres pour cibler des équipements spécifiques</li>
                    <li>4. Cliquez sur "Lancer la découverte"</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Étape 2: Gérer les résultats</h4>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li>1. Consultez les équipements découverts dans l'onglet "Équipements trouvés"</li>
                    <li>2. Vérifiez les détails et la confiance de chaque équipement</li>
                    <li>3. Sélectionnez les équipements à ajouter à l'inventaire</li>
                    <li>4. Cliquez sur "Ajouter à l'inventaire" pour les intégrer</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}