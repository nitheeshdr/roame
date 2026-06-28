import { analyticsEventSchema } from '@/lib/validation';
import { analyticsService } from '@/lib/services/analytics-service';
import { getSessionFromRequest } from '@/lib/auth';
import { apiHandler, parseJson, unwrapResult } from '@/lib/api/handler';

/** Ingest an analytics event. Works for anonymous and authenticated clients. */
export async function POST(request: Request) {
  return apiHandler(async () => {
    const session = await getSessionFromRequest(request);
    const input = await parseJson(request, analyticsEventSchema);
    return unwrapResult(await analyticsService.track(session?.id ?? null, input));
  }, { status: 202 });
}
