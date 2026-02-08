import { Router } from 'express';
import { authenticate, requireRole } from '@/middleware/auth';
import { userService } from '@/services/userService';
import { validateBody } from '@/middleware/validation';
import { z } from 'zod';

const router = Router();

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  avatar: z.string().url().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/users - Get all users (admin only)
router.get('/', authenticate, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { role, page, limit } = req.query;
    const result = await userService.getUsers(
      role as string,
      page ? parseInt(page as string) : undefined,
      limit ? parseInt(limit as string) : undefined
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/users/agents - Get all agents
router.get('/agents', authenticate, async (req, res, next) => {
  try {
    const agents = await userService.getAgents();
    res.json(agents);
  } catch (error) {
    next(error);
  }
});

// GET /api/users/me - Get current user
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.user!.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/users/:id - Update user
router.patch(
  '/:id',
  authenticate,
  requireRole('ADMIN'),
  validateBody(updateUserSchema),
  async (req, res, next) => {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
