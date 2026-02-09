import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';

interface JwtUserPayload {
  id: string;
  email: string;
  role: string;
}

export const initializeWebSocket = (server: HTTPServer) => {
  const io = new Server(server, {
    cors: {
      origin: env.CORS_ORIGIN.split(','),
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication required'));
    }
    
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtUserPayload;
      socket.data.user = decoded;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    logger.info(`User connected: ${user.email} (${socket.id})`);
    
    // Join user-specific room
    socket.join(`user:${user.id}`);
    
    // Join role-specific room
    socket.join(`role:${user.role}`);
    
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${user.email} (${socket.id})`);
    });
    
    // Subscribe to ticket updates
    socket.on('subscribe:ticket', (ticketId: string) => {
      socket.join(`ticket:${ticketId}`);
      logger.info(`User ${user.email} subscribed to ticket ${ticketId}`);
    });
    
    // Unsubscribe from ticket updates
    socket.on('unsubscribe:ticket', (ticketId: string) => {
      socket.leave(`ticket:${ticketId}`);
      logger.info(`User ${user.email} unsubscribed from ticket ${ticketId}`);
    });
  });

  logger.info('WebSocket server initialized');
  return io;
};

// Helper function to emit events (import this in other files)
export const emitTicketUpdate = (io: Server, ticketId: string, data: Record<string, unknown>) => {
  io.to(`ticket:${ticketId}`).emit('ticket:update', data);
};

export const emitNewTicket = (io: Server, data: Record<string, unknown>) => {
  io.to('role:AGENT').to('role:ADMIN').emit('ticket:new', data);
};

export const emitNewResponse = (io: Server, ticketId: string, data: Record<string, unknown>) => {
  io.to(`ticket:${ticketId}`).emit('response:new', data);
};

export const emitNotification = (io: Server, userId: string, data: Record<string, unknown>) => {
  io.to(`user:${userId}`).emit('notification', data);
};
