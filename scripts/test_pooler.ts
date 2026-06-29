import { PrismaClient } from '@prisma/client';

const regions = [
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-northeast-3',
  'ap-south-1',
  'ca-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'eu-central-1',
  'eu-north-1',
  'sa-east-1',
];

async function testConnection(region: string) {
  const host = `aws-1-${region}.pooler.supabase.com`;
  const url = `postgresql://postgres.drvkdrtgcahoxxwyuiyo:IX0efCbGpILbpgCK@${host}:6543/postgres?pgbouncer=true&connection_limit=1`;
  
  process.env.DATABASE_URL = url;
  console.log(`Testing connection to ${region} (${host})...`);
  
  const prisma = new PrismaClient();
  try {
    const userCount = await prisma.user.count();
    console.log(`✅ SUCCESS: Connected to database via ${region}! (User count: ${userCount})`);
    await prisma.$disconnect();
    return true;
  } catch (err: any) {
    const msg = err.message.split('\n')[0] || err.message;
    console.log(`❌ FAILED: ${region} - ${msg}`);
    await prisma.$disconnect();
    return false;
  }
}

async function main() {
  for (const region of regions) {
    const success = await testConnection(region);
    if (success) {
      console.log(`\nFound working pooler URL:\npostgresql://postgres.drvkdrtgcahoxxwyuiyo:IX0efCbGpILbpgCK@aws-1-${region}.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`);
      break;
    }
  }
}

main();
