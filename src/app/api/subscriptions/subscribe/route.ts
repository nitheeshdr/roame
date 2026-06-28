import { subscribeSchema } from '@/lib/validation';
import { subscriptionService } from '@/lib/services/commerce-service';
import { requireUser } from '@/lib/auth';
import { apiHandler, parseJson, unwrapResult } from '@/lib/api/handler';

export async function POST(request: Request) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    const input = await parseJson(request, subscribeSchema);
    return unwrapResult(await subscriptionService.subscribe(session.id, input));
  }, { status: 201 });
}
