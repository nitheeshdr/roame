import { otpRequestSchema } from '@/lib/validation';
import { authService } from '@/lib/services/auth-service';
import { apiHandler, parseJson, unwrapResult } from '@/lib/api/handler';

export async function POST(request: Request) {
  return apiHandler(async () => {
    const input = await parseJson(request, otpRequestSchema);
    const { expiresAt } = unwrapResult(await authService.requestOtp(input));
    return { ok: true, expiresAt };
  });
}
