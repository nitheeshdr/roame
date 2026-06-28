import { requireUser } from '@/lib/auth';
import { apiHandler } from '@/lib/api/handler';

/** Returns the current session principal (id, role, status, display name). */
export async function GET(request: Request) {
  return apiHandler(async () => {
    const user = await requireUser(request);
    return { user };
  });
}
