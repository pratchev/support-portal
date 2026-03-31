import { PrismaClient } from '../../node_modules/.prisma/client/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { logger } from '@/utils/logger';

const connectionString = process.env.DATABASE_URL || '';
const adapter = new PrismaPg(connectionString);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Handle graceful shutdown
process.on('beforeExit', async () => {
  logger.info('Disconnecting from database...');
  await prisma.$disconnect();
});

export default prisma;
