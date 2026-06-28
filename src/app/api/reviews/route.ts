import { createReviewSchema } from '@/lib/validation';
import { reviewService } from '@/lib/services/review-service';
import { requireUser } from '@/lib/auth';
import { apiHandler, parseJson, unwrapResult } from '@/lib/api/handler';

export async function POST(request: Request) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    const input = await parseJson(request, createReviewSchema);
    return unwrapResult(await reviewService.create(session.id, input));
  }, { status: 201 });
}
