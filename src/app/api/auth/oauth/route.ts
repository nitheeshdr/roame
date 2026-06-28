import { oauthCallbackSchema } from '@/lib/validation';
import { authService } from '@/lib/services/auth-service';
import { setSessionCookie, signSession } from '@/lib/auth';
import { apiHandler, parseJson, unwrapResult } from '@/lib/api/handler';

/** Google/Apple sign-in. Alias: POST /api/auth/google posts here with provider GOOGLE. */
export async function POST(request: Request) {
  return apiHandler(async () => {
    const input = await parseJson(request, oauthCallbackSchema);
    const user = unwrapResult(await authService.oauthLogin(input));
    await setSessionCookie(user);
    const token = await signSession(user);
    return { ok: true, user, token };
  });
}
