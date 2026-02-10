import { Router } from 'express';
import { authenticate, AuthRequest } from '@/middleware/auth';
import { uploadMultiple } from '@/middleware/upload';
import { uploadLimiter } from '@/middleware/rateLimiter';
import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';

const router = Router();

// POST /api/attachments - Upload attachments
router.post(
  '/',
  authenticate,
  uploadLimiter,
  uploadMultiple,
  async (req: AuthRequest, res, next) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }
      
      const attachments = await Promise.all(
        files.map(file =>
          prisma.attachment.create({
            data: {
              filename: file.originalname,
              mimeType: file.mimetype,
              size: file.size,
              url: `/uploads/${file.filename}`,
            },
          })
        )
      );
      
      logger.info(`${files.length} attachments uploaded`);
      return res.status(201).json(attachments);
    } catch (error) {
      return next(error);
    }
  }
);

// GET /api/attachments/:id - Get attachment details
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const attachment = await prisma.attachment.findUnique({
      where: { id: req.params.id },
    });
    
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }
    
    return res.json(attachment);
  } catch (error) {
    return next(error);
  }
});

export default router;
