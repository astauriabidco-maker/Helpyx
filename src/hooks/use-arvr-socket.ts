'use client'

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface UseARVRSocketReturn {
  socket: Socket | null
  isConnected: boolean
  error: string | null
  joinARSession: (sessionId: string, userType: 'agent' | 'client') => void
  sendAnnotation: (sessionId: string, annotation: any) => void
  requestExpertTeleport: (expertId: string, clientId: string, sessionType: 'vr' | 'desktop') => void
  acceptExpertTeleport: (requestId: string, expertId: string, clientId: string) => void
  sendVRMotionData: (sessionId: string, motionData: any) => void
  startVRTraining: (userId: string, trainingId: string) => void
  updateTrainingProgress: (trainingId: string, stepId: string, progress: number, timeSpent: number) => void
  updateConnectionQuality: (sessionId: string, quality: number, latency: number) => void
}

export const useARVRSocket = (): UseARVRSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Initialiser la connexion WebSocket
    const socketInstance = io({
      path: '/api/socket/io',
      addTrailingSlash: false,
      transports: ['websocket', 'polling']
    })

    socketInstance.on('connect', () => {
      console.log('Connecté au serveur WebSocket AR/VR')
      setIsConnected(true)
      setError(null)
    })

    socketInstance.on('disconnect', () => {
      console.log('Déconnecté du serveur WebSocket AR/VR')
      setIsConnected(false)
    })

    socketInstance.on('connect_error', (err) => {
      console.error('Erreur de connexion WebSocket:', err)
      setError(err.message)
      setIsConnected(false)
    })

    setSocket(socketInstance)

    // Nettoyage
    return () => {
      socketInstance.disconnect()
    }
  }, [])

  // Rejoindre une session AR
  const joinARSession = (sessionId: string, userType: 'agent' | 'client') => {
    if (socket) {
      socket.emit('join-ar-session', { sessionId, userType })
    }
  }

  // Envoyer une annotation AR
  const sendAnnotation = (sessionId: string, annotation: any) => {
    if (socket) {
      socket.emit('ar-annotation', { sessionId, annotation })
    }
  }

  // Demander une téléportation d'expert
  const requestExpertTeleport = (expertId: string, clientId: string, sessionType: 'vr' | 'desktop') => {
    if (socket) {
      socket.emit('expert-teleport-request', { expertId, clientId, sessionType })
    }
  }

  // Accepter une téléportation d'expert
  const acceptExpertTeleport = (requestId: string, expertId: string, clientId: string) => {
    if (socket) {
      socket.emit('expert-teleport-accept', { requestId, expertId, clientId })
    }
  }

  // Envoyer les données de mouvement VR
  const sendVRMotionData = (sessionId: string, motionData: any) => {
    if (socket) {
      socket.emit('vr-motion-data', { sessionId, motionData })
    }
  }

  // Démarrer une formation VR
  const startVRTraining = (userId: string, trainingId: string) => {
    if (socket) {
      socket.emit('vr-training-start', { userId, trainingId })
    }
  }

  // Mettre à jour la progression de formation
  const updateTrainingProgress = (trainingId: string, stepId: string, progress: number, timeSpent: number) => {
    if (socket) {
      socket.emit('vr-training-progress', { trainingId, stepId, progress, timeSpent })
    }
  }

  // Mettre à jour la qualité de connexion
  const updateConnectionQuality = (sessionId: string, quality: number, latency: number) => {
    if (socket) {
      socket.emit('connection-quality', { sessionId, quality, latency })
    }
  }

  return {
    socket,
    isConnected,
    error,
    joinARSession,
    sendAnnotation,
    requestExpertTeleport,
    acceptExpertTeleport,
    sendVRMotionData,
    startVRTraining,
    updateTrainingProgress,
    updateConnectionQuality
  }
}

// Hook pour les annotations AR
export const useARAnnotations = (sessionId: string) => {
  const [annotations, setAnnotations] = useState<any[]>([])
  const { socket, isConnected } = useARVRSocket()

  useEffect(() => {
    if (!socket || !isConnected) return

    // Écouter les annotations reçues
    const handleAnnotationReceived = (data: any) => {
      setAnnotations(prev => [...prev, data.annotation])
    }

    socket.on('ar-annotation-received', handleAnnotationReceived)

    return () => {
      socket.off('ar-annotation-received', handleAnnotationReceived)
    }
  }, [socket, isConnected, sessionId])

  const clearAnnotations = () => {
    setAnnotations([])
  }

  return {
    annotations,
    clearAnnotations
  }
}

// Hook pour la téléportation d'expert
export const useExpertTeleportation = () => {
  const [teleportSession, setTeleportSession] = useState<any>(null)
  const [incomingRequest, setIncomingRequest] = useState<any>(null)
  const { socket, isConnected, requestExpertTeleport, acceptExpertTeleport } = useARVRSocket()

  useEffect(() => {
    if (!socket || !isConnected) return

    // Écouter les offres de téléportation
    const handleTeleportOffer = (data: any) => {
      setIncomingRequest(data)
    }

    // Écouter la création de session
    const handleSessionCreated = (data: any) => {
      setTeleportSession(data)
    }

    socket.on('expert-teleport-offer', handleTeleportOffer)
    socket.on('teleport-session-created', handleSessionCreated)

    return () => {
      socket.off('expert-teleport-offer', handleTeleportOffer)
      socket.off('teleport-session-created', handleSessionCreated)
    }
  }, [socket, isConnected])

  const acceptRequest = (requestId: string, expertId: string, clientId: string) => {
    acceptExpertTeleport(requestId, expertId, clientId)
    setIncomingRequest(null)
  }

  const rejectRequest = () => {
    setIncomingRequest(null)
  }

  const endSession = () => {
    setTeleportSession(null)
  }

  return {
    teleportSession,
    incomingRequest,
    requestExpertTeleport,
    acceptRequest,
    rejectRequest,
    endSession
  }
}

// Hook pour la formation VR
export const useVRTraining = (trainingId?: string) => {
  const [training, setTraining] = useState<any>(null)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const { socket, isConnected, startVRTraining, updateTrainingProgress } = useARVRSocket()

  useEffect(() => {
    if (!socket || !isConnected) return

    // Écouter le démarrage de formation
    const handleTrainingStarted = (data: any) => {
      if (data.trainingId === trainingId) {
        setTraining(data)
        setProgress(0)
        setCurrentStep(0)
      }
    }

    // Écouter les mises à jour de progression
    const handleProgressUpdated = (data: any) => {
      if (data.stepId) {
        setProgress(data.progress)
        // Logique pour déterminer l'étape actuelle basée sur la progression
      }
    }

    socket.on('vr-training-started', handleTrainingStarted)
    socket.on('training-progress-updated', handleProgressUpdated)

    return () => {
      socket.off('vr-training-started', handleTrainingStarted)
      socket.off('training-progress-updated', handleProgressUpdated)
    }
  }, [socket, isConnected, trainingId])

  const startTraining = (userId: string) => {
    if (trainingId) {
      startVRTraining(userId, trainingId)
    }
  }

  const updateProgress = (stepId: string, stepProgress: number, timeSpent: number) => {
    if (trainingId) {
      updateTrainingProgress(trainingId, stepId, stepProgress, timeSpent)
    }
  }

  return {
    training,
    progress,
    currentStep,
    startTraining,
    updateProgress
  }
}

// Hook pour la qualité de connexion
export const useConnectionQuality = (sessionId: string) => {
  const [quality, setQuality] = useState(100)
  const [latency, setLatency] = useState(0)
  const { socket, isConnected, updateConnectionQuality } = useARVRSocket()

  useEffect(() => {
    if (!socket || !isConnected) return

    // Écouter les mises à jour de qualité
    const handleQualityUpdate = (data: any) => {
      if (data.sessionId === sessionId) {
        setQuality(data.quality)
        setLatency(data.latency)
      }
    }

    socket.on('connection-quality-update', handleQualityUpdate)

    return () => {
      socket.off('connection-quality-update', handleQualityUpdate)
    }
  }, [socket, isConnected, sessionId])

  // Envoyer périodiquement les métriques de qualité
  useEffect(() => {
    if (!sessionId) return

    const interval = setInterval(() => {
      // Simuler des métriques de qualité
      const simulatedQuality = Math.max(70, Math.min(100, quality + (Math.random() - 0.5) * 10))
      const simulatedLatency = Math.max(5, Math.min(50, latency + (Math.random() - 0.5) * 5))
      
      updateConnectionQuality(sessionId, simulatedQuality, simulatedLatency)
    }, 2000)

    return () => clearInterval(interval)
  }, [sessionId, quality, latency, updateConnectionQuality])

  return {
    quality,
    latency
  }
}