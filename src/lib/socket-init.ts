// Socket.io configuration for Next.js 15 App Router
import { Server as NetServer } from 'http';
import { Server as ServerIO } from 'socket.io';
import { setupSocket, setServer } from '@/lib/socket';

// This is a workaround for Next.js 15 App Router
// Socket.io needs to be initialized differently

export const initSocket = (server: NetServer) => {
  if (!server) {
    console.error('Server instance is required for Socket.io initialization');
    return null;
  }

  try {
    const io = new ServerIO(server, {
      path: '/api/socketio',
      addTrailingSlash: false,
      transports: ['polling', 'websocket'],
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    setupSocket(io);
    setServer(io);
    
    console.log('Socket.io server initialized successfully');
    return io;
  } catch (error) {
    console.error('Failed to initialize Socket.io server:', error);
    return null;
  }
};

export default initSocket;