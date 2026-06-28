import { badgeService } from '@/lib/badges';
import { requireUser } from '@/lib/auth';
import { apiHandler } from '@/lib/api/handler';

export async function GET(request: Request) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    return { data: await badgeService.earned(session.id) };
  });
}
