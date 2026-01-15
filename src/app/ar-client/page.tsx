'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Smartphone, 
  Camera, 
  Image,
  Zap,
  Wifi,
  WifiOff,
  Search,
  Box,
  Wrench,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Upload,
  Barcode,
  QrCode,
  Monitor,
  Clock,
  MapPin,
  Info
} from 'lucide-react';
import { useARVRSocket, useARAnnotations } from '@/hooks/use-arvr-socket';

export default function ARClientPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  
  const { socket, joinARSession } = useARVRSocket();
  const { annotations, clearAnnotations } = useARAnnotations(currentSession || '');

  useEffect(() => {
    // Simuler la détection des capacités de l'appareil
    setDeviceInfo({
      hasCamera: true,
      hasARSupport: true,
      hasGyroscope: true,
      hasAccelerometer: true,
      batteryLevel: 85,
      model: 'Mobile Device'
    });
  }, []);

  const startARSession = () => {
    const sessionId = `mobile-ar-${Date.now()}`;
    setCurrentSession(sessionId);
    joinARSession(sessionId, 'client');
    setIsConnected(true);
  };

  const endARSession = () => {
    setCurrentSession(null);
    setIsConnected(false);
    clearAnnotations();
    setCapturedImage(null);
    setAnalysisResult(null);
  };

  const startScanning = () => {
    setIsScanning(true);
    // Simuler le scan AR
    setTimeout(() => {
      setIsScanning(false);
      setCapturedImage('/api/placeholder/400/300');
      simulateAnalysis();
    }, 3000);
  };

  const simulateAnalysis = () => {
    // Simuler l'analyse IA de l'image capturée
    setTimeout(() => {
      setAnalysisResult({
        deviceType: 'Router WiFi',
        model: 'TP-Link Archer AX6000',
        issues: [
          {
            type: 'warning',
            description: 'Les voyants WiFi sont clignotants orange',
            solution: 'Redémarrer le routeur et vérifier la connexion Internet'
          },
          {
            type: 'error',
            description: 'Pas de connexion Internet détectée',
            solution: 'Vérifier le câble Ethernet et contacter le FAI'
          }
        ],
        confidence: 92,
        parts: [
          { name: 'Antenne 1', status: 'ok' },
          { name: 'Antenne 2', status: 'ok' },
          { name: 'Port WAN', status: 'error' },
          { name: 'Port LAN 1', status: 'ok' }
        ]
      });
    }, 2000);
  };

  const capturePhoto = () => {
    // Simuler la capture photo
    setCapturedImage('/api/placeholder/400/300');
    simulateAnalysis();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Client AR Mobile</h1>
              <p className="text-gray-600">Application mobile avec reconnaissance AR</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center">
              {isConnected ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
              {isConnected ? 'Connecté' : 'Hors ligne'}
            </Badge>
            {deviceInfo && (
              <Badge variant="outline" className="flex items-center">
                <Battery className="w-3 h-3 mr-1" />
                {deviceInfo.batteryLevel}%
              </Badge>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Camera/AR View */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Camera className="w-5 h-5 mr-2" />
                    Vue AR
                  </span>
                  {isScanning && (
                    <Badge variant="secondary" className="animate-pulse">
                      Analyse en cours...
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ height: '300px' }}>
                  {capturedImage ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={capturedImage} 
                        alt="Captured" 
                        className="w-full h-full object-cover"
                      />
                      {/* AR Overlay */}
                      <div className="absolute inset-0 pointer-events-none">
                        {analysisResult && (
                          <div className="absolute top-4 left-4 bg-blue-500/80 text-white px-3 py-2 rounded-lg text-sm">
                            <div className="font-semibold">{analysisResult.deviceType}</div>
                            <div className="text-xs">{analysisResult.model}</div>
                            <div className="text-xs">Confiance: {analysisResult.confidence}%</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-white">
                        <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Vue caméra AR</p>
                        <p className="text-sm opacity-75">Pointez vers un équipement</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Scanning Overlay */}
                  {isScanning && (
                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                      <div className="bg-white rounded-lg p-4 shadow-lg">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                        <p className="text-sm">Analyse AR en cours...</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Camera Controls */}
                <div className="flex justify-center space-x-4 mt-4">
                  <Button onClick={capturePhoto} variant="outline">
                    <Camera className="w-4 h-4 mr-2" />
                    Photo
                  </Button>
                  <Button onClick={startScanning} disabled={isScanning}>
                    <Search className="w-4 h-4 mr-2" />
                    {isScanning ? 'Analyse...' : 'Scanner AR'}
                  </Button>
                  {capturedImage && (
                    <Button onClick={() => setCapturedImage(null)} variant="outline">
                      Effacer
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Device Capabilities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Smartphone className="w-5 h-5 mr-2" />
                  Capacités de l'Appareil
                </CardTitle>
              </CardHeader>
              <CardContent>
                {deviceInfo && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Camera className={`w-4 h-4 ${deviceInfo.hasCamera ? 'text-green-500' : 'text-red-500'}`} />
                      <span className="text-sm">Caméra</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Box className={`w-4 h-4 ${deviceInfo.hasARSupport ? 'text-green-500' : 'text-red-500'}`} />
                      <span className="text-sm">Support AR</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Monitor className={`w-4 h-4 ${deviceInfo.hasGyroscope ? 'text-green-500' : 'text-red-500'}`} />
                      <span className="text-sm">Gyroscope</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Zap className={`w-4 h-4 ${deviceInfo.hasAccelerometer ? 'text-green-500' : 'text-red-500'}`} />
                      <span className="text-sm">Accéléromètre</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Analysis & Results */}
          <div className="space-y-4">
            {/* Analysis Results */}
            {analysisResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Zap className="w-5 h-5 mr-2" />
                      Résultats de l'Analyse IA
                    </span>
                    <Badge variant="outline">{analysisResult.confidence}% confiance</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Device Info */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="font-semibold">{analysisResult.deviceType}</div>
                    <div className="text-sm text-gray-600">{analysisResult.model}</div>
                  </div>

                  {/* Issues */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Problèmes détectés:</h4>
                    {analysisResult.issues.map((issue: any, index: number) => (
                      <Alert key={index} variant={issue.type === 'error' ? 'destructive' : 'default'}>
                        {issue.type === 'error' ? <AlertTriangle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                        <AlertDescription>
                          <div className="font-medium">{issue.description}</div>
                          <div className="text-sm mt-1">{issue.solution}</div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>

                  {/* Parts Status */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Composants:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {analysisResult.parts.map((part: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{part.name}</span>
                          {part.status === 'ok' ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions Rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <QrCode className="w-4 h-4 mr-2" />
                  Scanner QR Code
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Barcode className="w-4 h-4 mr-2" />
                  Scanner Code Barres
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Importer une Photo
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MapPin className="w-4 h-4 mr-2" />
                  Localisation GPS
                </Button>
              </CardContent>
            </Card>

            {/* Session Control */}
            <Card>
              <CardHeader>
                <CardTitle>Session AR</CardTitle>
              </CardHeader>
              <CardContent>
                {!isConnected ? (
                  <Button onClick={startARSession} className="w-full">
                    <Wifi className="w-4 h-4 mr-2" />
                    Démarrer Session AR
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Session AR active - {currentSession?.slice(-8)}
                      </AlertDescription>
                    </Alert>
                    <Button onClick={endARSession} variant="destructive" className="w-full">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Terminer Session
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Battery({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect x="1" y="6" width="18" height="12" rx="2" strokeWidth="2"/>
      <rect x="21" y="9" width="2" height="6" rx="1"/>
      <rect x="3" y="8" width="4" height="8" rx="1"/>
    </svg>
  );
}