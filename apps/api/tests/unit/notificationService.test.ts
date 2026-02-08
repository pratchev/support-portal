import { describe, it, expect, beforeAll } from 'vitest';
import { notificationService } from '@/services/notificationService';
import { prisma } from '@/config/database';

describe('NotificationService', () => {
  it('should have required methods', () => {
    expect(notificationService.sendTicketReplyNotification).toBeDefined();
    expect(notificationService.sendNewTicketNotification).toBeDefined();
    expect(notificationService.sendTicketAssignmentNotification).toBeDefined();
    expect(notificationService.sendSLABreachNotification).toBeDefined();
    expect(notificationService.sendTestEmail).toBeDefined();
  });

  it('should get or create notification settings', async () => {
    let settings = await prisma.notificationSettings.findFirst();
    
    if (!settings) {
      settings = await prisma.notificationSettings.create({
        data: {
          emailEnabled: true,
          fromName: 'Support Portal',
        },
      });
    }

    expect(settings).toBeDefined();
    expect(settings.emailEnabled).toBeDefined();
  });

  it('should get or create user preferences', async () => {
    // Create test user first
    const user = await prisma.user.create({
      data: {
        email: 'notification-test@example.com',
        name: 'Notification Test User',
        role: 'USER',
      },
    });

    let preferences = await prisma.userNotificationPreference.findUnique({
      where: { userId: user.id },
    });

    if (!preferences) {
      preferences = await prisma.userNotificationPreference.create({
        data: { userId: user.id },
      });
    }

    expect(preferences).toBeDefined();
    expect(preferences.emailOnNewTicket).toBe(true);
    expect(preferences.emailOnTicketReply).toBe(true);

    // Cleanup
    await prisma.userNotificationPreference.delete({ where: { id: preferences.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });
});
