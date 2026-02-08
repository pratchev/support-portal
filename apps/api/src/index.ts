import http from 'http';
import app from './app';
import { env } from './config/env';
import { prisma } from './config/database';
import { redis } from './config/redis';
import { logger } from './utils/logger';
import { initializeWebSocket } from './websocket';
import { startNotificationWorker } from './jobs/notifications';
import { startAIAnalysisWorker } from './jobs/aiAnalysis';
import { startEmailIngestionWorker, scheduleEmailIngestion } from './jobs/emailIngestion';
import { ensureDirectory } from './utils/helpers';

const PORT = parseInt(env.PORT);
const server = http.createServer(app);

// Initialize WebSocket
const io = initializeWebSocket(server);

// Store io instance globally for use in other modules
(global as any).io = io;

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connected');

    // Test Redis connection
    await redis.ping();
    logger.info('✅ Redis connected');

    // Ensure upload directory exists
    await ensureDirectory(env.UPLOAD_DIR);
    await ensureDirectory('logs');
    logger.info('✅ Directories initialized');

    // Start background workers
    startNotificationWorker();
    startAIAnalysisWorker();
    startEmailIngestionWorker();
    logger.info('✅ Background workers started');

    // Schedule recurring jobs
    await scheduleEmailIngestion();
    logger.info('✅ Recurring jobs scheduled');

    // Start server
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📝 Environment: ${env.NODE_ENV}`);
      logger.info(`🌐 API: http://localhost:${PORT}/api`);
      logger.info(`💚 Health: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down gracefully...');
  
  server.close(async () => {
    try {
      await prisma.$disconnect();
      await redis.quit();
      logger.info('✅ Cleanup completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during cleanup:', error);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the server
startServer();
