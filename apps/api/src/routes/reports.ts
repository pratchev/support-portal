import { Router } from 'express';
import { authenticate, requireRole } from '@/middleware/auth';
import { reportService } from '@/services/reportService';

const router = Router();

// GET /api/reports/metrics - Get ticket metrics
router.get('/metrics', authenticate, requireRole('AGENT', 'ADMIN'), async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const metrics = await reportService.getTicketMetrics(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    
    res.json(metrics);
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/agent-performance - Get agent performance
router.get('/agent-performance', authenticate, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { agentId, startDate, endDate } = req.query;
    
    const performance = await reportService.getAgentPerformance(
      agentId as string,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    
    res.json(performance);
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/satisfaction - Get customer satisfaction
router.get('/satisfaction', authenticate, requireRole('AGENT', 'ADMIN'), async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const satisfaction = await reportService.getCustomerSatisfaction(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    
    res.json(satisfaction);
  } catch (error) {
    next(error);
  }
});

export default router;
