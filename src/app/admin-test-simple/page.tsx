'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LayoutDashboard,
  Building2,
  Users,
  TicketCheck,
  CreditCard,
  Settings,
  FileText,
  Server,
  Menu,
  X
} from 'lucide-react';

export default function AdminTestSimple() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'companies', label: 'Entreprises', icon: <Building2 className="h-4 w-4" /> },
    { id: 'users', label: 'Utilisateurs', icon: <Users className="h-4 w-4" /> },
    { id: 'tickets', label: 'Tickets', icon: <TicketCheck className="h-4 w-4" /> },
    { id: 'billing', label: 'Facturation', icon: <CreditCard className="h-4 w-4" /> },
    { id: 'system', label: 'Système', icon: <Server className="h-4 w-4" /> },
    { id: 'logs', label: 'Journaux', icon: <FileText className="h-4 w-4" /> },
    { id: 'settings', label: 'Paramètres', icon: <Settings className="h-4 w-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Administration Test</h1>
              <p className="text-sm text-gray-500">Test du menu latéral</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Sidebar: {sidebarOpen ? 'OUVERT' : 'FERMÉ'}
            </span>
            <span className="text-sm text-gray-600">
              Onglet actif: {activeTab}
            </span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - DEBUG VERSION FIXE */}
        <aside className={`
          w-64  {/* FORCÉ à w-64 pour tester */}
          bg-red-500 border-r-4 border-black 
          overflow-visible
          min-h-screen
        `}>
          <div className="p-4">
            <h3 className="text-lg font-bold text-white mb-4">MENU SIDEBAR</h3>
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className="w-full justify-start bg-white text-black hover:bg-gray-200"
                  onClick={() => setActiveTab(item.id)}
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </Button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Card>
            <CardHeader>
              <CardTitle>Contenu principal - Onglet: {activeTab}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Si vous voyez cette page, le dashboard fonctionne. 
                  Le sidebar devrait être visible à gauche avec un fond rouge.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Test Sidebar</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>État du sidebar: <strong>{sidebarOpen ? 'OUVERT' : 'FERMÉ'}</strong></p>
                      <Button 
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="mt-2"
                      >
                        Toggle Sidebar
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Test Navigation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Onglet actif: <strong>{activeTab}</strong></p>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {menuItems.slice(0, 4).map((item) => (
                          <Button
                            key={item.id}
                            size="sm"
                            variant={activeTab === item.id ? "default" : "outline"}
                            onClick={() => setActiveTab(item.id)}
                          >
                            {item.label}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}