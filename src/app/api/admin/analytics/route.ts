import { analyticsService } from '@/lib/services/analytics-service';
import { requireAdmin } from '@/lib/auth';
import { apiHandler } from '@/lib/api/handler';

export async function GET() {
  return apiHandler(async () => {
    await requireAdmin();
    return analyticsService.summary();
  });
}
