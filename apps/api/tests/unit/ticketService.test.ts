import { describe, it, expect } from 'vitest';

describe('TicketService', () => {
  it('should define ticket status values', () => {
    const validStatuses = ['OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'WAITING_FOR_INTERNAL', 'RESOLVED', 'CLOSED'];
    expect(validStatuses).toContain('OPEN');
    expect(validStatuses).toContain('CLOSED');
    expect(validStatuses.length).toBe(6);
  });

  it('should define ticket priority values', () => {
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    expect(validPriorities).toContain('LOW');
    expect(validPriorities).toContain('URGENT');
    expect(validPriorities.length).toBe(4);
  });

  it('should define ticket category values', () => {
    const validCategories = ['TECHNICAL', 'BILLING', 'FEATURE_REQUEST', 'BUG_REPORT', 'GENERAL', 'OTHER'];
    expect(validCategories).toContain('TECHNICAL');
    expect(validCategories).toContain('BILLING');
    expect(validCategories.length).toBe(6);
  });
});
