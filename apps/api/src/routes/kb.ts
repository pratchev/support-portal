import { Router } from 'express';
import { authenticate, requireRole } from '@/middleware/auth';
import { kbService } from '@/services/kbService';
import { validateBody } from '@/middleware/validation';
import { z } from 'zod';

const router = Router();

const createArticleSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(10),
  category: z.string().min(2),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
});

const updateArticleSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  content: z.string().min(10).optional(),
  category: z.string().min(2).optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
});

// GET /api/kb - Get all articles
router.get('/', async (req, res, next) => {
  try {
    const { category, search, page, limit } = req.query;
    const result = await kbService.getArticles({
      category: category as string,
      search: search as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/kb/search - Search articles
router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }
    const articles = await kbService.searchArticles(q as string);
    res.json(articles);
  } catch (error) {
    next(error);
  }
});

// GET /api/kb/popular - Get popular articles
router.get('/popular', async (req, res, next) => {
  try {
    const { limit } = req.query;
    const articles = await kbService.getPopularArticles(
      limit ? parseInt(limit as string) : undefined
    );
    res.json(articles);
  } catch (error) {
    next(error);
  }
});

// POST /api/kb - Create article
router.post(
  '/',
  authenticate,
  requireRole('AGENT', 'ADMIN'),
  validateBody(createArticleSchema),
  async (req, res, next) => {
    try {
      const article = await kbService.createArticle({
        ...req.body,
        authorId: req.user!.id,
      });
      res.status(201).json(article);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/kb/:id - Get article by ID
router.get('/:id', async (req, res, next) => {
  try {
    const article = await kbService.getArticleById(req.params.id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(article);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/kb/:id - Update article
router.patch(
  '/:id',
  authenticate,
  requireRole('AGENT', 'ADMIN'),
  validateBody(updateArticleSchema),
  async (req, res, next) => {
    try {
      const article = await kbService.updateArticle(req.params.id, req.body);
      res.json(article);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/kb/:id - Delete article
router.delete('/:id', authenticate, requireRole('ADMIN'), async (req, res, next) => {
  try {
    await kbService.deleteArticle(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
