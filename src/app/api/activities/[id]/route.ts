import { updateActivitySchema } from '@/lib/validation';
import { activityService } from '@/lib/services/activity-service';
import { getSessionFromRequest, requireUser } from '@/lib/auth';
import { apiHandler, parseJson, unwrapResult } from '@/lib/api/handler';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  return apiHandler(async () => {
    const { id } = await params;
    const viewer = await getSessionFromRequest(request);
    return activityService.getById(id, viewer?.id);
  });
}

export async function PATCH(request: Request, { params }: Params) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    const { id } = await params;
    const input = await parseJson(request, updateActivitySchema);
    return unwrapResult(await activityService.update(session.id, id, input));
  });
}

export async function DELETE(request: Request, { params }: Params) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    const { id } = await params;
    return unwrapResult(await activityService.remove(session.id, id));
  });
}
