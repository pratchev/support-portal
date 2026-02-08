import { Router } from 'express';
import { authenticate, requireRole } from '@/middleware/auth';
import { prisma } from '@/config/database';
import { notificationService } from '@/services/notificationService';
import { logger } from '@/utils/logger';
import { z } from 'zod';
import { validateBody } from '@/middleware/validation';

const router = Router();

// Validation schemas
const updateSettingsSchema = z.object({
  emailEnabled: z.boolean().optional(),
  smtpHost: z.string().optional(),
  smtpPort: z.number().optional(),
  smtpSecure: z.boolean().optional(),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  useGraphApi: z.boolean().optional(),
  graphClientId: z.string().optional(),
  graphClientSecret: z.string().optional(),
  graphTenantId: z.string().optional(),
  fromEmail: z.string().email().optional(),
  fromName: z.string().optional(),
  replyToEmail: z.string().email().optional(),
});

const updatePreferencesSchema = z.object({
  emailOnNewTicket: z.boolean().optional(),
  emailOnTicketReply: z.boolean().optional(),
  emailOnTicketAssigned: z.boolean().optional(),
  emailOnStatusChange: z.boolean().optional(),
  emailOnSLABreach: z.boolean().optional(),
  dailyDigest: z.boolean().optional(),
});

const testEmailSchema = z.object({
  recipientEmail: z.string().email(),
});

// GET /api/notifications/settings - Get system settings (admin only)
router.get('/settings', authenticate, requireRole('ADMIN'), async (req, res, next) => {
  try {
    let settings = await prisma.notificationSettings.findFirst();
    
    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.notificationSettings.create({
        data: {
          emailEnabled: true,
          fromName: 'Support Portal',
        },
      });
    }
    
    // Don't expose sensitive data
    const { smtpPassword, graphClientSecret, ...safeSettings } = settings;
    
    res.json(safeSettings);
  } catch (error) {
    next(error);
  }
});

// PUT /api/notifications/settings - Update system settings (admin only)
router.put(
  '/settings',
  authenticate,
  requireRole('ADMIN'),
  validateBody(updateSettingsSchema),
  async (req, res, next) => {
    try {
      const data = req.body;
      
      // Get existing settings or create if none exist
      let settings = await prisma.notificationSettings.findFirst();
      
      if (!settings) {
        settings = await prisma.notificationSettings.create({
          data: {
            emailEnabled: true,
            fromName: 'Support Portal',
            ...data,
          },
        });
      } else {
        settings = await prisma.notificationSettings.update({
          where: { id: settings.id },
          data,
        });
      }
      
      // Don't expose sensitive data
      const { smtpPassword, graphClientSecret, ...safeSettings } = settings;
      
      logger.info('Notification settings updated by admin');
      res.json(safeSettings);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/notifications/preferences - Get user preferences
router.get('/preferences', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    
    let preferences = await prisma.userNotificationPreference.findUnique({
      where: { userId },
    });
    
    // Create default preferences if none exist
    if (!preferences) {
      preferences = await prisma.userNotificationPreference.create({
        data: { userId },
      });
    }
    
    res.json(preferences);
  } catch (error) {
    next(error);
  }
});

// PUT /api/notifications/preferences - Update user preferences
router.put(
  '/preferences',
  authenticate,
  validateBody(updatePreferencesSchema),
  async (req, res, next) => {
    try {
      const userId = req.user!.id;
      const data = req.body;
      
      // Check if preferences exist
      const existing = await prisma.userNotificationPreference.findUnique({
        where: { userId },
      });
      
      let preferences;
      
      if (existing) {
        preferences = await prisma.userNotificationPreference.update({
          where: { userId },
          data,
        });
      } else {
        preferences = await prisma.userNotificationPreference.create({
          data: {
            userId,
            ...data,
          },
        });
      }
      
      logger.info(`Notification preferences updated for user ${userId}`);
      res.json(preferences);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/notifications/test - Send test email (admin only)
router.post(
  '/test',
  authenticate,
  requireRole('ADMIN'),
  validateBody(testEmailSchema),
  async (req, res, next) => {
    try {
      const { recipientEmail } = req.body;
      
      await notificationService.sendTestEmail(recipientEmail);
      
      logger.info(`Test email sent to ${recipientEmail}`);
      res.json({ message: 'Test email sent successfully' });
    } catch (error) {
      logger.error('Failed to send test email:', error);
      res.status(500).json({ 
        error: 'Failed to send test email',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

export default router;
