import { Router } from 'express';
import { userService } from '@/services/userService';
import { authLimiter } from '@/middleware/rateLimiter';
import { validateBody } from '@/middleware/validation';
import { z } from 'zod';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

// POST /api/auth/login
router.post('/login', authLimiter, validateBody(loginSchema), async (req, res, _next) => {
  try {
    const { email, password } = req.body;
    const result = await userService.authenticate(email, password);
    return res.json(result);
  } catch (error) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
});

// POST /api/auth/register
router.post('/register', validateBody(registerSchema), async (req, res, next) => {
  try {
    await userService.createUser(req.body);
    const result = await userService.authenticate(req.body.email, req.body.password);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
});

export default router;
