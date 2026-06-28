import { paginationQuerySchema, updateReviewSchema } from '@/lib/validation';
import { reviewService } from '@/lib/services/review-service';
import { requireUser } from '@/lib/auth';
import { apiHandler, parseJson, parseQuery, unwrapResult } from '@/lib/api/handler';

type Params = { params: Promise<{ id: string }> };

/** GET treats the param as a userId → lists reviews received by that user. */
export async function GET(request: Request, { params }: Params) {
  return apiHandler(async () => {
    const { id } = await params;
    const { page, pageSize } = parseQuery(request, paginationQuerySchema);
    return reviewService.listForUser(id, page, pageSize);
  });
}

/** PATCH/DELETE treat the param as a reviewId. */
export async function PATCH(request: Request, { params }: Params) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    const { id } = await params;
    const input = await parseJson(request, updateReviewSchema);
    return unwrapResult(await reviewService.update(session.id, id, input));
  });
}

export async function DELETE(request: Request, { params }: Params) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    const { id } = await params;
    const isAdmin = ['ADMIN', 'SUPERADMIN', 'MODERATOR'].includes(session.role);
    return unwrapResult(await reviewService.remove(session.id, id, isAdmin));
  });
}
