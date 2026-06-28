import { subscriptionService } from '@/lib/services/commerce-service';
import { apiHandler } from '@/lib/api/handler';

export async function GET() {
  return apiHandler(async () => ({ data: await subscriptionService.plans() }));
}
