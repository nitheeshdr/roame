import { prisma } from '@/lib/db';
import { paginationQuerySchema } from '@/lib/validation';
import { requireUser } from '@/lib/auth';
import { buildPageResult } from '@/lib/utils';
import { apiHandler, parseQuery } from '@/lib/api/handler';

export async function GET(request: Request) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    const { page, pageSize } = parseQuery(request, paginationQuerySchema);
    const where = { userId: session.id };
    const [data, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.payment.count({ where }),
    ]);
    return buildPageResult(data, total, { page, pageSize });
  });
}
