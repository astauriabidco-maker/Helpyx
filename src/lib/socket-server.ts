import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';
import { setupSocket, setServer } from './socket';

export const config = {
  api: {
    bodyParser: false,
  },
};

const SocketHandler = (req: NextApiRequest, res: NextApiResponse & { socket: any }) => {
  if (res.socket.server.io) {
    console.log('Socket.io already initialized');
    res.end();
    return;
  }

  console.log('Initializing Socket.io server...');
  
  const httpServer: NetServer = res.socket.server as any;
  const io = new ServerIO(httpServer, {
    path: '/api/socket/io',
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Store the server instance globally
  setServer(io);
  
  // Setup socket handlers
  setupSocket(io);

  res.socket.server.io = io;
  res.end();
};

export default SocketHandler;