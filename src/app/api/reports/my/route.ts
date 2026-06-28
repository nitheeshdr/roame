import { paginationQuerySchema } from '@/lib/validation';
import { reportService } from '@/lib/services/report-service';
import { requireUser } from '@/lib/auth';
import { apiHandler, parseQuery } from '@/lib/api/handler';

export async function GET(request: Request) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    const { page, pageSize } = parseQuery(request, paginationQuerySchema);
    return reportService.mine(session.id, page, pageSize);
  });
}
