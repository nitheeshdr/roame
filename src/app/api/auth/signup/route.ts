import { signupSchema } from '@/lib/validation';
import { authService } from '@/lib/services/auth-service';
import { setSessionCookie, signSession } from '@/lib/auth';
import { apiHandler, parseJson, unwrapResult } from '@/lib/api/handler';

export async function POST(request: Request) {
  return apiHandler(async () => {
    const input = await parseJson(request, signupSchema);
    const user = unwrapResult(await authService.signup(input));
    await setSessionCookie(user);
    const token = await signSession(user);
    return { ok: true, user, token };
  }, { status: 201 });
}
