import { adminLoginSchema } from '@/lib/validation';
import { authService } from '@/lib/services/auth-service';
import { setSessionCookie, signSession } from '@/lib/auth';
import { apiHandler, parseJson, unwrapResult } from '@/lib/api/handler';

/** General email/password login (consumer + admin). Returns a bearer token. */
export async function POST(request: Request) {
  return apiHandler(async () => {
    const input = await parseJson(request, adminLoginSchema);
    const user = unwrapResult(await authService.login(input));
    await setSessionCookie(user);
    const token = await signSession(user);
    return { ok: true, user, token };
  });
}
