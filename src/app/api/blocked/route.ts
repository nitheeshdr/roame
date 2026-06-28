import { socialService } from '@/lib/services/social-service';
import { requireUser } from '@/lib/auth';
import { apiHandler } from '@/lib/api/handler';

export async function GET(request: Request) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    return { data: await socialService.blocked(session.id) };
  });
}
