import { activityService } from '@/lib/services/activity-service';
import { requireModerator } from '@/lib/auth';
import { apiHandler, unwrapResult } from '@/lib/api/handler';

type Params = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, { params }: Params) {
  return apiHandler(async () => {
    const mod = await requireModerator(request);
    const { id } = await params;
    return unwrapResult(await activityService.remove(mod.id, id, true));
  });
}
