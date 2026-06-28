import { subscriptionService } from '@/lib/services/commerce-service';
import { requireUser } from '@/lib/auth';
import { apiHandler } from '@/lib/api/handler';

export async function GET(request: Request) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    return { subscription: await subscriptionService.current(session.id) };
  });
}
