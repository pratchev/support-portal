import Redis from 'ioredis';
import { Queue, Worker } from 'bullmq';
import { logger } from '@/utils/logger';

const redisConnection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redisConnection.on('connect', () => {
  logger.info('Connected to Redis');
});

redisConnection.on('error', (error) => {
  logger.error('Redis connection error:', error);
});

export const redis = redisConnection;

// Queue definitions
export const emailQueue = new Queue('email', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

export const aiAnalysisQueue = new Queue('ai-analysis', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
});

export const emailIngestionQueue = new Queue('email-ingestion', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 3000,
    },
  },
});

export { Queue, Worker };
