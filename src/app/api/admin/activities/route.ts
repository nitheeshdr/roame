import { listActivitiesQuerySchema } from '@/lib/validation';
import { activityService } from '@/lib/services/activity-service';
import { requireModerator } from '@/lib/auth';
import { apiHandler, parseQuery } from '@/lib/api/handler';

export async function GET(request: Request) {
  return apiHandler(async () => {
    await requireModerator(request);
    const query = parseQuery(request, listActivitiesQuerySchema);
    return activityService.adminList(query);
  });
}
