import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '@/app';
import { userService } from '@/services/userService';
import { prisma } from '@/config/database';

describe('Tickets API', () => {
  let authToken: string;
  let testUser: any;
  let testTicket: any;

  beforeAll(async () => {
    // Create test user and authenticate
    testUser = await userService.createUser({
      email: 'api-test@example.com',
      name: 'API Test User',
      password: 'password123',
    });

    const authResult = await userService.authenticate('api-test@example.com', 'password123');
    authToken = authResult.token;
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
    const response = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        subject: 'Integration Test Ticket',
        description: 'This is an integration test ticket',
        priority: 'MEDIUM',
      });

    expect(response.status).toBe(201);
    expect(response.body.subject).toBe('Integration Test Ticket');
    testTicket = response.body;
  });

  it('should get tickets', async () => {
    const response = await request(app)
      .get('/api/tickets')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should get ticket by ID', async () => {
    const response = await request(app)
      .get(`/api/tickets/${testTicket.id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(testTicket.id);
  });

  it('should require authentication', async () => {
    const response = await request(app)
      .get('/api/tickets');

    expect(response.status).toBe(401);
  });
});
