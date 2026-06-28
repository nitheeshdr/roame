import { z } from 'zod';
import { contentService } from '@/lib/services/content-service';
import { requireAdmin } from '@/lib/auth';
import { apiHandler, parseJson, unwrapResult } from '@/lib/api/handler';

type Params = { params: Promise<{ id: string }> };
const patchSchema = z.object({ status: z.enum(['OPEN', 'PENDING', 'RESOLVED', 'CLOSED']) });

export async function PATCH(request: Request, { params }: Params) {
  return apiHandler(async () => {
    const admin = await requireAdmin();
    const { id } = await params;
    const { status } = await parseJson(request, patchSchema);
    return unwrapResult(await contentService.updateTicket(admin, id, status));
  });
}
