import { notificationService } from '@/lib/services/notification-service';
import { requireUser } from '@/lib/auth';
import { apiHandler, unwrapResult } from '@/lib/api/handler';

export async function PATCH(request: Request) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    return unwrapResult(await notificationService.markAllRead(session.id));
  });
}
