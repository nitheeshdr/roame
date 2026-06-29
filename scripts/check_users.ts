import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Querying database...');
  try {
    const userCount = await prisma.user.count();
    console.log(`Total users in DB: ${userCount}`);

    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'SUPERADMIN'],
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        passwordHash: true,
      },
    });

    console.log('Admins in DB:', JSON.stringify(admins, null, 2));
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
