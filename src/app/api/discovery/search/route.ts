import { searchActivitiesQuerySchema } from '@/lib/validation';
import { activityService } from '@/lib/services/activity-service';
import { apiHandler, parseQuery } from '@/lib/api/handler';

export async function GET(request: Request) {
  return apiHandler(async () => {
    const query = parseQuery(request, searchActivitiesQuerySchema);
    return activityService.search(query);
  });
}
