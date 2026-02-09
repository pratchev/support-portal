import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import { generateTrackingToken } from '@/utils/helpers';
import { notificationService } from './notificationService';
import { aiAnalysisQueue } from '@/config/redis';

type TicketPriorityValue = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
type TicketCategoryValue = 'TECHNICAL' | 'BILLING' | 'FEATURE_REQUEST' | 'BUG_REPORT' | 'GENERAL' | 'OTHER';

interface CreateTicketInput {
  subject: string;
  description: string;
  priority?: string;
  category?: string;
  customerId: string;
  source?: string;
}

interface UpdateTicketInput {
  subject?: string;
  description?: string;
  status?: string;
  priority?: string;
  category?: string;
  isPinned?: boolean;
}

interface GetTicketsOptions {
  customerId?: string;
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

class TicketService {
  async createTicket(input: CreateTicketInput) {
    try {
      const ticket = await prisma.ticket.create({
        data: {
          subject: input.subject,
          description: input.description,
          priority: (input.priority as TicketPriorityValue) || 'MEDIUM',
          category: (input.category as TicketCategoryValue) || 'GENERAL',
          customerId: input.customerId,
          source: input.source || 'WEB',
          trackingToken: generateTrackingToken(),
        },
        include: {
          customer: {
            select: { id: true, name: true, email: true },
          },
        },
      });
      
      // Queue AI analysis
      await aiAnalysisQueue.add('analyze-ticket', { ticketId: ticket.id });
      
      // Send notification
      await notificationService.sendNewTicketNotification(ticket.id);
      
      logger.info(`Ticket created: #${ticket.ticketNumber}`);
      return ticket;
    } catch (error) {
      logger.error('Failed to create ticket:', error);
      throw error;
    }
  }

  async getTickets(options: GetTicketsOptions = {}) {
    const {
      customerId,
      status,
      priority,
      category,
      search,
      page = 1,
      limit = 20,
    } = options;
    
    const where: Record<string, unknown> = {};
    
    if (customerId) where.customerId = customerId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { ticketNumber: { equals: parseInt(search) || 0 } },
      ];
    }
    
    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          customer: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          assignments: {
            include: {
              agent: {
                select: { id: true, name: true, avatar: true },
              },
            },
          },
          _count: {
            select: { responses: true },
          },
        },
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.ticket.count({ where }),
    ]);
    
    return {
      data: tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTicketById(id: string, includeInternal: boolean = false) {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        assignments: {
          include: {
            agent: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        responses: {
          where: includeInternal ? {} : { isInternal: false },
          include: {
            user: {
              select: { id: true, name: true, avatar: true, role: true },
            },
            attachments: true,
            reactions: {
              include: {
                user: {
                  select: { id: true, name: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        attachments: true,
        ratings: true,
        devOpsLinks: true,
      },
    });
    
    return ticket;
  }

  async getTicketByTrackingToken(trackingToken: string) {
    return this.getTicketById(trackingToken, false);
  }

  async updateTicket(id: string, input: UpdateTicketInput) {
    try {
      const ticket = await prisma.ticket.update({
        where: { id },
        data: input as Record<string, unknown>,
        include: {
          customer: true,
          assignments: {
            include: { agent: true },
          },
        },
      });
      
      logger.info(`Ticket updated: #${ticket.ticketNumber}`);
      return ticket;
    } catch (error) {
      logger.error('Failed to update ticket:', error);
      throw error;
    }
  }

  async assignTicket(ticketId: string, agentId: string) {
    try {
      // Check if already assigned
      const existing = await prisma.ticketAssignment.findUnique({
        where: {
          ticketId_agentId: { ticketId, agentId },
        },
      });
      
      if (existing) {
        return existing;
      }
      
      const assignment = await prisma.ticketAssignment.create({
        data: { ticketId, agentId },
        include: {
          ticket: true,
          agent: true,
        },
      });
      
      // Update ticket status if it's still OPEN
      await prisma.ticket.update({
        where: { id: ticketId },
        data: {
          status: 'IN_PROGRESS',
        },
      });
      
      // Send notification
      await notificationService.sendTicketAssignmentNotification(ticketId, agentId);
      
      logger.info(`Ticket #${assignment.ticket.ticketNumber} assigned to ${assignment.agent.name}`);
      return assignment;
    } catch (error) {
      logger.error('Failed to assign ticket:', error);
      throw error;
    }
  }

  async addResponse(ticketId: string, userId: string, content: string, isInternal: boolean = false) {
    try {
      const response = await prisma.response.create({
        data: {
          ticketId,
          userId,
          content,
          isInternal,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
          ticket: {
            select: { id: true, ticketNumber: true, customerId: true },
          },
        },
      });
      
      // Update ticket's updatedAt
      await prisma.ticket.update({
        where: { id: ticketId },
        data: { updatedAt: new Date() },
      });
      
      // Send notification if not internal and responder is not the customer
      if (!isInternal && userId !== response.ticket.customerId) {
        await notificationService.sendTicketReplyNotification(ticketId, response.id);
      }
      
      logger.info(`Response added to ticket #${response.ticket.ticketNumber}`);
      return response;
    } catch (error) {
      logger.error('Failed to add response:', error);
      throw error;
    }
  }

  async getTicketStats(agentId?: string) {
    const where = agentId ? {
      assignments: {
        some: { agentId },
      },
    } : {};
    
    const [total, open, inProgress, resolved] = await Promise.all([
      prisma.ticket.count({ where }),
      prisma.ticket.count({ where: { ...where, status: 'OPEN' } }),
      prisma.ticket.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      prisma.ticket.count({ where: { ...where, status: 'RESOLVED' } }),
    ]);
    
    return { total, open, inProgress, resolved };
  }
}

export const ticketService = new TicketService();
