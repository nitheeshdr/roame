import { otpVerifySchema } from '@/lib/validation';
import { authService } from '@/lib/services/auth-service';
import { setSessionCookie, signSession } from '@/lib/auth';
import { apiHandler, parseJson, unwrapResult } from '@/lib/api/handler';

export async function POST(request: Request) {
  return apiHandler(async () => {
    const input = await parseJson(request, otpVerifySchema);
    const user = unwrapResult(await authService.verifyOtp(input));
    await setSessionCookie(user);
    // Also return a bearer token so mobile/API clients can authenticate.
    const token = await signSession(user);
    return { ok: true, user, token };
  });
}
