import { listActivitiesQuerySchema } from '@/lib/validation';
import { activityService } from '@/lib/services/activity-service';
import { requireModerator } from '@/lib/auth';
import { apiHandler, parseQuery } from '@/lib/api/handler';

export async function GET(request: Request) {
  return apiHandler(async () => {
    await requireModerator(request);
    const query = parseQuery(request, listActivitiesQuerySchema);
    // Admin view ignores the public visibility/status narrowing where possible.
    return activityService.list(query);
  });
}
