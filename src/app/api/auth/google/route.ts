import { z } from 'zod';
import { authService } from '@/lib/services/auth-service';
import { setSessionCookie, signSession } from '@/lib/auth';
import { apiHandler, parseJson, unwrapResult } from '@/lib/api/handler';

const googleSchema = z.object({ credential: z.string().min(1) });

/** Real Google Sign-In: `credential` is the id_token from Google Identity Services. */
export async function POST(request: Request) {
  return apiHandler(async () => {
    const { credential } = await parseJson(request, googleSchema);
    const user = unwrapResult(await authService.googleLogin(credential));
    await setSessionCookie(user);
    const token = await signSession(user);
    return { ok: true, user, token };
  });
}
