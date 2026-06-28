import { PrismaClient } from '@prisma/client';

export * from '@prisma/client';

/**
 * Singleton Prisma client. Next.js dev hot-reload would otherwise create a new
 * client on every reload and exhaust DB connections, so we cache it on
 * globalThis in non-production.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
