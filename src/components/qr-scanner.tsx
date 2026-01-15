'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Camera, X, Scan, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose?: () => void;
  title?: string;
  description?: string;
}

export const QRScanner: React.FC<QRScannerProps> = ({ 
  onScan, 
  onClose, 
  title = 'Scanner QR Code',
  description = 'Positionnez le QR code dans le cadre pour le scanner'
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [permission, setPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setError(null);
      
      // Demander la permission caméra
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Caméra arrière优先
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setPermission('granted');
        setIsScanning(true);
      }
    } catch (err) {
      console.error('Erreur caméra:', err);
      setError('Impossible d\'accéder à la caméra. Veuillez vérifier les permissions.');
      setPermission('denied');
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }, []);

  const handleScan = useCallback(() => {
    // Simulation de scan QR code (à remplacer avec une vraie librairie QR)
    // En production, utiliser une librairie comme qr-scanner ou react-qr-reader
    const simulatedQRData = `SN:${Date.now()}-DEVICE-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    setLastScanned(simulatedQRData);
    onScan(simulatedQRData);
    
    // Feedback visuel
    setTimeout(() => {
      setLastScanned(null);
    }, 2000);
  }, [onScan]);

  const handleClose = () => {
    stopCamera();
    onClose?.();
  };

  const validateQRData = (data: string): boolean => {
    // Valider le format du QR code pour les numéros de série
    const serialPatterns = [
      /^SN:/,           // Format: SN:XXXXXXXX
      /^[A-Z]{2,4}\d{6,12}$/, // Format: AB123456789
      /^\d{10,15}$/     // Format: 123456789012345
    ];
    
    return serialPatterns.some(pattern => pattern.test(data));
  };

  const extractSerialNumber = (data: string): string => {
    // Extraire le numéro de série depuis différentes formats
    if (data.startsWith('SN:')) {
      return data.substring(3);
    }
    return data;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Scan className="h-5 w-5" />
          {title}
        </CardTitle>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {lastScanned && (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Numéro de série scanné: <code className="bg-green-100 px-1 rounded">{lastScanned}</code>
            </AlertDescription>
          </Alert>
        )}

        <div className="relative">
          {/* Zone de scan */}
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
            {isScanning ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay de scan */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-4 border-2 border-white rounded-lg">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-lg"></div>
                  </div>
                  
                  {/* Ligne de scan animée */}
                  <div className="absolute inset-x-4 top-4 h-0.5 bg-green-400 animate-pulse"></div>
                </div>

                {/* Bouton de scan */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <Button
                    onClick={handleScan}
                    size="lg"
                    className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4"
                  >
                    <Scan className="h-6 w-6" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-white p-8">
                <Camera className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-center text-sm">
                  {permission === 'denied' 
                    ? 'Permission caméra refusée'
                    : 'Appuyez sur "Démarrer" pour scanner'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {!isScanning ? (
            <Button 
              onClick={startCamera} 
              className="flex-1"
              disabled={permission === 'denied'}
            >
              <Camera className="h-4 w-4 mr-2" />
              Démarrer le scan
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleScan} 
                className="flex-1"
                variant="default"
              >
                <Scan className="h-4 w-4 mr-2" />
                Scanner
              </Button>
              <Button 
                onClick={stopCamera} 
                variant="outline"
              >
                Arrêter
              </Button>
            </>
          )}
        </div>

        {/* Instructions */}
        <div className="space-y-2">
          <Badge variant="outline" className="w-full justify-center">
            Formats supportés
          </Badge>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Numéros de série: SN:XXXXXXXX</p>
            <p>• Codes internes: AB123456789</p>
            <p>• Numériques: 123456789012345</p>
          </div>
        </div>

        {/* Statut de permission */}
        {permission === 'denied' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Pour utiliser le scanner, veuillez autoriser l'accès à la caméra dans les paramètres de votre navigateur.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

// Composant pour afficher le résultat du scan
export const QRScanResult: React.FC<{
  data: string;
  onRescan?: () => void;
  onValidate?: (data: string) => void;
}> = ({ data, onRescan, onValidate }) => {
  const [isValid, setIsValid] = useState(false);

  React.useEffect(() => {
    // Valider le format du QR code
    const serialPatterns = [
      /^SN:/,
      /^[A-Z]{2,4}\d{6,12}$/,
      /^\d{10,15}$/
    ];
    
    setIsValid(serialPatterns.some(pattern => pattern.test(data)));
  }, [data]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isValid ? (
            <Check className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          )}
          Résultat du scan
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm font-mono break-all">{data}</p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={isValid ? 'default' : 'secondary'}>
            {isValid ? 'Valide' : 'À vérifier'}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {isValid ? 'Format de numéro de série reconnu' : 'Format non standard'}
          </span>
        </div>

        <div className="flex gap-2">
          {onRescan && (
            <Button variant="outline" onClick={onRescan} className="flex-1">
              <Scan className="h-4 w-4 mr-2" />
              Scanner à nouveau
            </Button>
          )}
          {onValidate && isValid && (
            <Button onClick={() => onValidate(data)} className="flex-1">
              <Check className="h-4 w-4 mr-2" />
              Valider
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};