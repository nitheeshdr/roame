import { updateFaqSchema } from '@/lib/validation';
import { contentService } from '@/lib/services/content-service';
import { requireAdmin } from '@/lib/auth';
import { apiHandler, parseJson, unwrapResult } from '@/lib/api/handler';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  return apiHandler(async () => {
    await requireAdmin();
    const { id } = await params;
    const input = await parseJson(request, updateFaqSchema);
    return unwrapResult(await contentService.updateFaq(id, input));
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return apiHandler(async () => {
    await requireAdmin();
    const { id } = await params;
    return unwrapResult(await contentService.deleteFaq(id));
  });
}
