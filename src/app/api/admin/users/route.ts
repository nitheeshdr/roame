import { userListQuerySchema } from '@/lib/validation';
import { userService } from '@/lib/services/user-service';
import { requireAdmin } from '@/lib/auth';
import { apiHandler, parseQuery } from '@/lib/api/handler';

export async function GET(request: Request) {
  return apiHandler(async () => {
    await requireAdmin();
    const query = parseQuery(request, userListQuerySchema);
    return userService.list(query);
  });
}
