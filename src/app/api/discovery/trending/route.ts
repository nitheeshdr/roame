import { paginationQuerySchema } from '@/lib/validation';
import { activityService } from '@/lib/services/activity-service';
import { apiHandler, parseQuery } from '@/lib/api/handler';

export async function GET(request: Request) {
  return apiHandler(async () => {
    const { page, pageSize } = parseQuery(request, paginationQuerySchema);
    return activityService.trending(page, pageSize);
  });
}
