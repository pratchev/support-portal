import { Worker } from 'bullmq';
import { redis } from '@/config/redis';
import { notificationService } from '@/services/notificationService';
import { logger } from '@/utils/logger';

interface EmailJobData {
  emailData: {
    to: string;
    subject: string;
    html: string;
    from?: string;
  };
  context?: {
    ticketId?: string;
    responseId?: string;
    agentId?: string;
  };
}

export const startNotificationWorker = () => {
  const worker = new Worker<EmailJobData>(
    'email',
    async (job) => {
      const { emailData } = job.data;
      logger.info(`Processing email notification to ${emailData.to}`);
      
      try {
        // The actual sending is handled through the service
        // This worker just processes the queue
        await (notificationService as any).sendEmail(emailData);
        logger.info(`Email notification sent to ${emailData.to}`);
      } catch (error) {
        logger.error(`Failed to send email to ${emailData.to}:`, error);
        throw error; // Retry on failure
      }
    },
    {
      connection: redis,
      concurrency: 3,
      limiter: {
        max: 10, // Max 10 emails
        duration: 1000, // per second
      },
    }
  );

  worker.on('completed', (job) => {
    logger.info(`Notification job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Notification job ${job?.id} failed:`, err);
  });

  logger.info('Notification worker started');
  return worker;
};
