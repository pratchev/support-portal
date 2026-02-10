import { Router } from 'express';
import { authenticate, AuthRequest } from '@/middleware/auth';
import { prisma } from '@/config/database';
import { validateBody } from '@/middleware/validation';
import { z } from 'zod';

const router = Router();

const createRatingSchema = z.object({
  ticketId: z.string().uuid(),
  score: z.number().min(1).max(5),
  feedback: z.string().max(1000).optional(),
});

// POST /api/ratings - Create rating
router.post('/', authenticate, validateBody(createRatingSchema), async (req: AuthRequest, res, next) => {
  try {
    const { ticketId, score, feedback } = req.body;
    const userId = req.user!.id;
    
    // Check if rating already exists
    const existing = await prisma.rating.findUnique({
      where: { ticketId },
    });
    
    if (existing) {
      // Update existing rating
      const rating = await prisma.rating.update({
        where: { id: existing.id },
        data: { score, feedback },
      });
      return res.json(rating);
    }
    
    // Create new rating
    const rating = await prisma.rating.create({
      data: {
        ticketId,
        userId,
        score,
        feedback,
      },
    });
    
    return res.status(201).json(rating);
  } catch (error) {
    return next(error);
  }
});

// GET /api/ratings/ticket/:ticketId - Get rating for ticket
router.get('/ticket/:ticketId', async (req, res, next) => {
  try {
    const rating = await prisma.rating.findUnique({
      where: { ticketId: req.params.ticketId },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });
    
    if (!rating) {
      return res.status(404).json({ error: 'Rating not found' });
    }
    
    return res.json(rating);
  } catch (error) {
    return next(error);
  }
});

export default router;
