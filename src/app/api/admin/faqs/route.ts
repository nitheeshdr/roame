import { createFaqSchema } from '@/lib/validation';
import { contentService } from '@/lib/services/content-service';
import { requireAdmin } from '@/lib/auth';
import { apiHandler, parseJson, unwrapResult } from '@/lib/api/handler';

export async function POST(request: Request) {
  return apiHandler(async () => {
    await requireAdmin();
    const input = await parseJson(request, createFaqSchema);
    return unwrapResult(await contentService.createFaq(input));
  }, { status: 201 });
}
