import { socialService } from '@/lib/services/social-service';
import { requireUser } from '@/lib/auth';
import { apiHandler, unwrapResult } from '@/lib/api/handler';

type Params = { params: Promise<{ activityId: string }> };

export async function POST(request: Request, { params }: Params) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    const { activityId } = await params;
    return unwrapResult(await socialService.save(session.id, activityId));
  });
}

export async function DELETE(request: Request, { params }: Params) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    const { activityId } = await params;
    return unwrapResult(await socialService.unsave(session.id, activityId));
  });
}
