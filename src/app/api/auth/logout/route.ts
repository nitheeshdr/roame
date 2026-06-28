import { clearSessionCookie, getSession } from '@/lib/auth';
import { auditService } from '@/lib/services/audit-service';
import { apiHandler } from '@/lib/api/handler';

export async function POST() {
  return apiHandler(async () => {
    const session = await getSession();
    if (session) {
      await auditService.record({
        actorId: session.id,
        action: 'LOGOUT',
        entityType: 'AdminUser',
        entityId: session.id,
      });
    }
    await clearSessionCookie();
    return { ok: true };
  });
}
