'use client';

import { useEffect, useState } from 'react';

interface MockSocketOptions {
  autoConnect?: boolean;
}

interface MockSocketReturn {
  socket: any;
  isConnected: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  send: (data: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback: (data: any) => void) => void;
  joinTicketRoom: (ticketId: string) => void;
  leaveTicketRoom: (ticketId: string) => void;
  joinUserRoom: (userId: string) => void;
  joinAgentRoom: (agentId: string) => void;
  sendTypingStart: (ticketId: string, userId: string) => void;
  sendTypingStop: (ticketId: string, userId: string) => void;
}

// Mock Socket.io implementation for development
export const useSocket = (options: MockSocketOptions = {}): MockSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventListeners, setEventListeners] = useState<Map<string, Set<(data: any) => void>>>(new Map());

  const { autoConnect = true } = options;

  const connect = () => {
    console.log('Mock socket: Connecting...');
    setTimeout(() => {
      setIsConnected(true);
      setError(null);
      console.log('Mock socket: Connected');
      
      // Simulate welcome message
      setTimeout(() => {
        const listeners = eventListeners.get('connected');
        if (listeners) {
          listeners.forEach(callback => callback({
            message: 'Connected to IT Support System (Mock)',
            timestamp: new Date().toISOString(),
          }));
        }
      }, 100);
    }, 500);
  };

  const disconnect = () => {
    console.log('Mock socket: Disconnecting...');
    setIsConnected(false);
  };

  const send = (data: any) => {
    if (!isConnected) {
      console.warn('Mock socket: Not connected');
      return;
    }
    console.log('Mock socket: Sending data:', data);
  };

  const on = (event: string, callback: (data: any) => void) => {
    setEventListeners(prev => {
      const newListeners = new Map(prev);
      if (!newListeners.has(event)) {
        newListeners.set(event, new Set());
      }
      newListeners.get(event)!.add(callback);
      return newListeners;
    });
  };

  const off = (event: string, callback: (data: any) => void) => {
    setEventListeners(prev => {
      const newListeners = new Map(prev);
      const listeners = newListeners.get(event);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          newListeners.delete(event);
        }
      }
      return newListeners;
    });
  };

  const joinTicketRoom = (ticketId: string) => {
    console.log(`Mock socket: Joining ticket room ${ticketId}`);
  };

  const leaveTicketRoom = (ticketId: string) => {
    console.log(`Mock socket: Leaving ticket room ${ticketId}`);
  };

  const joinUserRoom = (userId: string) => {
    console.log(`Mock socket: Joining user room ${userId}`);
  };

  const joinAgentRoom = (agentId: string) => {
    console.log(`Mock socket: Joining agent room ${agentId}`);
  };

  const sendTypingStart = (ticketId: string, userId: string) => {
    console.log(`Mock socket: User ${userId} started typing in ticket ${ticketId}`);
    
    // Simulate typing notification
    setTimeout(() => {
      const listeners = eventListeners.get('user_typing');
      if (listeners) {
        listeners.forEach(callback => callback({
          userId,
          isTyping: true
        }));
      }
    }, 100);
  };

  const sendTypingStop = (ticketId: string, userId: string) => {
    console.log(`Mock socket: User ${userId} stopped typing in ticket ${ticketId}`);
    
    // Simulate typing notification
    setTimeout(() => {
      const listeners = eventListeners.get('user_typing');
      if (listeners) {
        listeners.forEach(callback => callback({
          userId,
          isTyping: false
        }));
      }
    }, 100);
  };

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect]);

  return {
    socket: { connected: isConnected }, // Mock socket object
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
  };
};

export default useSocket;