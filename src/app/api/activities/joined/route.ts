import { paginationQuerySchema } from '@/lib/validation';
import { activityService } from '@/lib/services/activity-service';
import { requireUser } from '@/lib/auth';
import { apiHandler, parseQuery } from '@/lib/api/handler';

export async function GET(request: Request) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    const { page, pageSize } = parseQuery(request, paginationQuerySchema);
    return activityService.mine(session.id, 'joined', page, pageSize);
  });
}
