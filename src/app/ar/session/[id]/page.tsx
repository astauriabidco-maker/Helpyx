'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Video, Mic, MicOff, VideoOff, PhoneOff, MonitorUp, MousePointer2,
    MessageSquare, Settings, Pencil, Camera, Maximize, Minimize
} from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';
import { useSession } from 'next-auth/react';

export default function ARVisioSession() {
    const params = useParams();
    const searchParams = useSearchParams();
    const { data: sessionData } = useSession();
    const sessionId = params.id as string;
    const role = searchParams.get('role') || 'client'; // 'client' (tenant) or 'expert'


    const [isMicOn, setIsMicOn] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isDrawMode, setIsDrawMode] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Hook temps réel
    const { send, isConnected } = useSocket();

    useEffect(() => {
        // Start "mock" camera
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then((stream) => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                })
                .catch((err) => console.log("Camera access error (Simulated or Denied)", err));
        }

        if (isConnected) {
            send('join_ar_session', { sessionId, userRole: role });
        }

        return () => {
            if (videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isConnected, send, role, sessionId]);

    const toggleMic = () => setIsMicOn(!isMicOn);
    const toggleVideo = () => setIsVideoOn(!isVideoOn);
    const endCall = () => {
        window.location.href = '/marketplace';
    };

    const handleDrawStart = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDrawMode || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        // Position
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();

        // Simulate drawing over socket
        send('ar_draw', { sessionId, point: { x, y }, color: 'red' });
    };

    return (
        <div className="h-screen flex flex-col bg-slate-950 text-white overflow-hidden">
            {/* Header Bar */}
            <div className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-6 z-10 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <h1 className="font-semibold text-lg flex items-center gap-2">
                        <Badge variant="destructive" className="animate-pulse">LIVE</Badge>
                        Session Assistée - {role === 'client' ? 'Expertise' : 'Poste Client'}
                    </h1>
                    <span className="text-sm font-mono text-slate-400 border border-slate-700 px-2 py-1 rounded">ID: {sessionId}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className={isConnected ? "text-emerald-400 text-sm flex items-center gap-1" : "text-amber-500 text-sm flex items-center gap-1"}>
                        <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`}></span>
                        {isConnected ? "Connecté" : "Connexion..."}
                    </span>
                </div>
            </div>

            {/* Main Container */}
            <div className="flex-1 flex relative">
                {/* Live Stream View */}
                <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden" onMouseDown={handleDrawStart}>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted // Mute own video
                        className={`max-w-full max-h-full object-contain ${!isVideoOn ? 'hidden' : ''}`}
                    />

                    {/* AR Overlay Layer */}
                    <canvas
                        ref={canvasRef}
                        width={1920}
                        height={1080}
                        className={`absolute inset-0 w-full h-full object-contain pointer-events-none ${isDrawMode ? 'cursor-crosshair' : ''}`}
                    />

                    {!isVideoOn && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
                            <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                                <Camera className="w-10 h-10 text-slate-500" />
                            </div>
                            <p className="text-slate-400">Caméra désactivée</p>
                        </div>
                    )}

                    {/* Small Self View (PIP) */}
                    <Card className="absolute top-6 right-6 w-48 h-32 bg-slate-800 border-slate-700 overflow-hidden shadow-2xl z-20">
                        <div className="w-full h-full bg-slate-700 flex items-center justify-center text-slate-400 text-sm">
                            Caméra {role === 'client' ? 'Client' : 'Expert'}
                        </div>
                    </Card>

                    {/* Instruction Overlay AR */}
                    {isDrawMode && (
                        <div className="absolute top-6 left-6 bg-blue-600/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm shadow-lg pointer-events-none animate-in fade-in slide-in-from-top-4">
                            Mode Pointeur AR activé. Cliquez sur l'écran pour indiquer une zone à l'interlocuteur.
                        </div>
                    )}
                </div>

                {/* Sidebar Tools */}
                <div className="w-72 border-l border-slate-800 bg-slate-900/80 backdrop-blur-md p-4 flex flex-col gap-6">

                    <div>
                        <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Outils d'Assistance</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant={isDrawMode ? 'default' : 'outline'}
                                className={`h-20 flex flex-col gap-2 ${isDrawMode ? 'bg-blue-600 border-transparent shadow-lg shadow-blue-900/50' : 'bg-slate-800 border-slate-700'}`}
                                onClick={() => setIsDrawMode(!isDrawMode)}
                            >
                                <Pencil className="w-5 h-5" />
                                Annoter AR
                            </Button>

                            <Button
                                variant="outline"
                                className="h-20 flex flex-col gap-2 bg-slate-800 border-slate-700"
                                onClick={() => setIsScreenSharing(!isScreenSharing)}
                            >
                                <MonitorUp className={`w-5 h-5 ${isScreenSharing ? 'text-blue-400' : ''}`} />
                                Écran
                            </Button>

                            <Button
                                variant="outline"
                                className="col-span-2 h-14 flex items-center justify-center gap-2 bg-slate-800 border-slate-700 hover:bg-slate-700"
                            >
                                <MessageSquare className="w-4 h-4" />
                                Ouvrir le Chat
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 rounded-lg border border-slate-800 bg-slate-950/50 p-4">
                        {/* Zone chat ou log technique */}
                        <h4 className="text-xs font-semibold text-slate-500 mb-2">Historique Diagnostics</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li className="flex gap-2">
                                <span className="text-emerald-400">10:12</span> Session démarrée
                            </li>
                            <li className="flex gap-2">
                                <span className="text-blue-400">10:14</span> Test de Bande Passante (Bon)
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Control Bar (Bottom) */}
            <div className="h-20 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-4 relative z-10 box-border">

                <div className="flex items-center gap-3 backdrop-blur-md bg-slate-950/40 p-2 rounded-2xl border border-slate-800/50">
                    <Button
                        variant={isMicOn ? 'secondary' : 'destructive'}
                        size="icon"
                        className="w-12 h-12 rounded-full"
                        onClick={toggleMic}
                    >
                        {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                    </Button>

                    <Button
                        variant={isVideoOn ? 'secondary' : 'destructive'}
                        size="icon"
                        className="w-12 h-12 rounded-full"
                        onClick={toggleVideo}
                    >
                        {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                    </Button>

                    <Button
                        variant="destructive"
                        className="h-12 px-6 rounded-full font-semibold ml-4 hover:bg-red-700 shadow-lg shadow-red-900/50"
                        onClick={endCall}
                    >
                        <PhoneOff className="w-5 h-5 mr-2" />
                        Raccrocher
                    </Button>
                </div>

                <div className="absolute right-6 flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white rounded-full">
                        <Settings className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-white rounded-full"
                        onClick={() => {
                            if (!document.fullscreenElement) {
                                document.documentElement.requestFullscreen();
                                setIsFullscreen(true);
                            } else {
                                document.exitFullscreen();
                                setIsFullscreen(false);
                            }
                        }}
                    >
                        {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}
