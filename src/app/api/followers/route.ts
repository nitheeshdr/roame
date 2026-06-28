import { paginationQuerySchema } from '@/lib/validation';
import { socialService } from '@/lib/services/social-service';
import { requireUser } from '@/lib/auth';
import { apiHandler, parseQuery } from '@/lib/api/handler';

export async function GET(request: Request) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    const { page, pageSize } = parseQuery(request, paginationQuerySchema);
    return socialService.followers(session.id, page, pageSize);
  });
}
