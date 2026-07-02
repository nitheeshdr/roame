import { forgotPasswordSchema } from '@/lib/validation';
import { authService } from '@/lib/services/auth-service';
import { apiHandler, parseJson } from '@/lib/api/handler';

export async function POST(request: Request) {
  return apiHandler(async () => {
    const { email } = await parseJson(request, forgotPasswordSchema);
    return authService.requestPasswordReset(email);
  });
}
