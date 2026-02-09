import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';

class ReportService {
  async getTicketMetrics(startDate?: Date, endDate?: Date) {
    try {
      const where: Record<string, unknown> = {};
      
      if (startDate && endDate) {
        where.createdAt = {
          gte: startDate,
          lte: endDate,
        };
      }
      
      const [
        totalTickets,
        openTickets,
        resolvedTickets,
        avgResponseTime,
        ticketsByPriority,
        ticketsByCategory,
        ticketsByStatus,
      ] = await Promise.all([
        prisma.ticket.count({ where }),
        prisma.ticket.count({ where: { ...where, status: 'OPEN' } }),
        prisma.ticket.count({ where: { ...where, status: 'RESOLVED' } }),
        this.calculateAvgResponseTime(where),
        this.getTicketsByPriority(where),
        this.getTicketsByCategory(where),
        this.getTicketsByStatus(where),
      ]);
      
      return {
        totalTickets,
        openTickets,
        resolvedTickets,
        avgResponseTime,
        ticketsByPriority,
        ticketsByCategory,
        ticketsByStatus,
      };
    } catch (error) {
      logger.error('Failed to get ticket metrics:', error);
      throw error;
    }
  }

  private async calculateAvgResponseTime(where: Record<string, unknown>) {
    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        responses: {
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
    });
    
    let totalResponseTime = 0;
    let ticketsWithResponses = 0;
    
    tickets.forEach((ticket: { createdAt: Date; responses: { createdAt: Date }[] }) => {
      if (ticket.responses.length > 0) {
        const responseTime = ticket.responses[0].createdAt.getTime() - ticket.createdAt.getTime();
        totalResponseTime += responseTime;
        ticketsWithResponses++;
      }
    });
    
    return ticketsWithResponses > 0 
      ? Math.floor(totalResponseTime / ticketsWithResponses / (1000 * 60)) // in minutes
      : 0;
  }

  private async getTicketsByPriority(where: Record<string, unknown>) {
    const results = await prisma.ticket.groupBy({
      by: ['priority'],
      where,
      _count: true,
    });
    
    return results.map((r: { priority: string; _count: number }) => ({
      priority: r.priority,
      count: r._count,
    }));
  }

  private async getTicketsByCategory(where: Record<string, unknown>) {
    const results = await prisma.ticket.groupBy({
      by: ['category'],
      where,
      _count: true,
    });
    
    return results.map((r: { category: string; _count: number }) => ({
      category: r.category,
      count: r._count,
    }));
  }

  private async getTicketsByStatus(where: Record<string, unknown>) {
    const results = await prisma.ticket.groupBy({
      by: ['status'],
      where,
      _count: true,
    });
    
    return results.map((r: { status: string; _count: number }) => ({
      status: r.status,
      count: r._count,
    }));
  }

  async getAgentPerformance(agentId?: string, startDate?: Date, endDate?: Date) {
    try {
      const where: Record<string, unknown> = {};
      
      if (startDate && endDate) {
        where.assignedAt = {
          gte: startDate,
          lte: endDate,
        };
      }
      
      if (agentId) {
        where.agentId = agentId;
      }
      
      const assignments = await prisma.ticketAssignment.findMany({
        where,
        include: {
          agent: {
            select: { id: true, name: true },
          },
          ticket: {
            select: { status: true, priority: true, createdAt: true, resolvedAt: true },
          },
        },
      });
      
      interface AgentStats {
        agentId: string;
        agentName: string;
        totalAssigned: number;
        resolved: number;
        avgResolutionTime: number;
      }
      const agentStats = new Map<string, AgentStats>();
      
      assignments.forEach((assignment: { agent: { id: string; name: string }; ticket: { status: string; priority: string; createdAt: Date; resolvedAt: Date | null } }) => {
        const agentId = assignment.agent.id;
        
        if (!agentStats.has(agentId)) {
          agentStats.set(agentId, {
            agentId: assignment.agent.id,
            agentName: assignment.agent.name,
            totalAssigned: 0,
            resolved: 0,
            avgResolutionTime: 0,
          });
        }
        
        const stats = agentStats.get(agentId)!;
        stats.totalAssigned++;
        
        if (assignment.ticket.status === 'RESOLVED' && assignment.ticket.resolvedAt) {
          stats.resolved++;
          const resolutionTime = assignment.ticket.resolvedAt.getTime() - assignment.ticket.createdAt.getTime();
          stats.avgResolutionTime += resolutionTime;
        }
      });
      
      return Array.from(agentStats.values()).map((stats: AgentStats) => ({
        ...stats,
        avgResolutionTime: stats.resolved > 0 
          ? Math.floor(stats.avgResolutionTime / stats.resolved / (1000 * 60 * 60)) // in hours
          : 0,
      }));
    } catch (error) {
      logger.error('Failed to get agent performance:', error);
      throw error;
    }
  }

  async getCustomerSatisfaction(startDate?: Date, endDate?: Date) {
    try {
      const where: Record<string, unknown> = {};
      
      if (startDate && endDate) {
        where.createdAt = {
          gte: startDate,
          lte: endDate,
        };
      }
      
      const ratings = await prisma.rating.findMany({
        where,
        include: {
          ticket: {
            select: { ticketNumber: true, priority: true },
          },
        },
      });
      
      const totalRatings = ratings.length;
      const avgScore = totalRatings > 0
        ? ratings.reduce((sum: number, r: { score: number }) => sum + r.score, 0) / totalRatings
        : 0;
      
      const distribution = [1, 2, 3, 4, 5].map(score => ({
        score,
        count: ratings.filter((r: { score: number }) => r.score === score).length,
      }));
      
      return {
        totalRatings,
        avgScore: Math.round(avgScore * 10) / 10,
        distribution,
      };
    } catch (error) {
      logger.error('Failed to get customer satisfaction:', error);
      throw error;
    }
  }
}

export const reportService = new ReportService();
