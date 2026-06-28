import { auditLogQuerySchema } from '@/lib/validation';
import { auditService } from '@/lib/services/audit-service';
import { requireAdmin } from '@/lib/auth';
import { apiHandler, parseQuery } from '@/lib/api/handler';

export async function GET(request: Request) {
  return apiHandler(async () => {
    await requireAdmin();
    const query = parseQuery(request, auditLogQuerySchema);
    const { rows, total } = await auditService.list(query);
    return { data: rows, total, page: query.page, pageSize: query.pageSize };
  });
}
