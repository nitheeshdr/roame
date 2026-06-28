import { z } from 'zod';
import { paginationQuerySchema } from '@/lib/validation';
import { reportService } from '@/lib/services/report-service';
import { requireModerator } from '@/lib/auth';
import { apiHandler, parseQuery } from '@/lib/api/handler';

const querySchema = paginationQuerySchema.extend({
  status: z.enum(['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED']).optional(),
});

export async function GET(request: Request) {
  return apiHandler(async () => {
    await requireModerator(request);
    const { page, pageSize, status } = parseQuery(request, querySchema);
    return reportService.adminList(status, page, pageSize);
  });
}
