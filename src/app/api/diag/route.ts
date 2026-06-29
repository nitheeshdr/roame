import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const envInfo = {
    DATABASE_URL: process.env.DATABASE_URL
      ? `Present (length: ${process.env.DATABASE_URL.length})`
      : 'Missing',
    DIRECT_URL: process.env.DIRECT_URL
      ? `Present (length: ${process.env.DIRECT_URL.length})`
      : 'Missing',
    AUTH_SESSION_SECRET: process.env.AUTH_SESSION_SECRET
      ? `Present (length: ${process.env.AUTH_SESSION_SECRET.length})`
      : 'Missing',
    AUTH_PROVIDER: process.env.AUTH_PROVIDER || 'Missing (default will be mock)',
    NODE_ENV: process.env.NODE_ENV || 'Missing',
  };

  let dbStatus = 'Not tested';
  let dbError: any = null;
  let userCount = -1;

  try {
    const prisma = new PrismaClient();
    userCount = await prisma.user.count();
    dbStatus = 'Successfully connected';
  } catch (err: any) {
    dbStatus = 'Failed to connect';
    dbError = {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code,
      meta: err.meta,
    };
  }

  return NextResponse.json({
    status: 'ok',
    envInfo,
    dbStatus,
    dbError,
    userCount,
  });
}
