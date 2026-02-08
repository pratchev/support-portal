import nodemailer from 'nodemailer';
import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import { prisma } from '@/config/database';
import { emailQueue } from '@/config/redis';
import { logger } from '@/utils/logger';
import { 
  loadTemplate, 
  populateTemplate, 
  formatDate, 
  getPriorityColor,
  calculateSLA 
} from '@/utils/helpers';
import { env } from '@/config/env';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface NotificationContext {
  ticketId?: string;
  responseId?: string;
  agentId?: string;
  userId?: string;
}

class NotificationService {
  private async getNotificationSettings() {
    const settings = await prisma.notificationSettings.findFirst();
    if (!settings || !settings.emailEnabled) {
      throw new Error('Email notifications are disabled');
    }
    return settings;
  }

  private async getUserPreferences(userId: string) {
    let preferences = await prisma.userNotificationPreference.findUnique({
      where: { userId },
    });
    
    // Create default preferences if none exist
    if (!preferences) {
      preferences = await prisma.userNotificationPreference.create({
        data: { userId },
      });
    }
    
    return preferences;
  }

  private async getGraphClient(settings: any): Promise<Client | null> {
    if (!settings.useGraphApi || !settings.graphClientId || !settings.graphClientSecret || !settings.graphTenantId) {
      return null;
    }
    
    try {
      const credential = new ClientSecretCredential(
        settings.graphTenantId,
        settings.graphClientId,
        settings.graphClientSecret
      );
      
      // Note: This is a simplified version. In production, you'd need proper token handling
      return Client.init({
        authProvider: (done) => {
          credential.getToken('https://graph.microsoft.com/.default')
            .then(token => done(null, token.token))
            .catch(err => done(err, null));
        },
      });
    } catch (error) {
      logger.error('Failed to create Graph client:', error);
      return null;
    }
  }

  private async getSMTPTransporter(settings: any) {
    if (!settings.smtpHost || !settings.smtpPort) {
      throw new Error('SMTP configuration is incomplete');
    }
    
    return nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: settings.smtpSecure,
      auth: settings.smtpUser && settings.smtpPassword ? {
        user: settings.smtpUser,
        pass: settings.smtpPassword,
      } : undefined,
    });
  }

  private async sendEmailViaGraph(graphClient: Client, emailData: EmailData, settings: any) {
    const message = {
      message: {
        subject: emailData.subject,
        body: {
          contentType: 'HTML',
          content: emailData.html,
        },
        toRecipients: [
          {
            emailAddress: {
              address: emailData.to,
            },
          },
        ],
        from: {
          emailAddress: {
            address: emailData.from || settings.fromEmail,
            name: settings.fromName,
          },
        },
      },
    };
    
    await graphClient.api('/me/sendMail').post(message);
  }

  private async sendEmailViaSMTP(transporter: any, emailData: EmailData, settings: any) {
    await transporter.sendMail({
      from: emailData.from || `"${settings.fromName}" <${settings.fromEmail}>`,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
    });
  }

  private async sendEmail(emailData: EmailData) {
    const settings = await this.getNotificationSettings();
    
    try {
      // Try Microsoft Graph API first
      if (settings.useGraphApi) {
        const graphClient = await this.getGraphClient(settings);
        if (graphClient) {
          await this.sendEmailViaGraph(graphClient, emailData, settings);
          logger.info(`Email sent via Graph API to ${emailData.to}`);
          return;
        }
      }
      
      // Fallback to SMTP
      const transporter = await this.getSMTPTransporter(settings);
      await this.sendEmailViaSMTP(transporter, emailData, settings);
      logger.info(`Email sent via SMTP to ${emailData.to}`);
    } catch (error) {
      logger.error('Failed to send email:', error);
      throw error;
    }
  }

  private async queueEmail(emailData: EmailData, context: NotificationContext = {}) {
    await emailQueue.add('send-email', {
      emailData,
      context,
    });
    logger.info(`Email queued for ${emailData.to}`);
  }

  async sendTicketReplyNotification(ticketId: string, responseId: string) {
    try {
      const response = await prisma.response.findUnique({
        where: { id: responseId },
        include: {
          user: { select: { name: true, email: true } },
          ticket: {
            include: {
              customer: { 
                select: { id: true, name: true, email: true } 
              },
            },
          },
        },
      });
      
      if (!response || response.isInternal) {
        return; // Don't send notifications for internal responses
      }
      
      const ticket = response.ticket;
      const customer = ticket.customer;
      
      // Check user preferences
      const preferences = await this.getUserPreferences(customer.id);
      if (!preferences.emailOnTicketReply) {
        logger.info(`User ${customer.email} has disabled ticket reply notifications`);
        return;
      }
      
      // Load and populate template
      const baseTemplate = await loadTemplate('base.html');
      const contentTemplate = await loadTemplate('ticketReply.html');
      
      const content = populateTemplate(contentTemplate, {
        customerName: customer.name,
        ticketNumber: ticket.ticketNumber,
        ticketSubject: ticket.subject,
        agentName: response.user.name,
        replyDate: formatDate(response.createdAt),
        replyContent: response.content,
        ticketUrl: `${env.FRONTEND_URL}/tickets/${ticket.trackingToken}`,
        trackingToken: ticket.trackingToken,
      });
      
      const html = populateTemplate(baseTemplate, {
        title: `New reply on ticket #${ticket.ticketNumber}`,
        content,
        unsubscribeUrl: `${env.FRONTEND_URL}/settings/notifications`,
      });
      
      await this.queueEmail(
        {
          to: customer.email,
          subject: `New reply on your ticket #${ticket.ticketNumber}`,
          html,
        },
        { ticketId, responseId }
      );
    } catch (error) {
      logger.error('Failed to send ticket reply notification:', error);
      throw error;
    }
  }

  async sendNewTicketNotification(ticketId: string) {
    try {
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
          customer: { 
            select: { id: true, name: true, email: true } 
          },
        },
      });
      
      if (!ticket) {
        throw new Error('Ticket not found');
      }
      
      // Check user preferences
      const preferences = await this.getUserPreferences(ticket.customer.id);
      if (!preferences.emailOnNewTicket) {
        logger.info(`User ${ticket.customer.email} has disabled new ticket notifications`);
        return;
      }
      
      const sla = calculateSLA(ticket.priority, ticket.createdAt);
      const expectedResponseTime = sla.remainingMinutes > 60 
        ? `${Math.floor(sla.remainingMinutes / 60)} hours`
        : `${Math.floor(sla.remainingMinutes)} minutes`;
      
      // Load and populate template
      const baseTemplate = await loadTemplate('base.html');
      const contentTemplate = await loadTemplate('newTicket.html');
      
      const content = populateTemplate(contentTemplate, {
        customerName: ticket.customer.name,
        ticketNumber: ticket.ticketNumber,
        ticketSubject: ticket.subject,
        priority: ticket.priority,
        priorityColor: getPriorityColor(ticket.priority),
        category: ticket.category,
        status: ticket.status,
        createdDate: formatDate(ticket.createdAt),
        trackingToken: ticket.trackingToken,
        description: ticket.description,
        ticketUrl: `${env.FRONTEND_URL}/tickets/${ticket.trackingToken}`,
        expectedResponseTime,
      });
      
      const html = populateTemplate(baseTemplate, {
        title: `Ticket #${ticket.ticketNumber} created`,
        content,
        unsubscribeUrl: `${env.FRONTEND_URL}/settings/notifications`,
      });
      
      await this.queueEmail(
        {
          to: ticket.customer.email,
          subject: `Your support ticket #${ticket.ticketNumber} has been created`,
          html,
        },
        { ticketId }
      );
    } catch (error) {
      logger.error('Failed to send new ticket notification:', error);
      throw error;
    }
  }

  async sendTicketAssignmentNotification(ticketId: string, agentId: string) {
    try {
      const assignment = await prisma.ticketAssignment.findFirst({
        where: { ticketId, agentId },
        include: {
          agent: { select: { id: true, name: true, email: true } },
          ticket: {
            include: {
              customer: { select: { name: true, email: true } },
            },
          },
        },
      });
      
      if (!assignment) {
        throw new Error('Assignment not found');
      }
      
      const agent = assignment.agent;
      const ticket = assignment.ticket;
      
      // Check agent preferences
      const preferences = await this.getUserPreferences(agent.id);
      if (!preferences.emailOnTicketAssigned) {
        logger.info(`Agent ${agent.email} has disabled assignment notifications`);
        return;
      }
      
      const sla = calculateSLA(ticket.priority, ticket.createdAt);
      const slaTarget = sla.isBreached 
        ? 'SLA BREACHED' 
        : `${Math.floor(sla.remainingMinutes / 60)}h ${Math.floor(sla.remainingMinutes % 60)}m remaining`;
      
      // Load and populate template
      const baseTemplate = await loadTemplate('base.html');
      const contentTemplate = await loadTemplate('ticketAssigned.html');
      
      const content = populateTemplate(contentTemplate, {
        agentName: agent.name,
        ticketNumber: ticket.ticketNumber,
        ticketSubject: ticket.subject,
        customerName: ticket.customer.name,
        priority: ticket.priority,
        priorityColor: getPriorityColor(ticket.priority),
        category: ticket.category,
        status: ticket.status,
        createdDate: formatDate(ticket.createdAt),
        assignedDate: formatDate(assignment.assignedAt),
        description: ticket.description,
        aiSummary: ticket.aiSummary,
        ticketUrl: `${env.FRONTEND_URL}/agent/tickets/${ticket.id}`,
        slaTarget,
        assignedBy: 'System', // TODO: Track who assigned
      });
      
      const html = populateTemplate(baseTemplate, {
        title: `Ticket #${ticket.ticketNumber} assigned`,
        content,
        unsubscribeUrl: `${env.FRONTEND_URL}/settings/notifications`,
      });
      
      await this.queueEmail(
        {
          to: agent.email,
          subject: `Ticket #${ticket.ticketNumber} has been assigned to you`,
          html,
        },
        { ticketId, agentId }
      );
    } catch (error) {
      logger.error('Failed to send ticket assignment notification:', error);
      throw error;
    }
  }

  async sendSLABreachNotification(ticketId: string) {
    try {
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
          customer: { select: { name: true, email: true } },
          assignments: {
            include: {
              agent: { select: { id: true, email: true } },
            },
          },
        },
      });
      
      if (!ticket) {
        throw new Error('Ticket not found');
      }
      
      // Notify all assigned agents
      for (const assignment of ticket.assignments) {
        const preferences = await this.getUserPreferences(assignment.agent.id);
        if (preferences.emailOnSLABreach) {
          await this.queueEmail(
            {
              to: assignment.agent.email,
              subject: `⚠️ SLA BREACH: Ticket #${ticket.ticketNumber}`,
              html: `
                <h2>SLA Breach Alert</h2>
                <p>Ticket #${ticket.ticketNumber} has breached its SLA target.</p>
                <p><strong>Subject:</strong> ${ticket.subject}</p>
                <p><strong>Priority:</strong> ${ticket.priority}</p>
                <p><strong>Customer:</strong> ${ticket.customer.name}</p>
                <p><a href="${env.FRONTEND_URL}/agent/tickets/${ticket.id}">View Ticket</a></p>
              `,
            },
            { ticketId }
          );
        }
      }
    } catch (error) {
      logger.error('Failed to send SLA breach notification:', error);
      throw error;
    }
  }

  async sendTestEmail(recipientEmail: string) {
    try {
      const baseTemplate = await loadTemplate('base.html');
      
      const content = `
        <h2 style="margin: 0 0 16px; color: #212529; font-size: 22px; font-weight: 600;">Test Email</h2>
        <p style="margin: 0 0 16px; color: #495057; font-size: 15px; line-height: 1.6;">
          This is a test email from Support Portal. If you're receiving this, your email configuration is working correctly!
        </p>
        <div style="background-color: #d1ecf1; border-left: 4px solid #17a2b8; padding: 20px; margin: 24px 0; border-radius: 4px;">
          <p style="margin: 0; color: #0c5460; font-size: 14px;">
            ✅ Email notifications are configured and operational.
          </p>
        </div>
        <p style="margin: 24px 0 0; color: #6c757d; font-size: 13px;">
          <strong>Timestamp:</strong> ${new Date().toISOString()}
        </p>
      `;
      
      const html = populateTemplate(baseTemplate, {
        title: 'Test Email - Support Portal',
        content,
        unsubscribeUrl: `${env.FRONTEND_URL}/settings/notifications`,
      });
      
      await this.sendEmail({
        to: recipientEmail,
        subject: 'Test Email - Support Portal',
        html,
      });
      
      logger.info(`Test email sent to ${recipientEmail}`);
    } catch (error) {
      logger.error('Failed to send test email:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();
