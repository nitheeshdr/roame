import { z } from 'zod';
import { paginationQuerySchema } from '@/lib/validation';
import { notificationService } from '@/lib/services/notification-service';
import { requireUser } from '@/lib/auth';
import { apiHandler, parseQuery } from '@/lib/api/handler';

const querySchema = paginationQuerySchema.extend({ unreadOnly: z.coerce.boolean().default(false) });

export async function GET(request: Request) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    const { page, pageSize, unreadOnly } = parseQuery(request, querySchema);
    return notificationService.list(session.id, page, pageSize, unreadOnly);
  });
}
