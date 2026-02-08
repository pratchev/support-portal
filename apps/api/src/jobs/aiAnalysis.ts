import { Worker } from 'bullmq';
import { redis } from '@/config/redis';
import { aiService } from '@/services/aiService';
import { logger } from '@/utils/logger';

export const startAIAnalysisWorker = () => {
  const worker = new Worker(
    'ai-analysis',
    async (job) => {
      const { ticketId } = job.data;
      logger.info(`Processing AI analysis for ticket ${ticketId}`);
      
      try {
        // Analyze sentiment
        await aiService.analyzeTicketSentiment(ticketId);
        
        // Generate summary
        await aiService.generateSummary(ticketId);
        
        logger.info(`AI analysis completed for ticket ${ticketId}`);
      } catch (error) {
        logger.error(`AI analysis failed for ticket ${ticketId}:`, error);
        // Don't throw error - AI analysis failures shouldn't break the flow
      }
    },
    {
      connection: redis,
      concurrency: 2,
    }
  );

  worker.on('completed', (job) => {
    logger.info(`AI analysis job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`AI analysis job ${job?.id} failed:`, err);
  });

  logger.info('AI analysis worker started');
  return worker;
};
