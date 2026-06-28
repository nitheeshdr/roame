import { createActivitySchema, listActivitiesQuerySchema } from '@/lib/validation';
import { activityService } from '@/lib/services/activity-service';
import { requireUser } from '@/lib/auth';
import { apiHandler, parseJson, parseQuery, unwrapResult } from '@/lib/api/handler';

export async function GET(request: Request) {
  return apiHandler(async () => {
    const query = parseQuery(request, listActivitiesQuerySchema);
    return activityService.list(query);
  });
}

export async function POST(request: Request) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    const input = await parseJson(request, createActivitySchema);
    return unwrapResult(await activityService.create(session.id, input));
  }, { status: 201 });
}
