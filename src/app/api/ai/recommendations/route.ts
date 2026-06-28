import { aiAdapter } from '@/lib/integrations/ai';
import { requireUser } from '@/lib/auth';
import { apiHandler } from '@/lib/api/handler';

export async function POST(request: Request) {
  return apiHandler(async () => {
    await requireUser(request);
    return aiAdapter.recommendActivities(15);
  });
}
