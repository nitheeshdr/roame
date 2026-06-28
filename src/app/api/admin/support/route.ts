import { z } from 'zod';
import { contentService } from '@/lib/services/content-service';
import { requireAdmin } from '@/lib/auth';
import { apiHandler, parseQuery } from '@/lib/api/handler';

const querySchema = z.object({
  status: z.enum(['OPEN', 'PENDING', 'RESOLVED', 'CLOSED']).optional(),
});

export async function GET(request: Request) {
  return apiHandler(async () => {
    await requireAdmin();
    const { status } = parseQuery(request, querySchema);
    return { data: await contentService.adminTickets(status) };
  });
}
