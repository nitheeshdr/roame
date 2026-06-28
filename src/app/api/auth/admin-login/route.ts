import { adminLoginSchema } from '@/lib/validation';
import { authService } from '@/lib/services/auth-service';
import { setSessionCookie } from '@/lib/auth';
import { apiHandler, parseJson, unwrapResult } from '@/lib/api/handler';

export async function POST(request: Request) {
  return apiHandler(async () => {
    const input = await parseJson(request, adminLoginSchema);
    const user = unwrapResult(await authService.adminLogin(input));
    await setSessionCookie(user);
    return { ok: true, user };
  });
}
