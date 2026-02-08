import { Router } from 'express';
import { authenticate, requireRole, optionalAuth, AuthRequest } from '@/middleware/auth';
import { ticketService } from '@/services/ticketService';
import { validateBody } from '@/middleware/validation';
import { z } from 'zod';
import { logger } from '@/utils/logger';

const router = Router();

// Validation schemas
const createTicketSchema = z.object({
  subject: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  category: z.enum(['TECHNICAL', 'BILLING', 'FEATURE_REQUEST', 'BUG_REPORT', 'GENERAL', 'OTHER']).optional(),
});

const updateTicketSchema = z.object({
  subject: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'WAITING_FOR_INTERNAL', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  category: z.enum(['TECHNICAL', 'BILLING', 'FEATURE_REQUEST', 'BUG_REPORT', 'GENERAL', 'OTHER']).optional(),
  isPinned: z.boolean().optional(),
});

const assignTicketSchema = z.object({
  agentId: z.string().uuid(),
});

const addResponseSchema = z.object({
  content: z.string().min(1).max(5000),
  isInternal: z.boolean().optional(),
});

// GET /api/tickets - Get all tickets
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status, priority, category, search, page, limit } = req.query;
    const user = req.user!;
    
    const options: any = {
      status: status as string,
      priority: priority as string,
      category: category as string,
      search: search as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    };
    
    // Users can only see their own tickets
    if (user.role === 'USER') {
      options.customerId = user.id;
    }
    
    const result = await ticketService.getTickets(options);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/tickets - Create a new ticket
router.post('/', authenticate, validateBody(createTicketSchema), async (req, res, next) => {
  try {
    const user = req.user!;
    
    const ticket = await ticketService.createTicket({
      ...req.body,
      customerId: user.id,
      source: 'WEB',
    });
    
    res.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
});

// GET /api/tickets/stats - Get ticket statistics
router.get('/stats', authenticate, async (req, res, next) => {
  try {
    const user = req.user!;
    const agentId = user.role === 'USER' ? undefined : user.id;
    
    const stats = await ticketService.getTicketStats(agentId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// GET /api/tickets/:id - Get ticket by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const user = req.user!;
    const includeInternal = user.role !== 'USER';
    
    const ticket = await ticketService.getTicketById(req.params.id, includeInternal);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Users can only see their own tickets
    if (user.role === 'USER' && ticket.customerId !== user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(ticket);
  } catch (error) {
    next(error);
  }
});

// GET /api/tickets/tracking/:token - Get ticket by tracking token (public)
router.get('/tracking/:token', optionalAuth, async (req, res, next) => {
  try {
    const ticket = await ticketService.getTicketByTrackingToken(req.params.token);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json(ticket);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/tickets/:id - Update ticket
router.patch(
  '/:id',
  authenticate,
  requireRole('AGENT', 'ADMIN'),
  validateBody(updateTicketSchema),
  async (req, res, next) => {
    try {
      const ticket = await ticketService.updateTicket(req.params.id, req.body);
      res.json(ticket);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/tickets/:id/assign - Assign ticket to agent
router.post(
  '/:id/assign',
  authenticate,
  requireRole('AGENT', 'ADMIN'),
  validateBody(assignTicketSchema),
  async (req, res, next) => {
    try {
      const { agentId } = req.body;
      const assignment = await ticketService.assignTicket(req.params.id, agentId);
      res.json(assignment);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/tickets/:id/responses - Add response to ticket
router.post(
  '/:id/responses',
  authenticate,
  validateBody(addResponseSchema),
  async (req, res, next) => {
    try {
      const user = req.user!;
      const { content, isInternal } = req.body;
      
      // Only agents can add internal responses
      const internal = user.role !== 'USER' && isInternal;
      
      const response = await ticketService.addResponse(
        req.params.id,
        user.id,
        content,
        internal
      );
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
