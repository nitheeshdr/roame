import { subscriptionService } from '@/lib/services/commerce-service';
import { requireUser } from '@/lib/auth';
import { apiHandler, unwrapResult } from '@/lib/api/handler';

export async function DELETE(request: Request) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    return unwrapResult(await subscriptionService.cancel(session.id));
  });
}
