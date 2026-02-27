'use client';

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketOptions {
  autoConnect?: boolean;
}

export const useSocket = (options: SocketOptions = {}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { autoConnect = true } = options;

  useEffect(() => {
    if (!autoConnect) return;

    // Connect to the custom Socket.IO server
    const socketInstance = io({
      path: '/api/socketio',
      transports: ['websocket', 'polling'], // Use full path logic defined in server.ts
      autoConnect: true,
      reconnectionAttempts: 5,
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setIsConnected(true);
      setError(null);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError(err.message);
      setIsConnected(false);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [autoConnect]);

  const connect = useCallback(() => {
    if (socket && !Math.abs(socket.connected ? 1 : 0)) { // workaround for socket.connected boolean
      socket.connect();
    }
  }, [socket]);

  const disconnect = useCallback(() => {
    if (socket && socket.connected) {
      socket.disconnect();
    }
  }, [socket]);

  const send = useCallback((event: string, data: any) => {
    if (socket && socket.connected) {
      socket.emit(event, data);
    }
  }, [socket]);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback);
    }
  }, [socket]);

  const off = useCallback((event: string, callback?: (data: any) => void) => {
    if (socket) {
      if (callback) {
        socket.off(event, callback);
      } else {
        socket.off(event);
      }
    }
  }, [socket]);

  const joinTicketRoom = useCallback((ticketId: string) => {
    if (socket && socket.connected) {
      socket.emit('join_ticket_room', ticketId);
    }
  }, [socket]);

  const leaveTicketRoom = useCallback((ticketId: string) => {
    if (socket && socket.connected) {
      socket.emit('leave_ticket_room', ticketId);
    }
  }, [socket]);

  const joinUserRoom = useCallback((userId: string) => {
    if (socket && socket.connected) {
      socket.emit('join_user_room', userId);
    }
  }, [socket]);

  const joinAgentRoom = useCallback((agentId: string) => {
    if (socket && socket.connected) {
      socket.emit('join_agent_room', agentId);
    }
  }, [socket]);

  const sendTypingStart = useCallback((ticketId: string, userId: string) => {
    if (socket && socket.connected) {
      socket.emit('typing_start', { ticketId, userId });
    }
  }, [socket]);

  const sendTypingStop = useCallback((ticketId: string, userId: string) => {
    if (socket && socket.connected) {
      socket.emit('typing_stop', { ticketId, userId });
    }
  }, [socket]);

  // Online indicator helper
  const declareOnline = useCallback((userId: string, role: string) => {
    if (socket && socket.connected) {
      socket.emit('declare_online', { userId, role });
    }
  }, [socket]);

  return {
    socket,
    isConnected,
    error,
    connect,
    disconnect,
    send,
    on,
    off,
    joinTicketRoom,
    leaveTicketRoom,
    joinUserRoom,
    joinAgentRoom,
    sendTypingStart,
    sendTypingStop,
    declareOnline,
  };
};

export default useSocket;