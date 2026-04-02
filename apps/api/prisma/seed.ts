import { PrismaClient } from '../node_modules/.prisma/client/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { hashPassword } from '../src/utils/helpers';

const connectionString = process.env.DATABASE_URL || '';
const adapter = new PrismaPg(connectionString);
const prisma = new PrismaClient({ adapter });

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

  // Create sample tickets — a realistic mix of statuses, priorities, categories, and dates
  const now = new Date();
  const daysAgo = (d: number) =>
    new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000);

  const users = [user1, user2];
  const agents = [agent1, agent2];

  interface TicketSeed {
    subject: string;
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    category:
      | 'TECHNICAL'
      | 'BILLING'
      | 'FEATURE_REQUEST'
      | 'BUG_REPORT'
      | 'GENERAL'
      | 'OTHER';
    status:
      | 'NEW'
      | 'OPEN'
      | 'IN_PROGRESS'
      | 'WAITING_FOR_CUSTOMER'
      | 'WAITING_FOR_INTERNAL'
      | 'RESOLVED'
      | 'CLOSED';
    customerId: string;
    source: string;
    createdAt: Date;
    resolvedAt?: Date;
    closedAt?: Date;
    assignTo?: string;
    responses?: Array<{ userId: string; content: string; isInternal: boolean }>;
    rating?: number;
  }

  const ticketSeeds: TicketSeed[] = [
    // --- RESOLVED / CLOSED tickets (older, for duration metrics) ---
    {
      subject: 'Cannot login to my account',
      description:
        'I forgot my password and cannot access my account anymore. I tried the reset link but it expired.',
      priority: 'HIGH',
      category: 'TECHNICAL',
      status: 'RESOLVED',
      customerId: user1.id,
      source: 'WEB',
      createdAt: daysAgo(30),
      resolvedAt: daysAgo(29),
      assignTo: agent1.id,
      responses: [
        {
          userId: agent1.id,
          content:
            "Hello! I've sent you a new password reset link. Please check your spam folder.",
          isInternal: false,
        },
        {
          userId: user1.id,
          content: "Got it, thanks! I'm logged in now.",
          isInternal: false,
        },
      ],
      rating: 5,
    },
    {
      subject: 'Billing question about my subscription',
      description:
        'I was charged twice this month. Can you please check my account?',
      priority: 'MEDIUM',
      category: 'BILLING',
      status: 'CLOSED',
      customerId: user2.id,
      source: 'EMAIL',
      createdAt: daysAgo(28),
      resolvedAt: daysAgo(26),
      closedAt: daysAgo(25),
      assignTo: agent2.id,
      responses: [
        {
          userId: agent2.id,
          content:
            "I've reviewed your account and found the duplicate charge. A refund of $9.99 has been issued.",
          isInternal: false,
        },
        {
          userId: agent2.id,
          content: 'Flagged for finance team to review billing integration.',
          isInternal: true,
        },
      ],
      rating: 4,
    },
    {
      subject: 'App crashes on file upload',
      description:
        'When I try to upload a PDF larger than 5MB, the entire application crashes and I get a white screen.',
      priority: 'URGENT',
      category: 'BUG_REPORT',
      status: 'RESOLVED',
      customerId: user1.id,
      source: 'WEB',
      createdAt: daysAgo(25),
      resolvedAt: daysAgo(24),
      assignTo: agent1.id,
      responses: [
        {
          userId: agent1.id,
          content:
            "Thank you for reporting this. We've identified the issue — our upload handler wasn't handling large files properly. A fix has been deployed.",
          isInternal: false,
        },
      ],
      rating: 5,
    },
    {
      subject: 'Need to update my email address',
      description:
        'I changed jobs and need to update my email from alice@old.com to alice@new.com.',
      priority: 'LOW',
      category: 'GENERAL',
      status: 'CLOSED',
      customerId: user1.id,
      source: 'WEB',
      createdAt: daysAgo(22),
      resolvedAt: daysAgo(21),
      closedAt: daysAgo(20),
      assignTo: agent2.id,
      responses: [
        {
          userId: agent2.id,
          content:
            "I've updated your email address. You'll receive a confirmation at your new email.",
          isInternal: false,
        },
      ],
      rating: 5,
    },
    {
      subject: 'Export feature not working',
      description:
        'The CSV export button does nothing when I click it. I need to export my data for a quarterly report.',
      priority: 'HIGH',
      category: 'BUG_REPORT',
      status: 'RESOLVED',
      customerId: user2.id,
      source: 'WEB',
      createdAt: daysAgo(20),
      resolvedAt: daysAgo(18),
      assignTo: agent1.id,
      responses: [
        {
          userId: agent1.id,
          content:
            "We've found the issue with the CSV export. It was a browser compatibility problem. Please try again now — we've pushed a fix.",
          isInternal: false,
        },
        {
          userId: user2.id,
          content: 'Works now, thank you!',
          isInternal: false,
        },
      ],
      rating: 4,
    },
    {
      subject: 'How to integrate with Slack',
      description:
        'We want to receive ticket notifications in our Slack workspace. Is there an integration available?',
      priority: 'LOW',
      category: 'FEATURE_REQUEST',
      status: 'RESOLVED',
      customerId: user2.id,
      source: 'WEB',
      createdAt: daysAgo(18),
      resolvedAt: daysAgo(15),
      assignTo: agent2.id,
      responses: [
        {
          userId: agent2.id,
          content:
            "Great question! We have a Slack integration guide in our KB. I'll send you the link.",
          isInternal: false,
        },
      ],
      rating: 3,
    },
    {
      subject: 'Two-factor authentication not working',
      description:
        'My authenticator app shows an invalid code every time I try to log in with 2FA enabled.',
      priority: 'URGENT',
      category: 'TECHNICAL',
      status: 'RESOLVED',
      customerId: user1.id,
      source: 'WEB',
      createdAt: daysAgo(15),
      resolvedAt: daysAgo(14),
      assignTo: agent1.id,
      responses: [
        {
          userId: agent1.id,
          content:
            "This is usually caused by a time sync issue. Please check that your phone's clock is set to automatic. I've also reset your 2FA so you can re-enroll.",
          isInternal: false,
        },
        {
          userId: user1.id,
          content: 'That fixed it! The time was off by 2 minutes.',
          isInternal: false,
        },
      ],
      rating: 5,
    },
    {
      subject: 'Refund request for annual plan',
      description:
        'I purchased the annual plan by mistake. I meant to get the monthly plan. Can I get a refund for the difference?',
      priority: 'MEDIUM',
      category: 'BILLING',
      status: 'CLOSED',
      customerId: user2.id,
      source: 'EMAIL',
      createdAt: daysAgo(14),
      resolvedAt: daysAgo(12),
      closedAt: daysAgo(11),
      assignTo: agent2.id,
      responses: [
        {
          userId: agent2.id,
          content:
            "I've processed a prorated refund and switched you to the monthly plan. You should see the refund in 3-5 business days.",
          isInternal: false,
        },
      ],
      rating: 4,
    },
    {
      subject: 'Dashboard charts not loading',
      description:
        'The charts on my dashboard show a spinner but never actually load. This started happening yesterday.',
      priority: 'HIGH',
      category: 'BUG_REPORT',
      status: 'RESOLVED',
      customerId: user1.id,
      source: 'WEB',
      createdAt: daysAgo(10),
      resolvedAt: daysAgo(9),
      assignTo: agent1.id,
      responses: [
        {
          userId: agent1.id,
          content:
            "We identified a caching issue that was preventing chart data from loading. It's been fixed now.",
          isInternal: false,
        },
      ],
    },
    {
      subject: 'Request dark mode support',
      description:
        'It would be great to have a dark mode option. The current white background is hard on the eyes at night.',
      priority: 'LOW',
      category: 'FEATURE_REQUEST',
      status: 'CLOSED',
      customerId: user2.id,
      source: 'WEB',
      createdAt: daysAgo(12),
      resolvedAt: daysAgo(8),
      closedAt: daysAgo(7),
      assignTo: agent2.id,
      responses: [
        {
          userId: agent2.id,
          content:
            'Dark mode is now available! Go to Settings > Appearance to enable it.',
          isInternal: false,
        },
      ],
      rating: 5,
    },

    // --- IN PROGRESS tickets ---
    {
      subject: 'API rate limiting too aggressive',
      description:
        'Our automated scripts are hitting rate limits. We make about 100 requests per minute and keep getting 429 errors.',
      priority: 'HIGH',
      category: 'TECHNICAL',
      status: 'IN_PROGRESS',
      customerId: user1.id,
      source: 'WEB',
      createdAt: daysAgo(5),
      assignTo: agent1.id,
      responses: [
        {
          userId: agent1.id,
          content:
            "I'm reviewing your account's rate limit configuration. I'll increase your quota.",
          isInternal: false,
        },
        {
          userId: agent1.id,
          content:
            'Customer is on the business plan — should qualify for higher limits per policy doc.',
          isInternal: true,
        },
      ],
    },
    {
      subject: 'Data migration from old system',
      description:
        'We need to migrate 50,000 records from our legacy system. What format do you accept for bulk import?',
      priority: 'MEDIUM',
      category: 'TECHNICAL',
      status: 'IN_PROGRESS',
      customerId: user2.id,
      source: 'EMAIL',
      createdAt: daysAgo(4),
      assignTo: agent2.id,
      responses: [
        {
          userId: agent2.id,
          content:
            "We accept CSV and JSON formats for bulk import. I'll send you our import template.",
          isInternal: false,
        },
      ],
    },
    {
      subject: 'Custom report builder broken',
      description:
        'I am trying to create a custom report with date filters but the "Apply" button is greyed out.',
      priority: 'MEDIUM',
      category: 'BUG_REPORT',
      status: 'IN_PROGRESS',
      customerId: user1.id,
      source: 'WEB',
      createdAt: daysAgo(3),
      assignTo: agent1.id,
    },

    // --- OPEN tickets ---
    {
      subject: 'Need SSO integration with Okta',
      description:
        'Our company requires all tools to use Okta for single sign-on. Do you support SAML SSO?',
      priority: 'HIGH',
      category: 'FEATURE_REQUEST',
      status: 'OPEN',
      customerId: user2.id,
      source: 'WEB',
      createdAt: daysAgo(3),
      assignTo: agent2.id,
    },
    {
      subject: 'Notification emails going to spam',
      description:
        'All ticket notification emails end up in my spam folder in Gmail.',
      priority: 'MEDIUM',
      category: 'TECHNICAL',
      status: 'OPEN',
      customerId: user1.id,
      source: 'WEB',
      createdAt: daysAgo(2),
      assignTo: agent1.id,
    },
    {
      subject: 'Unable to attach ZIP files',
      description:
        'I get an error "Unsupported file type" when trying to attach a .zip file to my ticket.',
      priority: 'LOW',
      category: 'BUG_REPORT',
      status: 'OPEN',
      customerId: user2.id,
      source: 'WEB',
      createdAt: daysAgo(2),
    },

    // --- WAITING tickets ---
    {
      subject: 'Invoice discrepancy for March',
      description:
        'My March invoice shows $299 but my plan is $199/month. Please explain the extra charge.',
      priority: 'HIGH',
      category: 'BILLING',
      status: 'WAITING_FOR_CUSTOMER',
      customerId: user1.id,
      source: 'EMAIL',
      createdAt: daysAgo(6),
      assignTo: agent2.id,
      responses: [
        {
          userId: agent2.id,
          content:
            'The extra $100 charge is for the add-on module you activated on March 5th. Would you like me to send details?',
          isInternal: false,
        },
      ],
    },
    {
      subject: 'Webhook delivery failures',
      description:
        'Our webhook endpoint is receiving duplicate events and some events seem to be missing.',
      priority: 'URGENT',
      category: 'TECHNICAL',
      status: 'WAITING_FOR_INTERNAL',
      customerId: user2.id,
      source: 'WEB',
      createdAt: daysAgo(4),
      assignTo: agent1.id,
      responses: [
        {
          userId: agent1.id,
          content:
            "I've escalated this to the engineering team for investigation.",
          isInternal: false,
        },
        {
          userId: agent1.id,
          content:
            'Engineering ticket #ENG-4521 created. Looks like a queue delivery issue.',
          isInternal: true,
        },
      ],
    },

    // --- NEW tickets (most recent, unassigned) ---
    {
      subject: 'How to set up automated responses?',
      description:
        'I want to configure auto-reply messages for new tickets. Where can I find this setting?',
      priority: 'LOW',
      category: 'GENERAL',
      status: 'NEW',
      customerId: user1.id,
      source: 'WEB',
      createdAt: hoursAgo(12),
    },
    {
      subject: 'Mobile app not syncing',
      description:
        'The mobile app shows old data. New tickets created on the web dont appear on mobile even after refreshing.',
      priority: 'MEDIUM',
      category: 'BUG_REPORT',
      status: 'NEW',
      customerId: user2.id,
      source: 'WEB',
      createdAt: hoursAgo(8),
    },
    {
      subject: 'Account locked after failed login attempts',
      description:
        'I tried logging in 5 times with the wrong password and now my account is locked. How do I unlock it?',
      priority: 'HIGH',
      category: 'TECHNICAL',
      status: 'NEW',
      customerId: user1.id,
      source: 'WEB',
      createdAt: hoursAgo(4),
    },
    {
      subject: 'Request for team management features',
      description:
        'We need the ability to create teams and assign tickets to a team rather than individual agents.',
      priority: 'MEDIUM',
      category: 'FEATURE_REQUEST',
      status: 'NEW',
      customerId: user2.id,
      source: 'WEB',
      createdAt: hoursAgo(2),
    },
    {
      subject: 'Print ticket view not formatted correctly',
      description:
        'When I print a ticket, the layout is broken and text overflows off the page.',
      priority: 'LOW',
      category: 'BUG_REPORT',
      status: 'NEW',
      customerId: user1.id,
      source: 'WEB',
      createdAt: hoursAgo(1),
    },
    {
      subject: 'Urgent: Production system down',
      description:
        'Our production environment is completely unresponsive. All API calls return 503. This is affecting all our customers.',
      priority: 'URGENT',
      category: 'TECHNICAL',
      status: 'NEW',
      customerId: user2.id,
      source: 'WEB',
      createdAt: hoursAgo(0.5),
    },
  ];

  console.log('📝 Creating tickets...');

  for (const seed of ticketSeeds) {
    const ticket = await prisma.ticket.create({
      data: {
        subject: seed.subject,
        description: seed.description,
        priority: seed.priority,
        category: seed.category,
        status: seed.status,
        customerId: seed.customerId,
        source: seed.source,
        createdAt: seed.createdAt,
        resolvedAt: seed.resolvedAt,
        closedAt: seed.closedAt,
      },
    });

    if (seed.assignTo) {
      await prisma.ticketAssignment.create({
        data: { ticketId: ticket.id, agentId: seed.assignTo },
      });
    }

    if (seed.responses) {
      for (const resp of seed.responses) {
        await prisma.response.create({
          data: {
            ticketId: ticket.id,
            userId: resp.userId,
            content: resp.content,
            isInternal: resp.isInternal,
          },
        });
      }
    }

    if (seed.rating) {
      await prisma.rating.create({
        data: {
          ticketId: ticket.id,
          userId: seed.customerId,
          score: seed.rating,
          feedback: seed.rating >= 4 ? 'Great support!' : 'Could be faster.',
        },
      });
    }

    console.log(
      `  ✅ #${ticket.ticketNumber} — ${seed.subject.substring(0, 50)} [${seed.status}]`
    );
  }

  console.log(`\n✅ ${ticketSeeds.length} tickets created`);

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
