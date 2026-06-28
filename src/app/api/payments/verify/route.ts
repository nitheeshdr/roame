import { verifyPaymentSchema } from '@/lib/validation';
import { paymentsAdapter } from '@/lib/integrations/payments';
import { requireUser } from '@/lib/auth';
import { apiHandler, parseJson } from '@/lib/api/handler';

export async function POST(request: Request) {
  return apiHandler(async () => {
    await requireUser(request);
    const input = await parseJson(request, verifyPaymentSchema);
    return paymentsAdapter.verify(input);
  });
}
