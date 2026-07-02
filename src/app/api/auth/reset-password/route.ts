import { resetPasswordSchema } from '@/lib/validation';
import { authService } from '@/lib/services/auth-service';
import { apiHandler, parseJson, unwrapResult } from '@/lib/api/handler';

export async function POST(request: Request) {
  return apiHandler(async () => {
    const input = await parseJson(request, resetPasswordSchema);
    return unwrapResult(await authService.resetPassword(input));
  });
}
