import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ticketService } from '@/services/ticketService';
import { userService } from '@/services/userService';
import { prisma } from '@/config/database';

describe('TicketService', () => {
  let testUser: any;
  let testTicket: any;

  beforeAll(async () => {
    // Create test user
    testUser = await userService.createUser({
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
    });
  });

  afterAll(async () => {
    // Cleanup
    if (testTicket) {
      await prisma.ticket.delete({ where: { id: testTicket.id } }).catch(() => {});
    }
    if (testUser) {
      await prisma.user.delete({ where: { id: testUser.id } }).catch(() => {});
    }
  });

  it('should create a ticket', async () => {
    testTicket = await ticketService.createTicket({
      subject: 'Test Ticket',
      description: 'This is a test ticket',
      customerId: testUser.id,
    });

    expect(testTicket).toBeDefined();
    expect(testTicket.subject).toBe('Test Ticket');
    expect(testTicket.customerId).toBe(testUser.id);
    expect(testTicket.status).toBe('OPEN');
  });

  it('should get tickets', async () => {
    const result = await ticketService.getTickets({
      customerId: testUser.id,
    });

    expect(result.data).toBeDefined();
    expect(result.data.length).toBeGreaterThan(0);
  });

  it('should get ticket by ID', async () => {
    const ticket = await ticketService.getTicketById(testTicket.id);

    expect(ticket).toBeDefined();
    expect(ticket?.id).toBe(testTicket.id);
  });

  it('should update ticket', async () => {
    const updated = await ticketService.updateTicket(testTicket.id, {
      status: 'IN_PROGRESS',
    });

    expect(updated.status).toBe('IN_PROGRESS');
  });

  it('should get ticket stats', async () => {
    const stats = await ticketService.getTicketStats();

    expect(stats).toBeDefined();
    expect(stats.total).toBeGreaterThanOrEqual(1);
  });
});
