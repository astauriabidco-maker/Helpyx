'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  FileSpreadsheet, 
  BarChart3, 
  Database, 
  Settings, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface Integration {
  id: string;
  name: string;
  type: 'powerbi' | 'excel' | 'tableau' | 'google-sheets';
  status: 'active' | 'inactive' | 'error';
  lastSync: string | null;
  config: any;
}

interface ExportData {
  format: 'json' | 'csv' | 'xml' | 'excel';
  metric?: string;
  startDate?: string;
  endDate?: string;
}

export default function BiIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportConfig, setExportConfig] = useState<ExportData>({
    format: 'json',
  });

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/bi/integrations');
      const data = await response.json();
      setIntegrations(data.integrations || []);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast.error('Erreur lors du chargement des intégrations');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: string) => {
    setExporting(true);
    try {
      const response = await fetch('/api/bi/export', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bi-export-${new Date().toISOString().split('T')[0]}.${exportConfig.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Export réussi');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'export');
    } finally {
      setExporting(false);
    }
  };

  const handleIntegrationExport = async (integrationId: string, type: string) => {
    setExporting(true);
    try {
      const response = await fetch('/api/bi/integrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          config: { integrationId },
          data: { format: exportConfig.format },
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Export vers ${type} réussi`);
        if (result.downloadUrl) {
          window.open(result.downloadUrl, '_blank');
        }
      } else {
        throw new Error(result.error || 'Export failed');
      }
    } catch (error) {
      console.error('Integration export error:', error);
      toast.error(`Erreur lors de l'export vers ${type}`);
    } finally {
      setExporting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      error: 'destructive',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'powerbi':
        return <BarChart3 className="h-5 w-5" />;
      case 'excel':
        return <FileSpreadsheet className="h-5 w-5" />;
      case 'tableau':
        return <Database className="h-5 w-5" />;
      case 'google-sheets':
        return <FileSpreadsheet className="h-5 w-5" />;
      default:
        return <Database className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Intégrations BI</h2>
          <p className="text-muted-foreground">
            Connectez vos outils BI et exportez vos données
          </p>
        </div>
        <Button onClick={fetchIntegrations} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Export Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration d'Export</CardTitle>
          <CardDescription>
            Personnalisez le format et les données à exporter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Format</label>
              <select
                value={exportConfig.format}
                onChange={(e) => setExportConfig(prev => ({ ...prev, format: e.target.value as any }))}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="xml">XML</option>
                <option value="excel">Excel</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Métrique</label>
              <select
                value={exportConfig.metric || ''}
                onChange={(e) => setExportConfig(prev => ({ ...prev, metric: e.target.value }))}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="">Toutes</option>
                <option value="revenue">Revenus</option>
                <option value="performance">Performance</option>
                <option value="predictive">Prédictif</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Date de début</label>
              <input
                type="date"
                value={exportConfig.startDate || ''}
                onChange={(e) => setExportConfig(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full mt-1 p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Date de fin</label>
              <input
                type="date"
                value={exportConfig.endDate || ''}
                onChange={(e) => setExportConfig(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full mt-1 p-2 border rounded-md"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button 
              onClick={() => handleExport('direct')} 
              disabled={exporting}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Download className="h-4 w-4 mr-2" />
              {exporting ? 'Exportation...' : 'Exporter'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Exports */}
      <Card>
        <CardHeader>
          <CardTitle>Exports Rapides</CardTitle>
          <CardDescription>
            Exportez directement vers vos outils BI préférés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => handleIntegrationExport('powerbi', 'powerbi')}
              disabled={exporting}
              variant="outline"
              className="h-20 flex flex-col gap-2"
            >
              <BarChart3 className="h-6 w-6" />
              <span>Power BI</span>
            </Button>
            <Button
              onClick={() => handleIntegrationExport('excel', 'excel')}
              disabled={exporting}
              variant="outline"
              className="h-20 flex flex-col gap-2"
            >
              <FileSpreadsheet className="h-6 w-6" />
              <span>Excel</span>
            </Button>
            <Button
              onClick={() => handleIntegrationExport('tableau', 'tableau')}
              disabled={exporting}
              variant="outline"
              className="h-20 flex flex-col gap-2"
            >
              <Database className="h-6 w-6" />
              <span>Tableau</span>
            </Button>
            <Button
              onClick={() => handleIntegrationExport('google-sheets', 'google-sheets')}
              disabled={exporting}
              variant="outline"
              className="h-20 flex flex-col gap-2"
            >
              <FileSpreadsheet className="h-6 w-6" />
              <span>Google Sheets</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Intégrations Existantes</CardTitle>
          <CardDescription>
            Gérez vos connexions avec les systèmes externes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {integrations.length === 0 ? (
            <div className="text-center py-8">
              <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Aucune intégration configurée
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {integrations.map((integration) => (
                <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getIntegrationIcon(integration.type)}
                    <div>
                      <h3 className="font-medium">{integration.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {integration.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusIcon(integration.status)}
                    {getStatusBadge(integration.status)}
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}