import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import { env } from '@/config/env';
import { ticketService } from './ticketService';

class EmailService {
  private client: Client | null = null;

  constructor() {
    this.initializeClient();
  }

  private async initializeClient() {
    const settings = await prisma.notificationSettings.findFirst();
    
    if (settings?.useGraphApi && settings.graphClientId && settings.graphClientSecret && settings.graphTenantId) {
      try {
        const credential = new ClientSecretCredential(
          settings.graphTenantId,
          settings.graphClientId,
          settings.graphClientSecret
        );
        
        this.client = Client.init({
          authProvider: (done) => {
            credential.getToken('https://graph.microsoft.com/.default')
              .then(token => done(null, token.token))
              .catch(err => done(err, null));
          },
        });
        
        logger.info('Microsoft Graph client initialized');
      } catch (error) {
        logger.error('Failed to initialize Graph client:', error);
      }
    }
  }

  async ingestEmails() {
    try {
      if (!this.client) {
        logger.warn('Graph client not initialized');
        return;
      }

      // Get emails from inbox with support-related subject
      const messages = await this.client
        .api('/me/mailFolders/inbox/messages')
        .top(50)
        .filter("isRead eq false and subject ne null")
        .select('id,subject,bodyPreview,from,receivedDateTime')
        .get();

      logger.info(`Found ${messages.value.length} unread emails`);

      for (const message of messages.value) {
        await this.processEmail(message);
      }
    } catch (error) {
      logger.error('Failed to ingest emails:', error);
    }
  }

  private async processEmail(message: any) {
    try {
      const subject = message.subject;
      const from = message.from.emailAddress;
      const body = message.bodyPreview;

      // Find or create user
      let user = await prisma.user.findUnique({
        where: { email: from.address },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: from.address,
            name: from.name || from.address,
            role: 'USER',
            authProvider: 'LOCAL',
          },
        });
      }

      // Check if this is a reply to existing ticket (subject contains ticket number)
      const ticketNumberMatch = subject.match(/#(\d+)/);
      
      if (ticketNumberMatch) {
        const ticketNumber = parseInt(ticketNumberMatch[1]);
        const ticket = await prisma.ticket.findFirst({
          where: { ticketNumber },
        });

        if (ticket) {
          // Add as response
          await ticketService.addResponse(ticket.id, user.id, body, false);
          logger.info(`Email added as response to ticket #${ticketNumber}`);
          
          // Mark email as read
          if (this.client) {
            await this.client.api(`/me/messages/${message.id}`).update({ isRead: true });
          }
          return;
        }
      }

      // Create new ticket
      const ticket = await ticketService.createTicket({
        subject,
        description: body,
        customerId: user.id,
        source: 'EMAIL',
      });

      logger.info(`New ticket created from email: #${ticket.ticketNumber}`);

      // Mark email as read
      if (this.client) {
        await this.client.api(`/me/messages/${message.id}`).update({ isRead: true });
      }
    } catch (error) {
      logger.error('Failed to process email:', error);
    }
  }

  async sendEmail(to: string, subject: string, body: string) {
    try {
      if (!this.client) {
        throw new Error('Graph client not initialized');
      }

      await this.client.api('/me/sendMail').post({
        message: {
          subject,
          body: {
            contentType: 'HTML',
            content: body,
          },
          toRecipients: [
            {
              emailAddress: {
                address: to,
              },
            },
          ],
        },
      });

      logger.info(`Email sent to ${to}`);
    } catch (error) {
      logger.error('Failed to send email:', error);
      throw error;
    }
  }
}

export const emailService = new EmailService();
