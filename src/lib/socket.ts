import { Server } from 'socket.io';
import { db } from '@/lib/db';
import { NextApiRequest, NextApiResponse } from 'next';

interface NotificationData {
  type: 'ticket_assigned' | 'ticket_updated' | 'comment_added' | 'ticket_closed' | 'ticket_escalated';
  ticketId: string;
  ticketNumber: string;
  userId: string;
  message: string;
  data?: any;
}

// Global Socket.io server instance
let io: Server | null = null;

export const getServer = (): Server | null => {
  return io;
};

export const setServer = (server: Server): void => {
  io = server;
};

export const setupSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Join user to their personal room for notifications
    socket.on('join_user_room', (userId: string) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Join agent to their room for ticket notifications
    socket.on('join_agent_room', (agentId: string) => {
      socket.join(`agent_${agentId}`);
      console.log(`Agent ${agentId} joined their room`);
    });

    // Join ticket room for real-time updates
    socket.on('join_ticket_room', (ticketId: string) => {
      socket.join(`ticket_${ticketId}`);
      console.log(`Client joined ticket room: ${ticketId}`);
    });

    // AR/VR Session Management
    socket.on('join-ar-session', async (data: { sessionId: string; userType: 'agent' | 'client' }) => {
      socket.join(`ar_session_${data.sessionId}`);
      console.log(`${data.userType} joined AR session: ${data.sessionId}`);
      
      // Notify other participants
      socket.to(`ar_session_${data.sessionId}`).emit('participant_joined', {
        sessionId: data.sessionId,
        userType: data.userType,
        socketId: socket.id
      });
    });

    socket.on('leave-ar-session', (data: { sessionId: string }) => {
      socket.leave(`ar_session_${data.sessionId}`);
      console.log(`Client left AR session: ${data.sessionId}`);
      
      // Notify other participants
      socket.to(`ar_session_${data.sessionId}`).emit('participant_left', {
        sessionId: data.sessionId,
        socketId: socket.id
      });
    });

    // AR Annotations
    socket.on('ar-annotation', async (data: { sessionId: string; annotation: any }) => {
      console.log('AR annotation received:', data);
      
      // Broadcast to all participants in the session
      socket.to(`ar_session_${data.sessionId}`).emit('ar-annotation-received', {
        sessionId: data.sessionId,
        annotation: {
          ...data.annotation,
          id: `annotation_${Date.now()}`,
          timestamp: new Date().toISOString()
        }
      });
    });

    // Expert Teleportation
    socket.on('expert-teleport-request', async (data: { expertId: string; clientId: string; sessionType: 'vr' | 'desktop' }) => {
      console.log('Expert teleport request:', data);
      
      // Create notification for expert
      socket.to(`user_${data.expertId}`).emit('expert-teleport-offer', {
        requestId: `teleport_${Date.now()}`,
        expertId: data.expertId,
        clientId: data.clientId,
        sessionType: data.sessionType,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('expert-teleport-accept', async (data: { requestId: string; expertId: string; clientId: string }) => {
      console.log('Expert teleport accepted:', data);
      
      // Create teleport session
      const sessionId = `teleport_session_${Date.now()}`;
      
      // Notify both parties
      socket.to(`user_${data.clientId}`).emit('teleport-session-created', {
        requestId: data.requestId,
        sessionId,
        expertId: data.expertId,
        status: 'active'
      });
      
      socket.to(`user_${data.expertId}`).emit('teleport-session-created', {
        requestId: data.requestId,
        sessionId,
        clientId: data.clientId,
        status: 'active'
      });
    });

    // VR Motion Data
    socket.on('vr-motion-data', async (data: { sessionId: string; motionData: any }) => {
      // Broadcast motion data to other participants (for shared VR experiences)
      socket.to(`ar_session_${data.sessionId}`).emit('vr-motion-update', {
        sessionId: data.sessionId,
        motionData: data.motionData,
        timestamp: new Date().toISOString()
      });
    });

    // VR Training
    socket.on('vr-training-start', async (data: { userId: string; trainingId: string }) => {
      console.log('VR training started:', data);
      
      // Join training room
      socket.join(`vr_training_${data.trainingId}`);
      
      // Notify user of training start
      socket.to(`user_${data.userId}`).emit('vr-training-started', {
        trainingId: data.trainingId,
        sessionId: `vr_training_${Date.now()}`,
        status: 'in_progress',
        timestamp: new Date().toISOString()
      });
    });

    socket.on('vr-training-progress', async (data: { trainingId: string; stepId: string; progress: number; timeSpent: number }) => {
      console.log('VR training progress:', data);
      
      // Broadcast progress to training room
      socket.to(`vr_training_${data.trainingId}`).emit('training-progress-updated', {
        trainingId: data.trainingId,
        stepId: data.stepId,
        progress: data.progress,
        timeSpent: data.timeSpent,
        timestamp: new Date().toISOString()
      });
    });

    // Connection Quality Monitoring
    socket.on('connection-quality', async (data: { sessionId: string; quality: number; latency: number }) => {
      console.log('Connection quality update:', data);
      
      // Broadcast quality metrics to session participants
      socket.to(`ar_session_${data.sessionId}`).emit('connection-quality-update', {
        sessionId: data.sessionId,
        quality: data.quality,
        latency: data.latency,
        timestamp: new Date().toISOString()
      });
    });

    // Leave ticket room
    socket.on('leave_ticket_room', (ticketId: string) => {
      socket.leave(`ticket_${ticketId}`);
      console.log(`Client left ticket room: ${ticketId}`);
    });

    // Handle typing indicators
    socket.on('typing_start', (data: { ticketId: string; userId: string }) => {
      socket.to(`ticket_${data.ticketId}`).emit('user_typing', {
        userId: data.userId,
        isTyping: true
      });
    });

    socket.on('typing_stop', (data: { ticketId: string; userId: string }) => {
      socket.to(`ticket_${data.ticketId}`).emit('user_typing', {
        userId: data.userId,
        isTyping: false
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to IT Support System',
      timestamp: new Date().toISOString(),
    });
  });
};

// Helper functions to send notifications
export const sendNotificationToUser = (io: Server, userId: string, notification: NotificationData) => {
  io.to(`user_${userId}`).emit('notification', {
    ...notification,
    timestamp: new Date().toISOString(),
  });
};

export const sendNotificationToAgent = (io: Server, agentId: string, notification: NotificationData) => {
  io.to(`agent_${agentId}`).emit('notification', {
    ...notification,
    timestamp: new Date().toISOString(),
  });
};

export const sendTicketUpdate = (io: Server, ticketId: string, update: any) => {
  io.to(`ticket_${ticketId}`).emit('ticket_update', {
    ...update,
    timestamp: new Date().toISOString(),
  });
};

export const sendToAllAgents = (io: Server, notification: NotificationData) => {
  io.emit('agent_notification', {
    ...notification,
    timestamp: new Date().toISOString(),
  });
};

// Specific notification functions
export const notifyTicketAssigned = (io: Server, ticketId: string, ticketNumber: string, agentId: string, clientId: string) => {
  // Notify the assigned agent
  sendNotificationToAgent(io, agentId, {
    type: 'ticket_assigned',
    ticketId,
    ticketNumber,
    userId: agentId,
    message: `Nouveau ticket ${ticketNumber} vous a été assigné`,
    data: { ticketId, ticketNumber }
  });

  // Notify the client
  sendNotificationToUser(io, clientId, {
    type: 'ticket_assigned',
    ticketId,
    ticketNumber,
    userId: clientId,
    message: `Votre ticket ${ticketNumber} a été assigné à un technicien`,
    data: { ticketId, ticketNumber }
  });
};

export const notifyTicketUpdated = (io: Server, ticketId: string, ticketNumber: string, status: string, assignedToId?: string) => {
  const message = `Le ticket ${ticketNumber} a été mis à jour: ${getStatusText(status)}`;
  
  if (assignedToId) {
    sendNotificationToAgent(io, assignedToId, {
      type: 'ticket_updated',
      ticketId,
      ticketNumber,
      userId: assignedToId,
      message,
      data: { ticketId, ticketNumber, status }
    });
  }

  // Send to all agents monitoring this ticket
  sendTicketUpdate(io, ticketId, {
    type: 'status_updated',
    ticketId,
    ticketNumber,
    status,
    message
  });
};

export const notifyCommentAdded = (io: Server, ticketId: string, ticketNumber: string, comment: any, assignedToId?: string) => {
  // Send to ticket room for real-time updates
  sendTicketUpdate(io, ticketId, {
    type: 'comment_added',
    ticketId,
    ticketNumber,
    comment,
    message: `Nouveau commentaire ajouté au ticket ${ticketNumber}`
  });

  // Notify assigned agent if it's a client comment
  if (assignedToId && comment.author.role === 'CLIENT') {
    sendNotificationToAgent(io, assignedToId, {
      type: 'comment_added',
      ticketId,
      ticketNumber,
      userId: assignedToId,
      message: `Nouveau commentaire client sur le ticket ${ticketNumber}`,
      data: { ticketId, ticketNumber, commentId: comment.id }
    });
  }
};

export const notifyTicketClosed = (io: Server, ticketId: string, ticketNumber: string, clientId: string, assignedToId?: string) => {
  // Notify client
  sendNotificationToUser(io, clientId, {
    type: 'ticket_closed',
    ticketId,
    ticketNumber,
    userId: clientId,
    message: `Votre ticket ${ticketNumber} a été résolu et fermé`,
    data: { ticketId, ticketNumber }
  });

  // Notify assigned agent
  if (assignedToId) {
    sendNotificationToAgent(io, assignedToId, {
      type: 'ticket_closed',
      ticketId,
      ticketNumber,
      userId: assignedToId,
      message: `Ticket ${ticketNumber} marqué comme résolu`,
      data: { ticketId, ticketNumber }
    });
  }
};

export const notifyTicketEscalated = (io: Server, ticketId: string, ticketNumber: string, priority: string) => {
  // Send to all agents for high priority tickets
  sendToAllAgents(io, {
    type: 'ticket_escalated',
    ticketId,
    ticketNumber,
    userId: 'all_agents',
    message: `Ticket ${ticketNumber} escaladé - Priorité: ${getPriorityText(priority)}`,
    data: { ticketId, ticketNumber, priority }
  });
};

// Helper functions
const getStatusText = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'OPEN': 'Ouvert',
    'DIAGNOSIS': 'En diagnostic',
    'REPAIR': 'En réparation',
    'FIXED': 'Résolu',
    'CLOSED': 'Fermé'
  };
  return statusMap[status] || status;
};

const getPriorityText = (priority: string): string => {
  const priorityMap: { [key: string]: string } = {
    'LOW': 'Basse',
    'MEDIUM': 'Moyenne',
    'HIGH': 'Haute',
    'CRITICAL': 'Critique'
  };
  return priorityMap[priority] || priority;
};