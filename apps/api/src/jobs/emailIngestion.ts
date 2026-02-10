import { Worker } from 'bullmq';
import { redis } from '@/config/redis';
import { emailService } from '@/services/emailService';
import { logger } from '@/utils/logger';

export const startEmailIngestionWorker = () => {
  const worker = new Worker(
    'email-ingestion',
    async (_job) => {
      logger.info('Processing email ingestion job');
      
      try {
        await emailService.ingestEmails();
        logger.info('Email ingestion completed');
      } catch (error) {
        logger.error('Email ingestion failed:', error);
        throw error;
      }
    },
    {
      connection: redis,
      concurrency: 1,
    }
  );

  worker.on('completed', (job) => {
    logger.info(`Email ingestion job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Email ingestion job ${job?.id} failed:`, err);
  });

  logger.info('Email ingestion worker started');
  return worker;
};

// Schedule email ingestion every 5 minutes
export const scheduleEmailIngestion = async () => {
  const { emailIngestionQueue } = await import('@/config/redis');
  
  await emailIngestionQueue.add(
    'ingest-emails',
    {},
    {
      repeat: {
        pattern: '*/5 * * * *', // Every 5 minutes
      },
    }
  );
  
  logger.info('Email ingestion scheduled');
};
