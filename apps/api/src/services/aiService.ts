import { OpenAIClient, AzureKeyCredential } from '@azure/openai';
import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import { env } from '@/config/env';
import { SentimentScore } from '@prisma/client';

class AIService {
  private client: OpenAIClient | null = null;
  
  constructor() {
    if (env.AZURE_OPENAI_ENDPOINT && env.AZURE_OPENAI_API_KEY) {
      this.client = new OpenAIClient(
        env.AZURE_OPENAI_ENDPOINT,
        new AzureKeyCredential(env.AZURE_OPENAI_API_KEY)
      );
    } else {
      logger.warn('Azure OpenAI credentials not configured');
    }
  }

  async analyzeTicketSentiment(ticketId: string) {
    try {
      if (!this.client) {
        logger.warn('AI service not configured');
        return null;
      }
      
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
      });
      
      if (!ticket) {
        throw new Error('Ticket not found');
      }
      
      const prompt = `Analyze the sentiment of this support ticket:
      
Subject: ${ticket.subject}
Description: ${ticket.description}

Respond with only one word: VERY_NEGATIVE, NEGATIVE, NEUTRAL, POSITIVE, or VERY_POSITIVE`;

      const response = await this.client.getChatCompletions(
        env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4',
        [
          { role: 'system', content: 'You are a sentiment analysis assistant.' },
          { role: 'user', content: prompt },
        ]
      );
      
      const sentiment = response.choices[0]?.message?.content?.trim();
      
      if (sentiment) {
        await prisma.ticket.update({
          where: { id: ticketId },
          data: { sentimentScore: sentiment as SentimentScore },
        });
        
        logger.info(`Sentiment analyzed for ticket #${ticket.ticketNumber}: ${sentiment}`);
        return sentiment;
      }
      
      return null;
    } catch (error) {
      logger.error('Failed to analyze sentiment:', error);
      return null;
    }
  }

  async generateSummary(ticketId: string) {
    try {
      if (!this.client) {
        logger.warn('AI service not configured');
        return null;
      }
      
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
          responses: {
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
        },
      });
      
      if (!ticket) {
        throw new Error('Ticket not found');
      }
      
      const context = `
Subject: ${ticket.subject}
Description: ${ticket.description}

Recent responses:
${ticket.responses.map((r, i: number) => `${i + 1}. ${r.content}`).join('\n')}
`;

      const prompt = `Provide a concise 2-3 sentence summary of this support ticket and its current status:

${context}`;

      const response = await this.client.getChatCompletions(
        env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4',
        [
          { role: 'system', content: 'You are a support ticket summarization assistant.' },
          { role: 'user', content: prompt },
        ],
        { maxTokens: 150 }
      );
      
      const summary = response.choices[0]?.message?.content?.trim();
      
      if (summary) {
        await prisma.ticket.update({
          where: { id: ticketId },
          data: { aiSummary: summary },
        });
        
        logger.info(`Summary generated for ticket #${ticket.ticketNumber}`);
        return summary;
      }
      
      return null;
    } catch (error) {
      logger.error('Failed to generate summary:', error);
      return null;
    }
  }

  async generateResponseSuggestion(ticketId: string): Promise<string | null> {
    try {
      if (!this.client) {
        logger.warn('AI service not configured');
        return null;
      }
      
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
          responses: {
            orderBy: { createdAt: 'desc' },
            take: 3,
          },
        },
      });
      
      if (!ticket) {
        throw new Error('Ticket not found');
      }
      
      const context = `
Ticket: ${ticket.subject}
Description: ${ticket.description}
${ticket.responses.length > 0 ? `\nRecent conversation:\n${ticket.responses.map((r) => r.content).join('\n')}` : ''}
`;

      const prompt = `Based on this support ticket, suggest a helpful response:

${context}`;

      const response = await this.client.getChatCompletions(
        env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4',
        [
          { role: 'system', content: 'You are a helpful support agent assistant.' },
          { role: 'user', content: prompt },
        ],
        { maxTokens: 300 }
      );
      
      return response.choices[0]?.message?.content?.trim() || null;
    } catch (error) {
      logger.error('Failed to generate response suggestion:', error);
      return null;
    }
  }
}

export const aiService = new AIService();
