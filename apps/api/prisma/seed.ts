import { PrismaClient } from '.prisma/client';
import { hashPassword } from '../src/utils/helpers';

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@supportportal.com' },
    update: {},
    create: {
      email: 'admin@supportportal.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      authProvider: 'LOCAL',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create agent users
  const agentPassword = await hashPassword('agent123');
  const agent1 = await prisma.user.upsert({
    where: { email: 'agent1@supportportal.com' },
    update: {},
    create: {
      email: 'agent1@supportportal.com',
      name: 'John Agent',
      password: agentPassword,
      role: 'AGENT',
      authProvider: 'LOCAL',
    },
  });
  console.log('✅ Agent 1 created:', agent1.email);

  const agent2 = await prisma.user.upsert({
    where: { email: 'agent2@supportportal.com' },
    update: {},
    create: {
      email: 'agent2@supportportal.com',
      name: 'Sarah Agent',
      password: agentPassword,
      role: 'AGENT',
      authProvider: 'LOCAL',
    },
  });
  console.log('✅ Agent 2 created:', agent2.email);

  // Create regular users
  const userPassword = await hashPassword('user123');
  const user1 = await prisma.user.upsert({
    where: { email: 'user1@example.com' },
    update: {},
    create: {
      email: 'user1@example.com',
      name: 'Alice Customer',
      password: userPassword,
      role: 'USER',
      authProvider: 'LOCAL',
    },
  });
  console.log('✅ User 1 created:', user1.email);

  const user2 = await prisma.user.upsert({
    where: { email: 'user2@example.com' },
    update: {},
    create: {
      email: 'user2@example.com',
      name: 'Bob Customer',
      password: userPassword,
      role: 'USER',
      authProvider: 'LOCAL',
    },
  });
  console.log('✅ User 2 created:', user2.email);

  // Create notification settings
  const notificationSettings = await prisma.notificationSettings.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      emailEnabled: true,
      fromName: 'Support Portal',
      fromEmail: 'support@supportportal.com',
    },
  });
  console.log('✅ Notification settings created');

  // Create SLA policies
  const slaPolicies = await Promise.all([
    prisma.sLAPolicy.upsert({
      where: { id: '1' },
      update: {},
      create: {
        id: '1',
        name: 'Low Priority SLA',
        priority: 'LOW',
        firstResponseMinutes: 1440, // 24 hours
        resolutionHours: 72,
      },
    }),
    prisma.sLAPolicy.upsert({
      where: { id: '2' },
      update: {},
      create: {
        id: '2',
        name: 'Medium Priority SLA',
        priority: 'MEDIUM',
        firstResponseMinutes: 480, // 8 hours
        resolutionHours: 48,
      },
    }),
    prisma.sLAPolicy.upsert({
      where: { id: '3' },
      update: {},
      create: {
        id: '3',
        name: 'High Priority SLA',
        priority: 'HIGH',
        firstResponseMinutes: 240, // 4 hours
        resolutionHours: 24,
      },
    }),
    prisma.sLAPolicy.upsert({
      where: { id: '4' },
      update: {},
      create: {
        id: '4',
        name: 'Urgent Priority SLA',
        priority: 'URGENT',
        firstResponseMinutes: 60, // 1 hour
        resolutionHours: 8,
      },
    }),
  ]);
  console.log('✅ SLA policies created');

  // Create sample KB articles
  const article1 = await prisma.kBArticle.create({
    data: {
      title: 'How to Reset Your Password',
      content:
        'To reset your password, click on "Forgot Password" on the login page...',
      category: 'Account Management',
      tags: ['password', 'account', 'security'],
      isPublished: true,
      authorId: admin.id,
    },
  });
  console.log('✅ KB article 1 created:', article1.title);

  const article2 = await prisma.kBArticle.create({
    data: {
      title: 'Getting Started with Support Portal',
      content: "Welcome to Support Portal! Here's how to get started...",
      category: 'Getting Started',
      tags: ['guide', 'tutorial', 'beginner'],
      isPublished: true,
      authorId: admin.id,
    },
  });
  console.log('✅ KB article 2 created:', article2.title);

  // Create sample tickets
  const ticket1 = await prisma.ticket.create({
    data: {
      subject: 'Cannot login to my account',
      description: 'I forgot my password and cannot access my account anymore.',
      priority: 'HIGH',
      category: 'TECHNICAL',
      customerId: user1.id,
      source: 'WEB',
    },
  });
  console.log('✅ Ticket 1 created: #', ticket1.ticketNumber);

  // Assign ticket to agent
  await prisma.ticketAssignment.create({
    data: {
      ticketId: ticket1.id,
      agentId: agent1.id,
    },
  });
  console.log('✅ Ticket 1 assigned to agent');

  // Add response to ticket
  await prisma.response.create({
    data: {
      ticketId: ticket1.id,
      userId: agent1.id,
      content:
        "Hello! I can help you reset your password. I'll send you a password reset link.",
      isInternal: false,
    },
  });
  console.log('✅ Response added to ticket 1');

  const ticket2 = await prisma.ticket.create({
    data: {
      subject: 'Billing question about my subscription',
      description: 'I was charged twice this month. Can you please check?',
      priority: 'MEDIUM',
      category: 'BILLING',
      customerId: user2.id,
      source: 'EMAIL',
    },
  });
  console.log('✅ Ticket 2 created: #', ticket2.ticketNumber);

  console.log('\n✨ Seeding completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('Admin: admin@supportportal.com / admin123');
  console.log('Agent: agent1@supportportal.com / agent123');
  console.log('User: user1@example.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
