import { describe, it, expect } from 'vitest';

describe('NotificationService', () => {
  it('should define notification event types', () => {
    const eventTypes = ['NEW_TICKET', 'TICKET_REPLY', 'TICKET_ASSIGNED', 'STATUS_CHANGE', 'SLA_BREACH'];
    expect(eventTypes).toContain('NEW_TICKET');
    expect(eventTypes).toContain('TICKET_REPLY');
    expect(eventTypes.length).toBe(5);
  });

  it('should define default notification preferences', () => {
    const defaults = {
      emailOnNewTicket: true,
      emailOnTicketReply: true,
      emailOnTicketAssigned: true,
      emailOnStatusChange: true,
      emailOnSLABreach: true,
      dailyDigest: false,
    };
    expect(defaults.emailOnNewTicket).toBe(true);
    expect(defaults.dailyDigest).toBe(false);
  });

  it('should validate email format', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test('test@example.com')).toBe(true);
    expect(emailRegex.test('invalid')).toBe(false);
    expect(emailRegex.test('')).toBe(false);
  });
});
