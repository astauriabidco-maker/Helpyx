'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Play,
  RefreshCw,
  Database,
  Shield,
  Zap,
  Palette,
  Globe
} from 'lucide-react';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  duration: number;
  message?: string;
  details?: any;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  totalDuration: number;
  passCount: number;
  failCount: number;
  skipCount: number;
}

interface TestReport {
  success: boolean;
  suite: string;
  timestamp: string;
  summary: {
    totalTests: number;
    totalPass: number;
    totalFail: number;
    successRate: number;
    totalDuration: number;
  };
  results: TestSuite[];
  report: string;
}

export default function TestsDashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentSuite, setCurrentSuite] = useState('all');
  const [lastReport, setLastReport] = useState<TestReport | null>(null);
  const [selectedSuite, setSelectedSuite] = useState<string | null>(null);

  const runTests = async (suite: string = 'all') => {
    setIsRunning(true);
    setCurrentSuite(suite);
    
    try {
      const response = await fetch('/api/tests/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ suite }),
      });

      const data: TestReport = await response.json();
      setLastReport(data);
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setIsRunning(false);
      setCurrentSuite('all');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'FAIL':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'SKIP':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS':
        return 'bg-green-100 text-green-800';
      case 'FAIL':
        return 'bg-red-100 text-red-800';
      case 'SKIP':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSuiteIcon = (suiteName: string) => {
    switch (suiteName) {
      case 'Base de Données':
        return <Database className="w-5 h-5 text-blue-500" />;
      case 'API REST':
        return <Globe className="w-5 h-5 text-purple-500" />;
      case 'Sécurité':
        return <Shield className="w-5 h-5 text-red-500" />;
      case 'Performance':
        return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'UX/Interface':
        return <Palette className="w-5 h-5 text-pink-500" />;
      default:
        return <TestTube className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <TestTube className="w-8 h-8 text-violet-600" />
              Centre de Tests TechSupport SAV
            </h1>
            <p className="text-slate-600 mt-2">
              Suite complète de tests pour la validation de la plateforme
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => runTests('all')}
              disabled={isRunning}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Tests en cours...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Lancer Tous les Tests
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { name: 'Base de Données', suite: 'database', icon: Database },
            { name: 'API REST', suite: 'api', icon: Globe },
            { name: 'Sécurité', suite: 'security', icon: Shield },
            { name: 'Performance', suite: 'performance', icon: Zap },
            { name: 'UX/Interface', suite: 'ux', icon: Palette }
          ].map(({ name, suite, icon: Icon }) => (
            <Card key={suite} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Icon className="w-6 h-6 text-violet-600" />
                  <Badge variant="outline">{suite}</Badge>
                </div>
                <h3 className="font-medium text-slate-900 mb-2">{name}</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => runTests(suite)}
                  disabled={isRunning && currentSuite !== suite}
                  className="w-full"
                >
                  {isRunning && currentSuite === suite ? (
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Play className="w-3 h-3 mr-1" />
                  )}
                  Tester
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Results */}
        {lastReport && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Total Tests</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {lastReport.summary.totalTests}
                      </p>
                    </div>
                    <TestTube className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Réussis</p>
                      <p className="text-2xl font-bold text-green-600">
                        {lastReport.summary.totalPass}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Échoués</p>
                      <p className="text-2xl font-bold text-red-600">
                        {lastReport.summary.totalFail}
                      </p>
                    </div>
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Taux Succès</p>
                      <p className={`text-2xl font-bold ${getSuccessRateColor(lastReport.summary.successRate)}`}>
                        {lastReport.summary.successRate.toFixed(1)}%
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Durée Totale</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {lastReport.summary.totalDuration}ms
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Results */}
            <Card>
              <CardHeader>
                <CardTitle>Résultats Détaillés</CardTitle>
                <CardDescription>
                  Dernière exécution: {new Date(lastReport.timestamp).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedSuite || lastReport.results[0]?.name} onValueChange={setSelectedSuite}>
                  <TabsList className="grid w-full grid-cols-5">
                    {lastReport.results.map((suite) => (
                      <TabsTrigger key={suite.name} value={suite.name} className="flex items-center gap-2">
                        {getSuiteIcon(suite.name)}
                        {suite.name}
                        {suite.failCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {suite.failCount}
                          </Badge>
                        )}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {lastReport.results.map((suite) => (
                    <TabsContent key={suite.name} value={suite.name} className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getSuiteIcon(suite.name)}
                          <h3 className="font-medium text-slate-900">{suite.name}</h3>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm">{suite.passCount}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span className="text-sm">{suite.failCount}</span>
                          </div>
                          <div className="text-sm text-slate-600">
                            {suite.totalDuration}ms
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {suite.tests.map((test, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(test.status)}
                              <span className="font-medium">{test.name}</span>
                              <Badge className={getStatusColor(test.status)}>
                                {test.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-slate-600">{test.duration}ms</span>
                              {test.message && (
                                <span className="text-sm text-slate-500 max-w-md truncate">
                                  {test.message}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {/* Full Report */}
            <Card>
              <CardHeader>
                <CardTitle>Rapport Complet</CardTitle>
                <CardDescription>
                  Rapport détaillé de l'exécution des tests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                  {lastReport.report}
                </pre>
              </CardContent>
            </Card>
          </div>
        )}

        {/* No Results State */}
        {!lastReport && !isRunning && (
          <Card>
            <CardContent className="p-12 text-center">
              <TestTube className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Aucun test exécuté
              </h3>
              <p className="text-slate-600 mb-6">
                Lancez la suite de tests complète pour valider la plateforme TechSupport SAV
              </p>
              <Button
                onClick={() => runTests('all')}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Lancer les Tests
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}