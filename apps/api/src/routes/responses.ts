import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import { prisma } from '@/config/database';
import { z } from 'zod';
import { validateBody } from '@/middleware/validation';

const router = Router();

const addReactionSchema = z.object({
  emoji: z.string().min(1).max(10),
});

// POST /api/responses/:id/reactions - Add reaction to response
router.post(
  '/:id/reactions',
  authenticate,
  validateBody(addReactionSchema),
  async (req, res, next) => {
    try {
      const { emoji } = req.body;
      const userId = req.user!.id;
      const responseId = req.params.id;
      
      // Check if reaction already exists
      const existing = await prisma.reaction.findUnique({
        where: {
          responseId_userId: { responseId, userId },
        },
      });
      
      if (existing) {
        // Update existing reaction
        const reaction = await prisma.reaction.update({
          where: { id: existing.id },
          data: { emoji },
        });
        return res.json(reaction);
      }
      
      // Create new reaction
      const reaction = await prisma.reaction.create({
        data: {
          responseId,
          userId,
          emoji,
        },
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
      });
      
      res.status(201).json(reaction);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/responses/:id/reactions - Remove reaction
router.delete('/:id/reactions', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const responseId = req.params.id;
    
    await prisma.reaction.delete({
      where: {
        responseId_userId: { responseId, userId },
      },
    });
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
