'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Headphones, 
  Users, 
  Camera, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff,
  Monitor,
  Smartphone,
  Zap,
  Wifi,
  WifiOff,
  MessageCircle,
  Share,
  ScreenShare,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useARVRSocket, useARAnnotations, useExpertTeleportation, useConnectionQuality } from '@/hooks/use-arvr-socket';

export default function ARSupportPage() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [sessionType, setSessionType] = useState<'ar' | 'vr' | 'desktop'>('desktop');
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  
  const { socket, isConnected, joinARSession } = useARVRSocket();
  const { annotations, clearAnnotations } = useARAnnotations(currentSession || '');
  const { teleportSession, incomingRequest, acceptRequest, rejectRequest, requestExpertTeleport } = useExpertTeleportation();
  const { quality, latency } = useConnectionQuality(currentSession || '');

  const sessionId = `session-${Date.now()}`;

  const startSession = (type: 'ar' | 'vr' | 'desktop') => {
    setSessionType(type);
    setCurrentSession(sessionId);
    setIsSessionActive(true);
    joinARSession(sessionId, 'agent');
  };

  const endSession = () => {
    setIsSessionActive(false);
    setCurrentSession(null);
    clearAnnotations();
  };

  const toggleAudio = () => setIsAudioEnabled(!isAudioEnabled);
  const toggleVideo = () => setIsVideoEnabled(!isVideoEnabled);
  const toggleScreenShare = () => setIsScreenSharing(!isScreenSharing);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Support AR/VR</h1>
              <p className="text-gray-600">Assistance immersive avec réalité augmentée et virtuelle</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center">
              {isConnected ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
              {isConnected ? 'Connecté' : 'Déconnecté'}
            </Badge>
            {currentSession && (
              <Badge variant="outline" className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Session: {currentSession.slice(-8)}
              </Badge>
            )}
          </div>
        </div>

        {!isSessionActive ? (
          /* Session Setup */
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Session Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Headphones className="w-5 h-5 mr-2" />
                  Type de Session
                </CardTitle>
                <CardDescription>
                  Choisissez le type de session d'assistance immersive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => startSession('desktop')}
                  className="w-full justify-start h-auto p-4"
                  variant="outline"
                >
                  <div className="flex items-center space-x-3">
                    <Monitor className="w-8 h-8 text-blue-500" />
                    <div className="text-left">
                      <div className="font-semibold">Support Desktop</div>
                      <div className="text-sm text-gray-600">Partage d'écran et annotations</div>
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={() => startSession('ar')}
                  className="w-full justify-start h-auto p-4"
                  variant="outline"
                >
                  <div className="flex items-center space-x-3">
                    <Camera className="w-8 h-8 text-green-500" />
                    <div className="text-left">
                      <div className="font-semibold">Réalité Augmentée</div>
                      <div className="text-sm text-gray-600">Annotations AR sur objets réels</div>
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={() => startSession('vr')}
                  className="w-full justify-start h-auto p-4"
                  variant="outline"
                >
                  <div className="flex items-center space-x-3">
                    <Headphones className="w-8 h-8 text-purple-500" />
                    <div className="text-left">
                      <div className="font-semibold">Réalité Virtuelle</div>
                      <div className="text-sm text-gray-600">Environnement immersif 3D</div>
                    </div>
                  </div>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Actions Rapides
                </CardTitle>
                <CardDescription>
                  Fonctionnalités disponibles pendant la session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-sm">Chat temps réel</span>
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                    <Camera className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Annotations AR</span>
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600" />
                    <span className="text-sm">Téléportation expert</span>
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg">
                    <ScreenShare className="w-5 h-5 text-orange-600" />
                    <span className="text-sm">Partage d'écran</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Active Session */
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Session Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video/AR Area */}
              <Card className="h-96">
                <CardContent className="p-6 h-full">
                  <div className="relative h-full bg-gray-900 rounded-lg overflow-hidden">
                    {sessionType === 'desktop' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Monitor className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p>Session de partage d'écran</p>
                        </div>
                      </div>
                    )}
                    {sessionType === 'ar' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p>Vue caméra AR active</p>
                        </div>
                      </div>
                    )}
                    {sessionType === 'vr' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Headphones className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p>Environnement VR immersif</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Connection Quality Overlay */}
                    <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
                      Qualité: {quality}% | Latence: {latency}ms
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Controls */}
              <Card>
                <CardHeader>
                  <CardTitle>Contrôles de Session</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={toggleAudio}
                      variant={isAudioEnabled ? "default" : "destructive"}
                      size="lg"
                    >
                      {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                    </Button>
                    <Button
                      onClick={toggleVideo}
                      variant={isVideoEnabled ? "default" : "destructive"}
                      size="lg"
                    >
                      {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                    </Button>
                    <Button
                      onClick={toggleScreenShare}
                      variant={isScreenSharing ? "default" : "outline"}
                      size="lg"
                    >
                      <ScreenShare className="w-5 h-5" />
                    </Button>
                    <Button onClick={endSession} variant="destructive" size="lg">
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Terminer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Annotations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Annotations
                    <Badge variant="outline">{annotations.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {annotations.length === 0 ? (
                    <p className="text-gray-500 text-sm">Aucune annotation</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {annotations.map((annotation, index) => (
                        <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                          {annotation.content}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Expert Teleportation */}
              <Card>
                <CardHeader>
                  <CardTitle>Téléportation Expert</CardTitle>
                </CardHeader>
                <CardContent>
                  {incomingRequest ? (
                    <div className="space-y-3">
                      <Alert>
                        <Users className="h-4 w-4" />
                        <AlertDescription>
                          Demande de téléportation reçue
                        </AlertDescription>
                      </Alert>
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => acceptRequest(incomingRequest.id, incomingRequest.expertId, incomingRequest.clientId)}>
                          Accepter
                        </Button>
                        <Button size="sm" variant="outline" onClick={rejectRequest}>
                          Refuser
                        </Button>
                      </div>
                    </div>
                  ) : teleportSession ? (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Session de téléportation active
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <p className="text-gray-500 text-sm">En attente de demande...</p>
                  )}
                </CardContent>
              </Card>

              {/* Session Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Type:</span>
                    <Badge variant="outline">{sessionType}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Session:</span>
                    <span className="font-mono text-xs">{currentSession?.slice(-8)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Qualité:</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={quality} className="w-16" />
                      <span>{quality}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}