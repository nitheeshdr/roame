import { z } from 'zod';
import { paymentsAdapter } from '@/lib/integrations/payments';
import { requireUser } from '@/lib/auth';
import { apiHandler, parseJson } from '@/lib/api/handler';

const refundSchema = z.object({ paymentId: z.string().min(1), amountCents: z.number().int().positive().optional() });

export async function POST(request: Request) {
  return apiHandler(async () => {
    await requireUser(request);
    const { paymentId, amountCents } = await parseJson(request, refundSchema);
    return paymentsAdapter.refund(paymentId, amountCents);
  });
}
